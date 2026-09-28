import { Request, Response } from 'express';
import { store } from '../db/store.js';
import { AuditService } from '../services/audit.service.js';
import type { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import type { IReturnRequest, IExchangeRequest } from '../../src/types/index.js';

export class ExchangeController {
  /**
   * Public: Customer submit exchange request
   */
  public static async submitExchangeRequest(req: Request, res: Response): Promise<void> {
    const { orderNumber, customerPhone, desiredProductOrSize, reason, photos } = req.body;

    if (!orderNumber || !customerPhone || !reason || !desiredProductOrSize) {
      res.status(400).json({ error: 'Please provide Order Number, Customer Phone, Reason, and Desired Replacement Product/Size.' });
      return;
    }

    const cleanOrderNo = String(orderNumber).trim().toUpperCase();
    const cleanPhone = String(customerPhone).replace(/[^0-9]/g, '');

    const order = store.orders.find((o) => {
      const oNum = o.orderNumber.toUpperCase();
      const oPhone = o.customer.phone.replace(/[^0-9]/g, '');
      return oNum === cleanOrderNo && (oPhone.endsWith(cleanPhone) || cleanPhone.endsWith(oPhone));
    });

    if (!order) {
      res.status(404).json({ error: 'Order not found with matching order number and phone number.' });
      return;
    }

    const windowDays = store.settings?.exchange.checkWindowDays || 7;
    const orderDate = new Date(order.createdAt).getTime();
    const daysSince = (Date.now() - orderDate) / (1000 * 3600 * 24);

    if (daysSince > windowDays) {
      res.status(400).json({
        error: `Exchange window expired. Requests must be submitted within ${windowDays} days of delivery.`,
      });
      return;
    }

    const exchangeFee = store.settings?.exchange.customerExchangeFee || 300;
    const exchangeNumber = `EXC-${Date.now().toString().slice(-6)}`;
    const now = new Date().toISOString();

    const request: IExchangeRequest = {
      _id: store.generateId(),
      exchangeNumber,
      orderId: order._id,
      orderNumber: order.orderNumber,
      customerName: order.customer.fullName,
      customerPhone: order.customer.phone,
      desiredProductOrSize,
      reason,
      exchangeFee,
      photos: Array.isArray(photos) ? photos : [],
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    };

    store.exchanges.unshift(request);

    // Update order status
    order.orderStatus = 'EXCHANGE_REQUESTED';
    order.statusHistory.push({
      oldStatus: order.orderStatus,
      newStatus: 'EXCHANGE_REQUESTED',
      changedBy: order.customer.fullName,
      changedByRole: 'CUSTOMER',
      reason: `Customer submitted exchange request ${exchangeNumber}: ${reason}`,
      timestamp: now,
    });

    store.notifications.push({
      _id: store.generateId(),
      recipientRole: 'SUPER_ADMIN',
      title: `Exchange Request: ${exchangeNumber}`,
      message: `${order.customer.fullName} requested exchange for order ${order.orderNumber} (Reason: ${reason}).`,
      link: `/admin/exchanges`,
      isRead: false,
      createdAt: now,
    });

    store.saveToDisk();

    res.status(201).json({
      message: `Exchange request ${exchangeNumber} submitted successfully. Our team will verify and contact you on WhatsApp within 24 hours.`,
      exchange: request,
    });
  }

  /**
   * Super Admin: View all exchanges and returns
   */
  public static async getAdminExchanges(req: AuthenticatedRequest, res: Response): Promise<void> {
    res.json({
      exchanges: store.exchanges,
      returns: store.returns,
    });
  }

  /**
   * Super Admin: Update exchange status (approve, reject, complete)
   */
  public static async updateExchangeStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    const request = store.exchanges.find((e) => e._id === id);
    if (!request) {
      res.status(404).json({ error: 'Exchange request not found.' });
      return;
    }

    request.status = status;
    request.adminNotes = adminNotes;
    request.updatedAt = new Date().toISOString();

    const order = store.orders.find((o) => o._id === request.orderId);
    if (order) {
      if (status === 'completed') {
        order.orderStatus = 'EXCHANGED';
      }
      order.updatedAt = new Date().toISOString();
    }

    store.saveToDisk();

    AuditService.log({
      actorId: req.user!._id,
      actorName: req.user!.fullName,
      actorRole: 'SUPER_ADMIN',
      action: 'EXCHANGE_STATUS_UPDATED',
      targetType: 'EXCHANGE',
      targetId: request._id,
      metadata: { status, adminNotes },
      ip: req.ip,
    });

    res.json({ message: 'Exchange status updated successfully.', exchange: request });
  }
}
