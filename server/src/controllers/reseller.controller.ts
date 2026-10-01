import { Response } from 'express';
import { store } from '../db/store.js';
import { UserModel, ResellerModel } from '../models/index.js';
import { AuditService } from '../services/audit.service.js';
import type { AuthenticatedRequest } from '../middleware/auth.middleware.js';

export class ResellerController {
  /**
   * Reseller Personal Dashboard Stats & KPIs
   */
  public static async getResellerDashboardStats(req: AuthenticatedRequest, res: Response): Promise<void> {
    const reseller = req.reseller!;
    const myOrders = store.orders.filter((o) => o.resellerId === reseller._id);

    const counts = {
      total: myOrders.length,
      pending: myOrders.filter((o) => o.orderStatus === 'PENDING').length,
      confirmed: myOrders.filter((o) => o.orderStatus === 'CONFIRMED').length,
      packed: myOrders.filter((o) => o.orderStatus === 'PACKED').length,
      shipped: myOrders.filter((o) => o.orderStatus === 'SHIPPED').length,
      outForDelivery: myOrders.filter((o) => o.orderStatus === 'OUT_FOR_DELIVERY').length,
      delivered: myOrders.filter((o) => o.orderStatus === 'DELIVERED').length,
      cancelled: myOrders.filter((o) => o.orderStatus === 'CANCELLED').length,
      returned: myOrders.filter((o) => o.orderStatus === 'RETURNED' || o.orderStatus === 'RETURN_REQUESTED').length,
      exchange: myOrders.filter((o) => o.orderStatus === 'EXCHANGE_REQUESTED' || o.orderStatus === 'EXCHANGED').length,
    };

    // Calculate commissions and bonuses
    const myCommissions = store.commissions.filter((c) => c.resellerId === reseller._id);
    const totalCommissionEarned = myCommissions
      .filter((c) => c.status === 'earned' || c.status === 'paid' || c.status === 'payable')
      .reduce((sum, c) => sum + c.amount, 0);

    const myBonuses = store.bonuses.filter((b) => b.resellerId === reseller._id);
    const totalBonusEarned = myBonuses.reduce((sum, b) => sum + b.amount, 0);

    const myPayouts = store.payouts.filter((p) => p.resellerId === reseller._id);
    const totalPaid = myPayouts.reduce((sum, p) => sum + p.amount, 0);

    const totalEarnings = totalCommissionEarned + totalBonusEarned;
    const pendingPayout = Math.max(0, totalEarnings - totalPaid);

    // Milestone bonus progress
    const threshold = store.settings?.reseller.bonusThreshold || 10;
    const currentDelivered = counts.delivered;
    const nextMilestone = (Math.floor(currentDelivered / threshold) + 1) * threshold;
    const progressInCurrentTier = currentDelivered % threshold;

    res.json({
      reseller: {
        _id: reseller._id,
        code: reseller.code,
        fullName: reseller.fullName,
        email: reseller.email,
        phone: reseller.phone,
        whatsapp: reseller.whatsapp,
        status: reseller.status,
        paymentDetails: reseller.paymentDetails,
        referralUrl: `${req.protocol}://${req.get('host')}/?ref=${reseller.code}`,
      },
      counts,
      financials: {
        totalCommissionEarned,
        totalBonusEarned,
        totalEarnings,
        totalPaid,
        pendingPayout,
      },
      bonusProgress: {
        currentDelivered,
        nextMilestone,
        progressInCurrentTier,
        threshold,
        percentage: Math.min(100, Math.round((progressInCurrentTier / threshold) * 100)),
      },
      recentOrders: myOrders.slice(0, 5),
    });
  }

