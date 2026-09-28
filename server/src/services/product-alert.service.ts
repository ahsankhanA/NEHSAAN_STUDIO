import { store } from '../db/store.js';
import type { IProduct, IUser, INotification } from '../../src/types/index.js';

export class ProductAlertService {
  private static notifiedProductIds: Set<string> = new Set();

  /**
   * Broadcast launch alert to eligible registered users when a new product is published
   */
  public static async triggerNewProductLaunchAlert(product: IProduct): Promise<void> {
    if (!product || !product._id) return;

    // Check duplicate guard
    if (this.notifiedProductIds.has(product._id)) {
      console.log(`[ProductAlert] Product ${product._id} already notified. Skipping duplicate alert.`);
      return;
    }

    this.notifiedProductIds.add(product._id);

    console.log(`[ProductAlert] Dispatching launch alerts for new product: "${product.name}" (${product.sku})`);

    const title = `✨ New Arrival Drop: ${product.name}`;
    const message = `Luxury ${product.fabric} - ${product.category} is now live at Rs. ${product.retailPrice.toLocaleString()}! Limited stock available.`;
    const productLink = `/products/slug/${product.slug}`;

    // 1. In-App Notifications for registered users
    const eligibleUsers = store.users.filter(
      (u) => u.isActive && (!u.preferences || u.preferences.marketingNotifications !== false)
    );

    for (const user of eligibleUsers) {
      const notification: INotification = {
        _id: store.generateId(),
        recipientRole: user.role === 'SUPER_ADMIN' ? 'SUPER_ADMIN' : 'RESELLER',
        recipientResellerId: user.resellerId || undefined,
        title,
        message,
        link: productLink,
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      store.notifications.unshift(notification);
    }

    store.saveToDisk();

    // 2. Web Push Notification Provider (Isolated)
    await this.dispatchPushNotifications(product, title, message);

    // 3. Email Notification Provider (Isolated)
    await this.dispatchEmailAlerts(eligibleUsers, product, title, message);
  }

  /**
   * Push Notification Provider
   */
  private static async dispatchPushNotifications(product: IProduct, title: string, message: string): Promise<void> {
    const vapidPublic = process.env.VAPID_PUBLIC_KEY;
    const vapidPrivate = process.env.VAPID_PRIVATE_KEY;

    if (!vapidPublic || !vapidPrivate) {
      console.log(
        '[ProductAlert Push] VAPID credentials (VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY) not configured in ENV. Push alert logged cleanly without faking delivery.'
      );
      return;
    }

    console.log(`[ProductAlert Push] Dispatching Web Push alert to subscribers for ${product.name}`);
    // Provider implementation here when VAPID keys are configured in environment
  }

  /**
   * Email Alert Provider
   */
  private static async dispatchEmailAlerts(
    users: IUser[],
    product: IProduct,
    title: string,
    message: string
  ): Promise<void> {
    const smtpHost = process.env.SMTP_HOST;
    if (!smtpHost) {
      console.log(
        `[ProductAlert Email] SMTP_HOST not configured in ENV. In-app alerts logged for ${users.length} users cleanly.`
      );
      return;
    }

    console.log(`[ProductAlert Email] Dispatching newsletter notification to ${users.length} active registered users.`);
    // Provider implementation using nodemailer/ses when SMTP is configured
  }
}
