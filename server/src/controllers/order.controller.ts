import { Request, Response } from 'express';
import { store } from '../db/store.js';
import { CommissionService } from '../services/commission.service.js';
import { WhatsAppService } from '../services/whatsapp.service.js';
import { PostExService } from '../services/postex.service.js';
import { AuditService } from '../services/audit.service.js';
import type { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import type { IOrder, IOrderItem, OrderStatus, IReseller } from '../../src/types/index.js';

export class OrderController {
  /**
   * Helper to calculate delivery charge based on number of suits and settings
   */
  public static calculateDeliveryCharge(totalQuantity: number): number {
    const shipping = store.settings?.shipping || {
      singleSuitFee: 300,
      twoSuitsFee: 400,
      threeSuitsBaseFee: 450,
      additionalSuitFee: 50,
    };

    if (totalQuantity <= 1) return shipping.singleSuitFee;
    if (totalQuantity === 2) return shipping.twoSuitsFee;
    return shipping.threeSuitsBaseFee + (totalQuantity - 3) * shipping.additionalSuitFee;
  }

  /**
   * Helper to calculate per-thousand charge based on settings
   */
  public static calculatePerThousandCharge(subtotal: number): number {
    const extra = store.settings?.extraCharge;
    if (!extra || !extra.enabled) return 0;
    const rate = extra.ratePerThousand || 50;
    const units = Math.ceil(subtotal / 1000);
    return units * rate;
  }

  /**
   * Helper to generate human-friendly unique order number
   */
  private static generateOrderNumber(): string {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}${mm}${dd}`;

    const todaysCount = store.orders.filter((o) => o.orderNumber.includes(dateStr)).length + 1;
    const sequence = String(todaysCount).padStart(4, '0');
    return `ORD-${dateStr}-${sequence}`;
  }

  /**
   * Public Order Creation (Checkout)
   */
  public static async createOrder(req: Request, res: Response): Promise<void> {
    const { customer, items, resellerCode, referralSource, couponCode, notes } = req.body;

    if (!customer || !customer.fullName || !customer.phone || !customer.address || !customer.city) {
      res.status(400).json({ error: 'Please provide complete customer name, phone number, address, and city.' });
      return;
    }

    if (!Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: 'Cart is empty. Please add items to checkout.' });
      return;
    }

    // 1. Re-fetch current database prices & validate stock (never trust frontend price)
    let validatedItems: IOrderItem[] = [];
    let subtotal = 0;
    let totalSuitsCount = 0;

    for (const item of items) {
      const product = store.products.find((p) => p._id === item.productId && p.status === 'active');
      if (!product) {
        res.status(400).json({ error: `Product '${item.name || 'Unknown'}' is no longer available.` });
        return;
      }

      const qty = Math.max(1, parseInt(item.quantity || 1, 10));
      if (product.stock < qty) {
        res.status(400).json({
          error: `Insufficient stock for '${product.name}'. Available: ${product.stock}, requested: ${qty}.`,
        });
        return;
      }

      const itemTotal = product.retailPrice * qty;
      subtotal += itemTotal;
      totalSuitsCount += qty;

      validatedItems.push({
        productId: product._id,
        name: product.name,
        slug: product.slug,
        sku: product.sku,
        image: product.images[0] || '',
        size: item.size || product.sizes[0] || 'Standard',
        color: item.color || product.color,
        quantity: qty,
        price: product.retailPrice, // Fresh verified price snapshot
        wholesaleCostSnapshot: product.wholesaleCost, // Internal snapshot
      });

      // Decrement stock
      product.stock -= qty;
      if (product.stock <= 0) {
        product.stockState = 'out_of_stock';
      }
    }

    // 2. Server-side delivery charge calculation
    const deliveryFee = OrderController.calculateDeliveryCharge(totalSuitsCount);

    // 3. Server-side per-thousand charge calculation
    const perThousandCharge = OrderController.calculatePerThousandCharge(subtotal);

    // 4. Server-side coupon validation
    let discount = 0;
    if (couponCode) {
      const formattedCode = String(couponCode).trim().toUpperCase();
      const coupon = store.coupons.find(
        (c) => c.code.toUpperCase() === formattedCode && c.active
      );
      if (coupon) {
        const isNotExpired = !coupon.endDate || new Date(coupon.endDate) >= new Date();
        const underLimit = !coupon.usageLimit || coupon.usedCount < coupon.usageLimit;
        const userKey = (customer.phone || customer.email || '').replace(/[^a-zA-Z0-9]/g, '');
        const underUserLimit = !coupon.userUsageLimit || !userKey || ((coupon.userUsage?.[userKey] || 0) < coupon.userUsageLimit);

        if (isNotExpired && underLimit && underUserLimit && subtotal >= coupon.minimumSubtotal) {
          if (coupon.type === 'percentage') {
            discount = Math.round((subtotal * coupon.amount) / 100);
            if (coupon.maxDiscount && coupon.amount < 100) {
              discount = Math.min(discount, coupon.maxDiscount);
            }
          } else {
            discount = Math.min(subtotal, coupon.amount);
          }
          coupon.usedCount += 1;
          if (userKey) {
            coupon.userUsage = coupon.userUsage || {};
            coupon.userUsage[userKey] = (coupon.userUsage[userKey] || 0) + 1;
          }
        }
      }
    }

    // 4.5. Generate order number and mark matching abandoned cart as completed
    const orderNumber = OrderController.generateOrderNumber();
    const cartToken = req.body.cartToken;
    const cleanCustomerPhone = (customer.phone || '').replace(/[^0-9]/g, '');
    const matchingCarts = store.abandonedCarts.filter(
      (c) =>
        (cartToken && c.token === cartToken) ||
        (cleanCustomerPhone && c.customerPhone && c.customerPhone.replace(/[^0-9]/g, '') === cleanCustomerPhone)
    );
    for (const ac of matchingCarts) {
      ac.orderCompleted = true;
      ac.orderNumber = orderNumber;
    }

    const total = subtotal + deliveryFee + perThousandCharge - discount;

    // 5. Reseller attribution validation (Strict backend verification)
    let attributedReseller: IReseller | null = null;
    let validResellerId: string | null = null;
    let validResellerCode: string | null = null;

    if (resellerCode) {
      const candidate = store.resellers.find(
        (r) => r.code.toUpperCase() === String(resellerCode).trim().toUpperCase() && r.status === 'approved'
      );
      if (candidate) {
        attributedReseller = candidate;
        validResellerId = candidate._id;
        validResellerCode = candidate.code;
        candidate.totalOrders = (candidate.totalOrders || 0) + 1;
      }
    }

    // 6. Pre-assign courier tracking number
    const postexTrackingNumber = PostExService.generateTrackingNumber();
    const now = new Date().toISOString();

    const newOrder: IOrder = {
      _id: store.generateId(),
      orderNumber,
      customer: {
        fullName: customer.fullName.trim(),
        phone: customer.phone.trim(),
        whatsapp: customer.whatsapp ? customer.whatsapp.trim() : customer.phone.trim(),
        email: customer.email?.trim(),
        address: customer.address.trim(),
        street: customer.street?.trim(),
        area: customer.area?.trim(),
        city: customer.city.trim(),
        province: customer.province?.trim() || 'Punjab',
        postalCode: customer.postalCode?.trim(),
      },
      items: validatedItems,
      subtotal,
      deliveryFee,
      perThousandCharge,
      discount,
      couponCode: discount > 0 ? couponCode : undefined,
      total,
      paymentMethod: 'COD',
      paymentStatus: 'pending',
      orderStatus: 'PENDING',
      statusHistory: [
        {
          oldStatus: 'PENDING',
          newStatus: 'PENDING',
          changedBy: 'System',
          changedByRole: 'SYSTEM',
          reason: 'Customer completed online checkout (Cash on Delivery)',
          timestamp: now,
        },
      ],
      resellerId: validResellerId,
      resellerCode: validResellerCode,
      referralSource: referralSource || (validResellerCode ? 'Referral Link' : 'Direct Website'),
      referralTimestamp: now,
      shipment: {
        carrier: 'Express Courier',
        trackingNumber: postexTrackingNumber,
        status: 'pending_pickup',
      },
      notes: notes?.trim(),
      createdAt: now,
      updatedAt: now,
    };

    store.orders.unshift(newOrder);

    // 7. Update or create customer directory record
    let customerDoc = store.customers.find((c) => c.phone === newOrder.customer.phone);
    if (customerDoc) {
      customerDoc.totalOrders += 1;
      customerDoc.totalSpend += total;
      customerDoc.address = newOrder.customer.address;
      customerDoc.city = newOrder.customer.city;
      customerDoc.updatedAt = now;
    } else {
      store.customers.push({
        _id: store.generateId(),
        fullName: newOrder.customer.fullName,
        phone: newOrder.customer.phone,
        whatsapp: newOrder.customer.whatsapp,
        email: newOrder.customer.email,
        address: newOrder.customer.address,
        city: newOrder.customer.city,
        province: newOrder.customer.province,
        totalOrders: 1,
        deliveredOrders: 0,
        cancelledOrders: 0,
        returnedOrders: 0,
        totalSpend: total,
        associatedResellerId: validResellerId,
        createdAt: now,
        updatedAt: now,
      });
    }

    // 8. Notifications
    store.notifications.push({
      _id: store.generateId(),
      recipientRole: 'SUPER_ADMIN',
      title: `New Order: ${newOrder.orderNumber}`,
      message: `${newOrder.customer.fullName} placed an order of Rs. ${newOrder.total.toLocaleString()}${validResellerCode ? ` (via Reseller ${validResellerCode})` : ''}.`,
      link: `/admin/orders/${newOrder._id}`,
      isRead: false,
      createdAt: now,
    });

    if (attributedReseller) {
      store.notifications.push({
        _id: store.generateId(),
        recipientRole: 'RESELLER',
        recipientResellerId: attributedReseller._id,
        title: `New Referred Order: ${newOrder.orderNumber}`,
        message: `A customer purchased through your link! Order ${newOrder.orderNumber} (Rs. ${newOrder.total.toLocaleString()}) has been attributed to you.`,
        link: `/reseller/orders`,
        isRead: false,
        createdAt: now,
      });
    }

    // 9. Dispatch WhatsApp order notification asynchronously
    const whatsappResult = await WhatsAppService.dispatchOrderNotification(newOrder, attributedReseller);

    store.saveToDisk();

    AuditService.log({
      actorId: 'CUSTOMER',
      actorName: newOrder.customer.fullName,
      actorRole: 'CUSTOMER',
      action: 'ORDER_PLACED',
      targetType: 'ORDER',
      targetId: newOrder._id,
      metadata: { orderNumber: newOrder.orderNumber, total: newOrder.total, resellerCode: validResellerCode },
      ip: req.ip,
    });

    // Strip private wholesale info before returning to customer
    const publicOrder = {
      ...newOrder,
      items: newOrder.items.map(({ wholesaleCostSnapshot, ...rest }: any) => rest),
      whatsappPrefilledLink: whatsappResult.link,
    };

    res.status(201).json({
      message: 'Order placed successfully! Cash on Delivery confirmed with Express Courier.',
      order: publicOrder,
    });
  }

  /**
   * Customer Order Tracking (Public)
   * Requires both Order Number AND Phone Number for privacy
   */
  public static async trackOrder(req: Request, res: Response): Promise<void> {
    const { orderNumber, phone } = req.body;

    if (!orderNumber || !phone) {
      res.status(400).json({ error: 'Please provide both your Order Number and Phone Number.' });
      return;
    }

    const cleanOrderNo = String(orderNumber).trim().toUpperCase();
    const cleanPhone = String(phone).replace(/[^0-9]/g, '');

    const order = store.orders.find((o) => {
      const oNum = o.orderNumber.toUpperCase();
      const oPhone = o.customer.phone.replace(/[^0-9]/g, '');
      return oNum === cleanOrderNo && (oPhone.endsWith(cleanPhone) || cleanPhone.endsWith(oPhone));
    });

    if (!order) {
      res.status(404).json({ error: 'Order not found. Please double-check your Order Number and Phone Number.' });
      return;
    }

    // Hide internal wholesale costs and internal notes
    const sanitizedOrder = {
      orderNumber: order.orderNumber,
      orderStatus: order.orderStatus,
      customer: {
        fullName: order.customer.fullName,
        city: order.customer.city,
        address: order.customer.address,
      },
      items: order.items.map((i: any) => ({
        name: i.name,
        quantity: i.quantity,
        size: i.size,
        color: i.color,
        price: i.price,
        image: i.image,
      })),
      subtotal: order.subtotal,
      deliveryFee: order.deliveryFee,
      perThousandCharge: order.perThousandCharge,
      discount: order.discount,
      total: order.total,
      paymentMethod: order.paymentMethod,
      shipment: {
        carrier: order.shipment.carrier,
        trackingNumber: order.shipment.trackingNumber,
        trackingUrl: order.shipment.trackingNumber ? PostExService.getTrackingUrl(order.shipment.trackingNumber) : undefined,
        status: order.shipment.status,
      },
      statusHistory: order.statusHistory.map((h: any) => ({
        status: h.newStatus,
        timestamp: h.timestamp,
        reason: h.reason,
      })),
      createdAt: order.createdAt,
    };

    res.json({ order: sanitizedOrder });
  }

  /**
   * Reseller Order Listing (Strict Reseller Isolation)
   */
  public static async getResellerOrders(req: AuthenticatedRequest, res: Response): Promise<void> {
    const resellerId = req.reseller!._id;
    // Strictly filter by authenticated reseller's ID
    const myOrders = store.orders.filter((o) => o.resellerId === resellerId);

    // Strip private wholesale costs
    const sanitized = myOrders.map((o) => {
      const { ...orderCopy } = o;
      const safeItems = orderCopy.items.map(({ wholesaleCostSnapshot, ...i }: any) => i);
      return { ...orderCopy, items: safeItems };
    });

    res.json({
      total: sanitized.length,
      orders: sanitized,
    });
  }

  /**
   * Reseller Update Order Status
   * Reseller manages standard lifecycle:
   * PENDING -> CONFIRMED -> PACKED -> SHIPPED -> OUT_FOR_DELIVERY -> DELIVERED
   */
  public static async updateOrderStatusByReseller(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { orderId } = req.params;
    const { newStatus, reason } = req.body;
    const reseller = req.reseller!;

    const order = store.orders.find((o) => o._id === orderId);
    if (!order) {
      res.status(404).json({ error: 'Order not found.' });
      return;
    }

    // STRICT RESELLER ISOLATION: Reseller can only update their own orders
    if (order.resellerId !== reseller._id) {
      res.status(403).json({ error: 'Unauthorized: You can only update orders attributed to your account.' });
      return;
    }

    const currentStatus = order.orderStatus;
    const allowedStatuses: OrderStatus[] = [
      'PENDING',
      'CONFIRMED',
      'PACKED',
      'SHIPPED',
      'OUT_FOR_DELIVERY',
      'DELIVERED',
      'CANCELLED',
      'RETURN_REQUESTED',
      'RETURNED',
    ];

    if (!allowedStatuses.includes(newStatus as OrderStatus)) {
      res.status(400).json({
        error: `Invalid status '${newStatus}'. Allowed: ${allowedStatuses.join(', ')}`,
      });
      return;
    }

    if (currentStatus === newStatus) {
      res.json({ message: `Order is already ${newStatus}.`, order });
      return;
    }

    const now = new Date().toISOString();
    order.orderStatus = newStatus as OrderStatus;
    order.updatedAt = now;

    order.statusHistory.push({
      oldStatus: currentStatus,
      newStatus: newStatus as OrderStatus,
      changedBy: reseller.fullName,
      changedByRole: 'RESELLER',
      reason: reason || `Status updated to ${newStatus} by reseller`,
      timestamp: now,
    });

    // If order was DELIVERED, trigger commission and bonus award!
    if (newStatus === 'DELIVERED') {
      order.paymentStatus = 'paid';
      if (order.shipment) {
        order.shipment.status = 'delivered';
        order.shipment.deliveredAt = now;
      }
      await CommissionService.handleOrderDelivered(order);
    } else if (newStatus === 'CANCELLED') {
      reseller.cancelledOrders = (reseller.cancelledOrders || 0) + 1;
      if (currentStatus === 'DELIVERED') {
        await CommissionService.handleOrderReversal(order, reason || 'Order cancelled by reseller');
      }
    } else if (currentStatus === 'DELIVERED' && (newStatus === 'RETURNED' || newStatus === 'RETURN_REQUESTED')) {
      await CommissionService.handleOrderReversal(order, reason || 'Order returned');
    }

    store.saveToDisk();

    AuditService.log({
      actorId: reseller._id,
      actorName: reseller.fullName,
      actorRole: 'RESELLER',
      action: 'ORDER_STATUS_UPDATED',
      targetType: 'ORDER',
      targetId: order._id,
      metadata: { oldStatus: currentStatus, newStatus, orderNumber: order.orderNumber },
      ip: req.ip,
    });

    res.json({
      message: `Order status successfully updated to ${newStatus}.`,
      order,
    });
  }

  /**
   * Super Admin View All Orders (with filters, search, analytics)
   * Note: Normal status editing is reserved for resellers; admin can view all or do emergency override.
   */
  public static async getAdminOrders(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { status, resellerId, search } = req.query;

    let list = [...store.orders];

    if (status) {
      list = list.filter((o) => o.orderStatus === status);
    }

    if (resellerId) {
      list = list.filter((o) => o.resellerId === resellerId);
    }

    if (search) {
      const q = String(search).toLowerCase().trim();
      list = list.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          o.customer.fullName.toLowerCase().includes(q) ||
          o.customer.phone.includes(q) ||
          (o.resellerCode && o.resellerCode.toLowerCase().includes(q)) ||
          o.items.some((i: any) => i.name.toLowerCase().includes(q) || i.sku.toLowerCase().includes(q))
      );
    }

    // Attach internal profit metrics for admin view
    const enriched = list.map((order) => {
      const wholesaleSubtotal = order.items.reduce(
        (acc: number, item: any) => acc + (item.wholesaleCostSnapshot || 0) * item.quantity,
        0
      );
      const grossMargin = order.subtotal - wholesaleSubtotal;
      const commissionCost = order.resellerId && order.orderStatus === 'DELIVERED' ? 300 : 0;
      const packagingCost = store.settings?.profitCosts.packagingCostPerOrder || 100;
      const codCost = store.settings?.profitCosts.codHandlingFee || 50;
      const netContribution = grossMargin + order.perThousandCharge - commissionCost - packagingCost - codCost;

      return {
        ...order,
        internalFinancials: {
          wholesaleSubtotal,
          grossMargin,
          commissionCost,
          packagingCost,
          codCost,
          netContribution,
        },
      };
    });

    res.json({
      total: enriched.length,
      orders: enriched,
    });
  }

  /**
   * Super Admin Emergency Status Override (Audited)
   */
  public static async adminEmergencyStatusOverride(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { orderId } = req.params;
    const { newStatus, emergencyReason, reason } = req.body;

    const rawReason = emergencyReason || reason || 'Super Admin manual status override';
    const auditReason = String(rawReason).trim();

    const order = store.orders.find((o) => o._id === orderId);
    if (!order) {
      res.status(404).json({ error: 'Order not found.' });
      return;
    }

    if (!newStatus) {
      res.status(400).json({ error: 'Target order status is required.' });
      return;
    }

    const currentStatus = order.orderStatus;
    const now = new Date().toISOString();

    order.orderStatus = newStatus as OrderStatus;
    order.updatedAt = now;

    order.statusHistory.push({
      oldStatus: currentStatus,
      newStatus: newStatus as OrderStatus,
      changedBy: req.user!.fullName,
      changedByRole: 'SUPER_ADMIN',
      reason: `ADMIN OVERRIDE: ${auditReason}`,
      timestamp: now,
    });

    if (newStatus === 'DELIVERED') {
      order.paymentStatus = 'paid';
      if (order.shipment) {
        order.shipment.status = 'delivered';
        order.shipment.deliveredAt = now;
      }
      await CommissionService.handleOrderDelivered(order);
    } else if (currentStatus === 'DELIVERED' && (newStatus === 'RETURNED' || newStatus === 'CANCELLED')) {
      await CommissionService.handleOrderReversal(order, auditReason);
    }

    store.saveToDisk();

    AuditService.log({
      actorId: req.user!._id,
      actorName: req.user!.fullName,
      actorRole: 'SUPER_ADMIN',
      action: 'ADMIN_ORDER_STATUS_OVERRIDE',
      targetType: 'ORDER',
      targetId: order._id,
      metadata: { oldStatus: currentStatus, newStatus, reason: emergencyReason },
      ip: req.ip,
    });

    res.json({
      message: `Emergency status override recorded and audited.`,
      order,
    });
  }
}