  /**
   * Reseller's Attributed Customers
   */
  public static async getResellerCustomers(req: AuthenticatedRequest, res: Response): Promise<void> {
    const resellerId = req.reseller!._id;
    const myOrders = store.orders.filter((o) => o.resellerId === resellerId);

    // Aggregate customers by phone
    const customerMap = new Map<string, any>();
    for (const order of myOrders) {
      const p = order.customer.phone;
      if (!customerMap.has(p)) {
        customerMap.set(p, {
          fullName: order.customer.fullName,
          phone: order.customer.phone,
          city: order.customer.city,
          totalOrders: 0,
          deliveredOrders: 0,
          totalSpend: 0,
          lastOrderDate: order.createdAt,
        });
      }
      const c = customerMap.get(p)!;
      c.totalOrders += 1;
      if (order.orderStatus === 'DELIVERED') c.deliveredOrders += 1;
      c.totalSpend += order.total;
      if (new Date(order.createdAt) > new Date(c.lastOrderDate)) {
        c.lastOrderDate = order.createdAt;
      }
    }

    res.json({
      total: customerMap.size,
      customers: Array.from(customerMap.values()),
    });
  }

  /**
   * Reseller Resignation / Leave Business
   */
  public static async resignReseller(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { reason } = req.body;
    const reseller = req.reseller!;

    if (!reason || reason.trim().length < 5) {
      res.status(400).json({ error: 'Please state your reason for resignation (minimum 5 characters).' });
      return;
    }

    const now = new Date().toISOString();
    reseller.status = 'resigned';
    reseller.resignedAt = now;
    reseller.resignationReason = reason.trim();
    reseller.updatedAt = now;

    // Deactivate user login
    const user = store.users.find((u) => u._id === reseller.userId);
    if (user) {
      user.isActive = false;
      user.updatedAt = now;
    }

    store.saveToDisk();

    AuditService.log({
      actorId: reseller._id,
      actorName: reseller.fullName,
      actorRole: 'RESELLER',
      action: 'RESELLER_RESIGNED',
      targetType: 'RESELLER',
      targetId: reseller._id,
      metadata: { reason },
      ip: req.ip,
    });

    store.notifications.push({
      _id: store.generateId(),
      recipientRole: 'SUPER_ADMIN',
      title: `Reseller Resignation: ${reseller.fullName} (${reseller.code})`,
      message: `${reseller.fullName} has formally resigned. Reason: ${reason}`,
      link: `/admin/resellers/${reseller._id}`,
      isRead: false,
      createdAt: now,
    });

    res.json({
      message: 'Your resignation has been recorded. Account access is now restricted. Thank you for your partnership with MaNHSaaN clothing.',
    });
  }

  /**
   * Super Admin Resellers Listing
   */
  public static async getAdminResellers(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { status, search } = req.query;
    let list = [...store.resellers];

    if (status) {
      list = list.filter((r) => r.status === status);
    }

    if (search) {
      const q = String(search).toLowerCase().trim();
      list = list.filter(
        (r) =>
          r.fullName.toLowerCase().includes(q) ||
          r.code.toLowerCase().includes(q) ||
          r.email.toLowerCase().includes(q) ||
          r.phone.includes(q) ||
          r.city.toLowerCase().includes(q)
      );
    }

    res.json({
      total: list.length,
      resellers: list,
    });
  }

