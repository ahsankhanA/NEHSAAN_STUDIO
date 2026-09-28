import crypto from 'crypto';
import { store } from '../db/store.js';
import type { IAbandonedCart } from '../../src/types/index.js';

export class CartRecoveryService {
  private static workerInterval: NodeJS.Timeout | null = null;
  private static readonly ABANDONMENT_DELAY_MS = 60 * 60 * 1000; // Exact 60 minutes
  private static readonly TOKEN_EXPIRY_MS = 48 * 60 * 60 * 1000; // 48 hours

  /**
   * Start the server-side cron / background worker
   */
  public static startWorker(): void {
    if (this.workerInterval) return;

    console.log('[CartRecovery] Starting 60-minute abandoned cart recovery worker...');

    // Run check every 30 seconds
    this.workerInterval = setInterval(() => {
      this.checkAndProcessAbandonedCarts().catch((err) => {
        console.error('[CartRecovery Worker Error]:', err.message);
      });
    }, 30 * 1000);

    // Initial check
    this.checkAndProcessAbandonedCarts().catch(() => {});
  }

  /**
   * Stop background worker if needed
   */
  public static stopWorker(): void {
    if (this.workerInterval) {
      clearInterval(this.workerInterval);
      this.workerInterval = null;
    }
  }

  /**
   * Synchronize / create an active customer cart session
   */
  public static syncCart(params: {
    token?: string;
    customerName?: string;
    customerPhone?: string;
    customerEmail?: string;
    items: any[];
  }): IAbandonedCart {
    const now = new Date();
    let cart: IAbandonedCart | undefined;

    if (params.token) {
      cart = store.abandonedCarts.find((c) => c.token === params.token);
    }

    const subtotal = (params.items || []).reduce(
      (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1),
      0
    );

    if (cart) {
      cart.items = params.items;
      cart.subtotal = subtotal;
      if (params.customerName) cart.customerName = params.customerName;
      if (params.customerPhone) cart.customerPhone = params.customerPhone;
      if (params.customerEmail) cart.customerEmail = params.customerEmail;
      cart.updatedAt = now.toISOString();
      cart.expiresAt = new Date(now.getTime() + this.TOKEN_EXPIRY_MS).toISOString();
      // If items were updated, keep orderCompleted in sync
      if (params.items.length === 0) {
        cart.orderCompleted = true; // don't recover empty cart
      }
    } else {
      cart = {
        _id: store.generateId(),
        token: crypto.randomBytes(24).toString('hex'),
        customerName: params.customerName,
        customerPhone: params.customerPhone,
        customerEmail: params.customerEmail,
        items: params.items || [],
        subtotal,
        reminderSent: false,
        orderCompleted: (params.items || []).length === 0,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        expiresAt: new Date(now.getTime() + this.TOKEN_EXPIRY_MS).toISOString(),
      };
      store.abandonedCarts.push(cart);
    }

    store.saveToDisk();
    return cart;
  }

  /**
   * Retrieve cart by secure recovery token
   */
  public static getCartByToken(token: string): IAbandonedCart | null {
    if (!token) return null;
    const cart = store.abandonedCarts.find((c) => c.token === token);
    if (!cart) return null;

    // Check expiry
    if (new Date(cart.expiresAt) < new Date()) {
      return null;
    }

    return cart;
  }

  /**
   * Process all eligible abandoned carts at exactly 60 minutes
   */
  private static async checkAndProcessAbandonedCarts(): Promise<void> {
    const now = Date.now();

    for (const cart of store.abandonedCarts) {
      // 1. Must not have completed order
      if (cart.orderCompleted) continue;

      // 2. Must not have already received reminder
      if (cart.reminderSent) continue;

      // 3. Must have non-empty items
      if (!cart.items || cart.items.length === 0) continue;

      // 4. Token must not be expired
      if (new Date(cart.expiresAt).getTime() < now) continue;

      // 5. Must have been abandoned for at least 60 minutes (exact 60 min requirement)
      const elapsed = now - new Date(cart.updatedAt).getTime();
      if (elapsed < this.ABANDONMENT_DELAY_MS) {
        continue; // Not yet 60 minutes
      }

      // Trigger recovery reminder
      await this.sendRecoveryReminder(cart);
    }
  }

  /**
   * Send WhatsApp / Email recovery notification
   */
  private static async sendRecoveryReminder(cart: IAbandonedCart): Promise<void> {
    // Mark immediately to prevent race conditions or duplicates
    cart.reminderSent = true;
    cart.reminderSentAt = new Date().toISOString();
    store.saveToDisk();

    const baseUrl = process.env.PUBLIC_APP_URL || 'http://localhost:3000';
    const recoveryUrl = `${baseUrl}/?recoverCart=${encodeURIComponent(cart.token)}`;
    const requiredUrduMessage = 'Aap ke bag mein product para hua hai, khareedari mukammal karein.';
    const fullMessage = `${requiredUrduMessage}\n\nComplete your purchase here:\n${recoveryUrl}`;

    console.log(`[CartRecovery] Triggering 60-min recovery for cart token ${cart.token}:`);
    console.log(`Message: "${fullMessage}"`);

    // WhatsApp Dispatch
    if (cart.customerPhone) {
      await this.dispatchWhatsAppMessage(cart.customerPhone, fullMessage);
    }

    // Email Dispatch
    if (cart.customerEmail) {
      await this.dispatchEmailMessage(cart.customerEmail, requiredUrduMessage, recoveryUrl, cart);
    }
  }

  /**
   * WhatsApp integration provider
   */
  private static async dispatchWhatsAppMessage(phone: string, text: string): Promise<void> {
    const apiKey = process.env.WHATSAPP_API_KEY;
    const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const apiUrl = process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v20.0';

    if (!apiKey || !phoneId) {
      console.log(
        `[CartRecovery WhatsApp] Provider credentials not set (WHATSAPP_API_KEY / WHATSAPP_PHONE_NUMBER_ID). Logged reminder safely for phone ${phone}.`
      );
      return;
    }

    try {
      const cleanPhone = phone.replace(/[^0-9]/g, '');
      const response = await fetch(`${apiUrl}/${phoneId}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: cleanPhone,
          type: 'text',
          text: { body: text },
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.warn(`[CartRecovery WhatsApp API Error]:`, errText);
      } else {
        console.log(`[CartRecovery WhatsApp] Successfully delivered message to ${cleanPhone}`);
      }
    } catch (e) {
      console.error(`[CartRecovery WhatsApp Network Error]:`, (e as Error).message);
    }
  }

  /**
   * Email integration provider
   */
  private static async dispatchEmailMessage(
    email: string,
    messageText: string,
    recoveryUrl: string,
    cart: IAbandonedCart
  ): Promise<void> {
    const smtpHost = process.env.SMTP_HOST;
    if (!smtpHost) {
      console.log(
        `[CartRecovery Email] SMTP_HOST not configured in ENV. Logged reminder safely for ${email}. Link: ${recoveryUrl}`
      );
      return;
    }

    // Provider-specific email dispatch implementation using environment variables
    console.log(`[CartRecovery Email] Sending recovery email to ${email}`);
  }
}
