import { store } from '../db/store.js';
import type { IOrder, ICommission, IReseller } from '../../src/types/index.js';
import { BonusService } from './bonus.service.js';

export class CommissionService {
  /**
   * Called when an order is created or updated.
   * If status changes to DELIVERED, unlocks or creates Rs. 300 earned commission.
   */
  public static async handleOrderDelivered(order: IOrder): Promise<ICommission | null> {
    if (!order.resellerId) return null;

    const reseller = store.resellers.find((r) => r._id === order.resellerId);
    if (!reseller) return null;

    // Check if an earned commission already exists for this order
    const existing = store.commissions.find(
      (c) => c.orderId === order._id && (c.status === 'earned' || c.status === 'payable' || c.status === 'paid')
    );
    if (existing) {
      return existing; // Prevent duplicate award
    }

    const commissionAmount = store.settings?.reseller.commissionPerDeliveredOrder ?? 300;

    // Look for pending commission or create a new one
    let commission = store.commissions.find((c) => c.orderId === order._id && c.status === 'pending');
    const now = new Date().toISOString();

    if (commission) {
      commission.status = 'earned';
      commission.amount = commissionAmount;
      commission.earnedAt = now;
    } else {
      commission = {
        _id: store.generateId(),
        resellerId: reseller._id,
        orderId: order._id,
        orderNumber: order.orderNumber,
        amount: commissionAmount,
        status: 'earned',
        earnedAt: now,
        createdAt: now,
        notes: `Earned upon delivery of order ${order.orderNumber}`,
      };
      store.commissions.push(commission);
    }

    // Update reseller stats
    reseller.deliveredOrders = (reseller.deliveredOrders || 0) + 1;
    reseller.totalCommissionEarned = (reseller.totalCommissionEarned || 0) + commissionAmount;
    reseller.pendingPayout = (reseller.pendingPayout || 0) + commissionAmount;
    reseller.totalRevenueGenerated = (reseller.totalRevenueGenerated || 0) + order.total;

    // In-app notification for reseller
    store.notifications.push({
      _id: store.generateId(),
      recipientRole: 'RESELLER',
      recipientResellerId: reseller._id,
      title: 'Commission Earned!',
      message: `Congratulations! Rs. ${commissionAmount} commission has been credited for delivered order ${order.orderNumber}.`,
      link: '/reseller/commissions',
      isRead: false,
      createdAt: now,
    });

    store.saveToDisk();

    // Trigger bonus check on delivered count
    await BonusService.checkAndAwardMilestone(reseller);

    return commission;
  }

  /**
   * Reverses commission if an order is returned/cancelled after being delivered.
   * Creates an immutable reversal ledger entry.
   */
  public static async handleOrderReversal(order: IOrder, reason: string): Promise<void> {
    if (!order.resellerId) return;

    const reseller = store.resellers.find((r) => r._id === order.resellerId);
    if (!reseller) return;

    const existingCommission = store.commissions.find(
      (c) => c.orderId === order._id && c.status !== 'reversed'
    );

    if (!existingCommission) return;

    const now = new Date().toISOString();

    // Mark original as reversed or create counter-entry
    existingCommission.status = 'reversed';
    existingCommission.notes = `Reversed due to return/cancellation: ${reason}`;

    // Deduct from pending payout if not already paid
    reseller.totalCommissionEarned = Math.max(0, (reseller.totalCommissionEarned || 0) - existingCommission.amount);
    reseller.pendingPayout = Math.max(0, (reseller.pendingPayout || 0) - existingCommission.amount);
    if (reseller.deliveredOrders > 0) {
      reseller.deliveredOrders -= 1;
    }
    reseller.returnedOrders = (reseller.returnedOrders || 0) + 1;

    store.notifications.push({
      _id: store.generateId(),
      recipientRole: 'RESELLER',
      recipientResellerId: reseller._id,
      title: 'Commission Reversal Notice',
      message: `Commission of Rs. ${existingCommission.amount} for order ${order.orderNumber} was reversed (${reason}).`,
      link: '/reseller/commissions',
      isRead: false,
      createdAt: now,
    });

    store.saveToDisk();
  }
}