  /**
   * Super Admin Approve Reseller Application
   */
  public static async approveReseller(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const { customCode } = req.body;
    const reseller = store.resellers.find((r) => r._id === id);

    if (!reseller) {
      res.status(404).json({ error: 'Reseller not found.' });
      return;
    }

    // Generate unique code or use approved custom code
    let code = customCode
      ? String(customCode).trim().toUpperCase()
      : reseller.code;

    // Check code collision
    const collision = store.resellers.find((r) => r._id !== reseller._id && r.code === code);
    if (collision) {
      const initials = (reseller.fullName.split(' ').map((n: string) => n[0]).join('') || 'RES').toUpperCase().slice(0, 3);
      code = `${initials}${Math.floor(100 + Math.random() * 900)}`;
    }

    reseller.code = code;
    reseller.status = 'approved';
    reseller.updatedAt = new Date().toISOString();

    const user = store.users.find((u) => u._id === reseller.userId);
    if (user) {
      user.isActive = true;
      try {
        await UserModel.updateOne({ _id: user._id }, { $set: { isActive: true } });
      } catch {}
    }

    try {
      await ResellerModel.updateOne({ _id: reseller._id }, { $set: reseller }, { upsert: true });
    } catch (err) {
      console.warn('[Reseller] Direct MongoDB approve notice:', (err as Error).message);
    }

    store.saveToDisk();

    AuditService.log({
      actorId: req.user!._id,
      actorName: req.user!.fullName,
      actorRole: 'SUPER_ADMIN',
      action: 'RESELLER_APPROVED',
      targetType: 'RESELLER',
      targetId: reseller._id,
      metadata: { code: reseller.code, name: reseller.fullName },
      ip: req.ip,
    });

    store.notifications.push({
      _id: store.generateId(),
      recipientRole: 'RESELLER',
      recipientResellerId: reseller._id,
      title: 'Application Approved!',
      message: `Congratulations ${reseller.fullName}! Your MaNHSaaN clothing reseller account is active. Your referral code is ${reseller.code}.`,
      link: '/reseller/referral',
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    res.json({
      message: `Reseller ${reseller.fullName} approved with code ${reseller.code}.`,
      reseller,
    });
  }

  /**
   * Super Admin Reject Reseller
   */
  public static async rejectReseller(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const { reason } = req.body;
    const reseller = store.resellers.find((r) => r._id === id);

    if (!reseller) {
      res.status(404).json({ error: 'Reseller not found.' });
      return;
    }

    reseller.status = 'rejected';
    reseller.notes = reason ? `Rejected: ${reason}` : 'Application rejected';
    reseller.updatedAt = new Date().toISOString();

    try {
      await ResellerModel.updateOne({ _id: reseller._id }, { $set: reseller }, { upsert: true });
    } catch (err) {
      console.warn('[Reseller] Direct MongoDB reject notice:', (err as Error).message);
    }

    store.saveToDisk();

    AuditService.log({
      actorId: req.user!._id,
      actorName: req.user!.fullName,
      actorRole: 'SUPER_ADMIN',
      action: 'RESELLER_REJECTED',
      targetType: 'RESELLER',
      targetId: reseller._id,
      metadata: { reason },
      ip: req.ip,
    });

    res.json({ message: 'Reseller application marked as rejected.' });
  }

  /**
   * Super Admin Suspend Reseller
   */
  public static async suspendReseller(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const { reason } = req.body;
    const reseller = store.resellers.find((r) => r._id === id);

    if (!reseller) {
      res.status(404).json({ error: 'Reseller not found.' });
      return;
    }

    reseller.status = 'suspended';
    reseller.notes = reason ? `Suspended: ${reason}` : 'Account suspended';
    reseller.updatedAt = new Date().toISOString();

    if (reseller.userId) {
      const u = store.users.find((user) => user._id === reseller.userId);
      if (u) {
        u.isActive = false;
        try {
          await UserModel.updateOne({ _id: u._id }, { $set: { isActive: false } });
        } catch {}
      }
    }

    try {
      await ResellerModel.updateOne({ _id: reseller._id }, { $set: reseller }, { upsert: true });
    } catch (err) {
      console.warn('[Reseller] Direct MongoDB suspend notice:', (err as Error).message);
    }

    store.saveToDisk();

    AuditService.log({
      actorId: req.user!._id,
      actorName: req.user!.fullName,
      actorRole: 'SUPER_ADMIN',
      action: 'RESELLER_SUSPENDED',
      targetType: 'RESELLER',
      targetId: reseller._id,
      metadata: { reason },
      ip: req.ip,
    });

    res.json({ message: `Reseller ${reseller.fullName} suspended.` });
  }

  /**
   * Super Admin Reactivate Reseller
   */
  public static async reactivateReseller(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const reseller = store.resellers.find((r) => r._id === id);

    if (!reseller) {
      res.status(404).json({ error: 'Reseller not found.' });
      return;
    }

    reseller.status = 'approved';
    reseller.notes = 'Account active';
    reseller.updatedAt = new Date().toISOString();

    if (reseller.userId) {
      const u = store.users.find((user) => user._id === reseller.userId);
      if (u) {
        u.isActive = true;
        try {
          await UserModel.updateOne({ _id: u._id }, { $set: { isActive: true } });
        } catch {}
      }
    }

    try {
      await ResellerModel.updateOne({ _id: reseller._id }, { $set: reseller }, { upsert: true });
    } catch (err) {
      console.warn('[Reseller] Direct MongoDB reactivate notice:', (err as Error).message);
    }

    store.saveToDisk();

    AuditService.log({
      actorId: req.user!._id,
      actorName: req.user!.fullName,
      actorRole: 'SUPER_ADMIN',
      action: 'RESELLER_REACTIVATED',
      targetType: 'RESELLER',
      targetId: reseller._id,
      ip: req.ip,
    });

    res.json({ message: `Reseller ${reseller.fullName} reactivated.` });
  }

  /**
   * Super Admin Reseller Performance Table
   */
  public static async getResellerPerformance(req: AuthenticatedRequest, res: Response): Promise<void> {
    const rows = store.resellers.map((r) => {
      const orders = store.orders.filter((o) => o.resellerId === r._id);
      const delivered = orders.filter((o) => o.orderStatus === 'DELIVERED').length;
      const pending = orders.filter((o) => o.orderStatus === 'PENDING' || o.orderStatus === 'CONFIRMED' || o.orderStatus === 'PACKED' || o.orderStatus === 'SHIPPED').length;
      const cancelled = orders.filter((o) => o.orderStatus === 'CANCELLED').length;
      const returned = orders.filter((o) => o.orderStatus === 'RETURNED' || o.orderStatus === 'RETURN_REQUESTED').length;
      const exchange = orders.filter((o) => o.orderStatus === 'EXCHANGE_REQUESTED' || o.orderStatus === 'EXCHANGED').length;

      const revenue = orders.reduce((sum, o) => sum + (o.orderStatus !== 'CANCELLED' ? o.total : 0), 0);

      const commissions = store.commissions.filter((c) => c.resellerId === r._id && (c.status === 'earned' || c.status === 'paid' || c.status === 'payable'));
      const totalCommission = commissions.reduce((sum, c) => sum + c.amount, 0);

      const bonuses = store.bonuses.filter((b) => b.resellerId === r._id);
      const totalBonus = bonuses.reduce((sum, b) => sum + b.amount, 0);

      const payouts = store.payouts.filter((p) => p.resellerId === r._id);
      const totalPaid = payouts.reduce((sum, p) => sum + p.amount, 0);

      const pendingPayout = Math.max(0, totalCommission + totalBonus - totalPaid);
      const lastOrder = orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];

      return {
        _id: r._id,
        fullName: r.fullName,
        code: r.code,
        status: r.status,
        city: r.city,
        phone: r.phone,
        totalOrders: orders.length,
        delivered,
        pending,
        cancelled,
        returned,
        exchange,
        revenue,
        commissionEarned: totalCommission,
        bonusEarned: totalBonus,
        totalPaid,
        pendingPayout,
        lastOrderDate: lastOrder?.createdAt || null,
        joinedAt: r.createdAt,
      };
    });

    res.json({ performance: rows });
  }

  /**
   * Super Admin Delete Reseller
   */
  public static async deleteReseller(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const index = store.resellers.findIndex((r) => r._id === id);

    if (index === -1) {
      res.status(404).json({ error: 'Reseller not found.' });
      return;
    }

    const [deleted] = store.resellers.splice(index, 1);

    // Also remove associated user
    if (deleted.userId) {
      const uIndex = store.users.findIndex((u) => u._id === deleted.userId);
      if (uIndex !== -1) {
        store.users.splice(uIndex, 1);
      }
    }

    store.saveToDisk();

    AuditService.log({
      actorId: req.user!._id,
      actorName: req.user!.fullName,
      actorRole: 'SUPER_ADMIN',
      action: 'RESELLER_DELETED',
      targetType: 'RESELLER',
      targetId: id,
      metadata: { code: deleted.code, name: deleted.fullName },
      ip: req.ip,
    });

    res.json({ message: `Reseller ${deleted.fullName} (${deleted.code}) deleted successfully.` });
  }
}

