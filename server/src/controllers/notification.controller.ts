import { Response } from 'express';
import { store } from '../db/store.js';
import type { AuthenticatedRequest } from '../middleware/auth.middleware.js';

export class NotificationController {
  // Public - Customer Notifications (Announcements, Event Drops, 10+ Products Catalog Drop, Offers)
  public static async getCustomerNotifications(req: any, res: Response): Promise<void> {
    try {
      const notifications: any[] = [];
      const now = new Date().toISOString();

      // 1. Check Store Announcement
      if (store.settings?.announcement?.enabled && store.settings?.announcement?.text) {
        notifications.push({
          id: 'announcement_broadcast',
          type: 'announcement',
          title: '📢 Official Store Announcement',
          message: store.settings.announcement.text,
          linkText: store.settings.announcement.linkText || 'Learn More',
          linkUrl: store.settings.announcement.linkUrl || '#',
          time: 'Active Now',
          isNew: true,
          badge: 'Announcement',
        });
      }

      // 2. Check Seasonal Event Banner Drops
      const activeSlides = (store.heroSlides || []).filter((s) => s.active !== false);
      if (activeSlides.length > 0) {
        const latestSlide = activeSlides[0];
        notifications.push({
          id: 'hero_event_' + (latestSlide._id || 'main'),
          type: 'event',
          title: `🌙 ${latestSlide.title} Is Live!`,
          message: latestSlide.subtitle || latestSlide.description || 'Special limited seasonal collection available now.',
          linkText: latestSlide.ctaText || 'Shop Event Collection',
          category: latestSlide.category || 'all',
          fabric: latestSlide.fabric,
          time: 'Featured Event',
          isNew: true,
          badge: latestSlide.tag || 'Special Drop',
        });
      }

      // 3. Catalog Drop (10+ Products Alert)
      const totalProducts = (store.products || []).filter((p) => p.status === 'active').length;
      if (totalProducts >= 10) {
        notifications.push({
          id: 'catalog_drop_10plus',
          type: 'drop',
          title: `✨ Massive Catalog Drop: ${totalProducts}+ Luxury Ensembles!`,
          message: `Discover our full bridal, festive, and lawn collections. Over ${totalProducts} premium stitched & unstitched designer pieces ready for Express COD dispatch nationwide!`,
          linkText: 'Explore New Arrivals',
          category: 'all',
          time: 'Recent Drop',
          isNew: true,
          badge: `${totalProducts}+ Designs`,
        });
      }

      // 4. Active Coupons & VIP Discount Drops
      const activeCoupons = (store.coupons || []).filter((c) => c.active !== false);
      if (activeCoupons.length > 0) {
        const topCoupon = activeCoupons[0];
        notifications.push({
          id: 'coupon_drop_' + topCoupon._id,
          type: 'offer',
          title: `🎟️ Special Promo Code: ${topCoupon.code}`,
          message: `Get ${topCoupon.type === 'percentage' ? `${topCoupon.amount}% OFF` : `Rs. ${topCoupon.amount} OFF`} your order with code ${topCoupon.code}. Valid on all prepaid & COD checkout!`,
          linkText: `Copy Code: ${topCoupon.code}`,
          code: topCoupon.code,
          time: 'Exclusive Voucher',
          isNew: false,
          badge: 'VIP Offer',
        });
      }

      // 5. Custom broadcasts sent by Admin
      const customBroadcasts = (store.notifications || []).filter(
        (n) => n.recipientRole === 'CUSTOMER' as any
      );
      for (const b of customBroadcasts) {
        notifications.unshift({
          id: b._id,
          type: 'broadcast',
          title: b.title,
          message: b.message,
          linkText: 'View Details',
          time: 'Recent',
          isNew: true,
          badge: 'Broadcast',
        });
      }

      res.json({
        notifications,
        unreadCount: notifications.length,
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch customer notifications', error: (error as Error).message });
    }
  }

  // Admin - Send Custom Customer Broadcast Notification
  public static async sendBroadcastNotification(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { title, message } = req.body;
      if (!title || !message) {
        res.status(400).json({ message: 'Title and message are required' });
        return;
      }

      const newNotif = {
        _id: 'notif_' + store.generateId(),
        recipientRole: 'CUSTOMER' as any,
        title: String(title).trim(),
        message: String(message).trim(),
        isRead: false,
        createdAt: new Date().toISOString(),
      };

      store.notifications.push(newNotif as any);
      store.saveToDisk();

      res.status(201).json({
        message: 'Customer broadcast notification sent successfully!',
        notification: newNotif,
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to send broadcast', error: (error as Error).message });
    }
  }

  public static async getMyNotifications(req: AuthenticatedRequest, res: Response): Promise<void> {
    const isSuperAdmin = req.user?.role === 'SUPER_ADMIN';
    const resellerId = req.reseller?._id;

    const list = store.notifications.filter((n) => {
      if (isSuperAdmin && n.recipientRole === 'SUPER_ADMIN') return true;
      if (resellerId && n.recipientRole === 'RESELLER' && n.recipientResellerId === resellerId) return true;
      return false;
    });

    res.json({
      notifications: list.slice(0, 50),
      unreadCount: list.filter((n) => !n.isRead).length,
    });
  }

  public static async markAsRead(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { id } = req.params;
    const notification = store.notifications.find((n) => n._id === id);

    if (notification) {
      notification.isRead = true;
      store.saveToDisk();
    }

    res.json({ success: true });
  }

  public static async markAllAsRead(req: AuthenticatedRequest, res: Response): Promise<void> {
    const isSuperAdmin = req.user?.role === 'SUPER_ADMIN';
    const resellerId = req.reseller?._id;

    for (const n of store.notifications) {
      if (isSuperAdmin && n.recipientRole === 'SUPER_ADMIN') {
        n.isRead = true;
      } else if (resellerId && n.recipientRole === 'RESELLER' && n.recipientResellerId === resellerId) {
        n.isRead = true;
      }
    }

    store.saveToDisk();
    res.json({ success: true });
  }
}
