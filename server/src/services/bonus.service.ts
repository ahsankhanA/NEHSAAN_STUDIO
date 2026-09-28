import { store } from '../db/store.js';
import type { IReseller, IBonus } from '../../src/types/index.js';

export class BonusService {
  /**
   * Checks if reseller has crossed a new milestone (every 10 delivered orders by default).
   * Awards Rs. 500 per milestone and prevents any duplicate award.
   */
  public static async checkAndAwardMilestone(reseller: IReseller): Promise<IBonus[]> {
    const settings = store.settings?.reseller;
    const threshold = settings?.bonusThreshold || 10;
    const bonusAmount = settings?.bonusAmount || 500;

    const deliveredCount = reseller.deliveredOrders || 0;
    if (deliveredCount < threshold) {
      return [];
    }

    const awardedBonuses: IBonus[] = [];
    const maxMilestone = Math.floor(deliveredCount / threshold) * threshold;

    // Check every milestone: 10, 20, 30... up to maxMilestone
    for (let milestone = threshold; milestone <= maxMilestone; milestone += threshold) {
      const alreadyAwarded = store.bonuses.some(
        (b) => b.resellerId === reseller._id && b.milestoneOrders === milestone
      );

      if (!alreadyAwarded) {
        const now = new Date().toISOString();
        const bonus: IBonus = {
          _id: store.generateId(),
          resellerId: reseller._id,
          milestoneOrders: milestone,
          amount: bonusAmount,
          status: 'earned',
          earnedAt: now,
          createdAt: now,
        };

        store.bonuses.push(bonus);
        awardedBonuses.push(bonus);

        reseller.totalBonusEarned = (reseller.totalBonusEarned || 0) + bonusAmount;
        reseller.pendingPayout = (reseller.pendingPayout || 0) + bonusAmount;

        store.notifications.push({
          _id: store.generateId(),
          recipientRole: 'RESELLER',
          recipientResellerId: reseller._id,
          title: `Milestone Bonus Achieved: ${milestone} Orders!`,
          message: `Incredible work! You completed ${milestone} delivered orders and earned a cash bonus of Rs. ${bonusAmount}.`,
          link: '/reseller/bonuses',
          isRead: false,
          createdAt: now,
        });

        // Also notify Super Admin
        store.notifications.push({
          _id: store.generateId(),
          recipientRole: 'SUPER_ADMIN',
          title: `Reseller Milestone: ${reseller.fullName} (${reseller.code})`,
          message: `${reseller.fullName} reached ${milestone} delivered orders! Bonus of Rs. ${bonusAmount} generated.`,
          link: `/admin/resellers/${reseller._id}`,
          isRead: false,
          createdAt: now,
        });

        console.log(`[Bonus] Awarded milestone ${milestone} (Rs. ${bonusAmount}) to reseller ${reseller.code}`);
      }
    }

    if (awardedBonuses.length > 0) {
      store.saveToDisk();
    }

    return awardedBonuses;
  }
}
