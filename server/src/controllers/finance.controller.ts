import { Response } from 'express';
import { store } from '../db/store.js';
import { AuditService } from '../services/audit.service.js';
import type { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import type { IPayout } from '../../src/types/index.js';

export class FinanceController {
  /**
   * Commissions List (Reseller isolated or Admin comprehensive)
   */
  public static async getCommissions(req: AuthenticatedRequest, res: Response): Promise<void> {
    const isSuperAdmin = req.user?.role === 'SUPER_ADMIN';

    let list = store.commissions;
    if (!isSuperAdmin) {
      // Strictly isolate to authenticated reseller
      list = list.filter((c) => c.resellerId === req.reseller?._id);
    }

    const { status, resellerId } = req.query;
    if (status) {
      list = list.filter((c) => c.status === status);
    }
    if (isSuperAdmin && resellerId) {
      list = list.filter((c) => c.resellerId === resellerId);
    }

    const totalEarned = list.filter((c) => c.status === 'earned' || c.status === 'paid').reduce((s, c) => s + c.amount, 0);

    res.json({
      total: list.length,
      totalEarned,
      commissions: list,
    });
  }

  /**
   * Bonuses List (Reseller isolated or Admin comprehensive)
   */
  public static async getBonuses(req: AuthenticatedRequest, res: Response): Promise<void> {
    const isSuperAdmin = req.user?.role === 'SUPER_ADMIN';

    let list = store.bonuses;
    if (!isSuperAdmin) {
      list = list.filter((b) => b.resellerId === req.reseller?._id);
    }

    const { resellerId } = req.query;
    if (isSuperAdmin && resellerId) {
      list = list.filter((b) => b.resellerId === resellerId);
    }

    const totalBonusAmount = list.reduce((s, b) => s + b.amount, 0);

    res.json({
      total: list.length,
      totalBonusAmount,
      bonuses: list,
    });
  }

  /**
   * Payouts List
   */
  public static async getPayouts(req: AuthenticatedRequest, res: Response): Promise<void> {
    const isSuperAdmin = req.user?.role === 'SUPER_ADMIN';

    let list = store.payouts;
    if (!isSuperAdmin) {
      list = list.filter((p) => p.resellerId === req.reseller?._id);
    }

    const { resellerId } = req.query;
    if (isSuperAdmin && resellerId) {
      list = list.filter((p) => p.resellerId === resellerId);
    }

    res.json({
      total: list.length,
      payouts: list,
    });
  }

  /**
   * Super Admin Process & Record Payout
   */
  public static async createPayout(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { resellerId, amount, paymentMethod, transactionReference, notes } = req.body;

    if (!resellerId || !amount || !transactionReference) {
      res.status(400).json({ error: 'Please provide resellerId, payout amount, and transactionReference.' });
      return;
    }

    const reseller = store.resellers.find((r) => r._id === resellerId);
    if (!reseller) {
      res.status(404).json({ error: 'Reseller not found.' });
      return;
    }

    const payoutAmount = Number(amount);
    if (payoutAmount <= 0) {
      res.status(400).json({ error: 'Payout amount must be greater than zero.' });
      return;
    }

    const now = new Date().toISOString();
    const payoutNumber = `PAY-${Date.now().toString().slice(-6)}`;

    const payout: IPayout = {
      _id: store.generateId(),
      payoutNumber,
      resellerId: reseller._id,
      resellerName: reseller.fullName,
      resellerCode: reseller.code,
      amount: payoutAmount,
      paymentMethod: paymentMethod || reseller.paymentDetails.paymentMethod,
      transactionReference: transactionReference.trim(),
      paidBy: req.user!.fullName,
      paidAt: now,
      notes: notes?.trim(),
      createdAt: now,
    };

    store.payouts.unshift(payout);

    // Update reseller accounting
    reseller.totalPaid = (reseller.totalPaid || 0) + payoutAmount;
    reseller.pendingPayout = Math.max(0, (reseller.pendingPayout || 0) - payoutAmount);

    // Mark earned commissions as paid up to the amount
    let remaining = payoutAmount;
    for (const c of store.commissions) {
      if (c.resellerId === reseller._id && c.status === 'earned') {
        if (remaining >= c.amount) {
          c.status = 'paid';
          c.paidAt = now;
          c.payoutId = payout._id;
          remaining -= c.amount;
        }
      }
    }

    // Mark earned bonuses as paid up to remaining
    for (const b of store.bonuses) {
      if (b.resellerId === reseller._id && b.status === 'earned' && remaining >= b.amount) {
        b.status = 'paid';
        b.paidAt = now;
        b.payoutId = payout._id;
        remaining -= b.amount;
      }
    }

    store.saveToDisk();

    AuditService.log({
      actorId: req.user!._id,
      actorName: req.user!.fullName,
      actorRole: 'SUPER_ADMIN',
      action: 'PAYOUT_DISBURSED',
      targetType: 'PAYOUT',
      targetId: payout._id,
      metadata: {
        resellerCode: reseller.code,
        amount: payoutAmount,
        transactionReference,
        paymentMethod: payout.paymentMethod,
      },
      ip: req.ip,
    });

    store.notifications.push({
      _id: store.generateId(),
      recipientRole: 'RESELLER',
      recipientResellerId: reseller._id,
      title: 'Payment Disbursed!',
      message: `A payout of Rs. ${payoutAmount.toLocaleString()} has been sent to your ${payout.paymentMethod} account. Ref: ${transactionReference}`,
      link: '/reseller/payouts',
      isRead: false,
      createdAt: now,
    });

    res.status(201).json({
      message: `Payout of Rs. ${payoutAmount.toLocaleString()} successfully recorded for ${reseller.fullName}.`,
      payout,
    });
  }

  /**
   * Super Admin Financial & Profit Analytics
   */
  public static async getFinancialAnalytics(req: AuthenticatedRequest, res: Response): Promise<void> {
    const deliveredOrders = store.orders.filter((o) => o.orderStatus === 'DELIVERED');
    const returnedOrders = store.orders.filter((o) => o.orderStatus === 'RETURNED');
    const totalOrdersCount = store.orders.length;

    const totalGrossRevenue = deliveredOrders.reduce((sum, o) => sum + o.total, 0);
    const totalMerchandiseSubtotal = deliveredOrders.reduce((sum, o) => sum + o.subtotal, 0);

    // Calculate wholesale costs from snapshots
    let totalWholesaleCost = 0;
    for (const order of deliveredOrders) {
      for (const item of order.items) {
        totalWholesaleCost += (item.wholesaleCostSnapshot || 0) * item.quantity;
      }
    }

    const grossMargin = totalMerchandiseSubtotal - totalWholesaleCost;
    const totalExtraChargeCollected = deliveredOrders.reduce((sum, o) => sum + (o.perThousandCharge || 0), 0);

    // Commissions & Bonuses
    const totalCommissionsPaidOrEarned = store.commissions
      .filter((c) => c.status === 'earned' || c.status === 'paid')
      .reduce((sum, c) => sum + c.amount, 0);

    const totalBonusesPaidOrEarned = store.bonuses.reduce((sum, b) => sum + b.amount, 0);
    const totalResellerDisbursements = totalCommissionsPaidOrEarned + totalBonusesPaidOrEarned;

    // Operational and Logistics estimates
    const pkgCost = (store.settings?.profitCosts.packagingCostPerOrder || 100) * deliveredOrders.length;
    const codCost = (store.settings?.profitCosts.codHandlingFee || 50) * deliveredOrders.length;
    const rtoLoss = (store.settings?.profitCosts.defaultRtoCost || 250) * returnedOrders.length;

    // Real net profit
    const netBusinessProfit =
      grossMargin + totalExtraChargeCollected - totalResellerDisbursements - pkgCost - codCost - rtoLoss;

    res.json({
      kpis: {
        totalOrdersCount,
        deliveredOrdersCount: deliveredOrders.length,
        returnedOrdersCount: returnedOrders.length,
        totalGrossRevenue,
        totalMerchandiseSubtotal,
        totalWholesaleCost,
        grossMargin,
        grossMarginPercentage: totalMerchandiseSubtotal > 0 ? Math.round((grossMargin / totalMerchandiseSubtotal) * 100) : 0,
        totalExtraChargeCollected,
        totalResellerDisbursements,
        packagingCosts: pkgCost,
        codHandlingFees: codCost,
        rtoLosses: rtoLoss,
        netBusinessProfit,
      },
      payoutStatus: {
        totalPaidOut: store.payouts.reduce((sum, p) => sum + p.amount, 0),
        pendingResellerPayouts: store.resellers.reduce((sum, r) => sum + (r.pendingPayout || 0), 0),
      },
    });
  }
}
