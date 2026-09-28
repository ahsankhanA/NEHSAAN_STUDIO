import { Request, Response } from 'express';
import { CartRecoveryService } from '../services/cart-recovery.service.js';

export class CartController {
  /**
   * Sync active cart session to enable 60-minute recovery trigger
   */
  public static async syncCart(req: Request, res: Response): Promise<void> {
    try {
      const { token, customerName, customerPhone, customerEmail, items } = req.body;

      if (!Array.isArray(items)) {
        res.status(400).json({ error: 'Items must be an array.' });
        return;
      }

      const cart = CartRecoveryService.syncCart({
        token,
        customerName,
        customerPhone,
        customerEmail,
        items,
      });

      res.json({
        success: true,
        token: cart.token,
        subtotal: cart.subtotal,
        itemCount: cart.items.length,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to sync cart.' });
    }
  }

  /**
   * Recover cart by token (from WhatsApp/Email link)
   */
  public static async recoverCart(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.params;
      const cart = CartRecoveryService.getCartByToken(token);

      if (!cart) {
        res.status(404).json({
          valid: false,
          error: 'This recovery link is either invalid, already completed, or expired.',
        });
        return;
      }

      res.json({
        valid: true,
        token: cart.token,
        items: cart.items,
        customerName: cart.customerName,
        customerPhone: cart.customerPhone,
        customerEmail: cart.customerEmail,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to recover cart.' });
    }
  }
}
