import { Request, Response } from 'express';
import { store } from '../db/store.js';
import type { ICoupon } from '../../src/types/index.js';
import { AuditService } from '../services/audit.service.js';

interface AuthenticatedRequest extends Request {
  user?: any;
}

export class CouponController {
  /**
   * Super Admin: Get all coupons
   */
  public static async getAllCoupons(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      res.json({ coupons: store.coupons });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to fetch coupons.' });
    }
  }

  /**
   * Super Admin: Create a new coupon (supports 100% VIP discount, percentage, fixed)
   */
  public static async createCoupon(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const {
        code,
        type,
        amount,
        minimumSubtotal,
        maxDiscount,
        usageLimit,
        userUsageLimit,
        startDate,
        endDate,
        notes,
      } = req.body;

      if (!code || amount === undefined || amount === null) {
        res.status(400).json({ error: 'Coupon code and discount amount are required.' });
        return;
      }

      const formattedCode = String(code).trim().toUpperCase();
      const existing = store.coupons.find((c) => c.code.toUpperCase() === formattedCode);
      if (existing) {
        res.status(400).json({ error: `Coupon code '${formattedCode}' already exists.` });
        return;
      }

      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount < 0) {
        res.status(400).json({ error: 'Discount amount must be a positive number.' });
        return;
      }

      if (type === 'percentage' && numAmount > 100) {
        res.status(400).json({ error: 'Percentage discount cannot exceed 100%.' });
        return;
      }

      const newCoupon: ICoupon = {
        _id: store.generateId(),
        code: formattedCode,
        type: type === 'fixed' ? 'fixed' : 'percentage',
        amount: numAmount,
        minimumSubtotal: minimumSubtotal ? Math.max(0, parseFloat(minimumSubtotal)) : 0,
        maxDiscount: maxDiscount ? parseFloat(maxDiscount) : numAmount === 100 ? 999999 : undefined,
        usageLimit: usageLimit ? parseInt(usageLimit, 10) : 999999,
        usedCount: 0,
        userUsageLimit: userUsageLimit ? parseInt(userUsageLimit, 10) : undefined,
        userUsage: {},
        startDate: startDate || new Date().toISOString(),
        endDate: endDate || new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString(),
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      store.coupons.unshift(newCoupon);
      store.saveToDisk();

      AuditService.log({
        actorId: req.user?._id || 'admin',
        actorName: req.user?.fullName || 'Super Admin',
        actorRole: req.user?.role || 'SUPER_ADMIN',
        action: 'COUPON_CREATED',
        targetType: 'COUPON',
        targetId: newCoupon._id,
        metadata: { code: newCoupon.code, type: newCoupon.type, amount: newCoupon.amount },
        ip: req.ip,
      });

      res.status(201).json({
        message: `Coupon '${newCoupon.code}' created successfully.`,
        coupon: newCoupon,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to create coupon.' });
    }
  }

  /**
   * Super Admin: Toggle active status or update coupon
   */
  public static async updateCoupon(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { active, amount, usageLimit, userUsageLimit, endDate, minimumSubtotal, maxDiscount } = req.body;

      const coupon = store.coupons.find((c) => c._id === id);
      if (!coupon) {
        res.status(404).json({ error: 'Coupon not found.' });
        return;
      }

      if (active !== undefined) coupon.active = Boolean(active);
      if (amount !== undefined) coupon.amount = parseFloat(amount);
      if (usageLimit !== undefined) coupon.usageLimit = parseInt(usageLimit, 10);
      if (userUsageLimit !== undefined) coupon.userUsageLimit = parseInt(userUsageLimit, 10);
      if (endDate !== undefined) coupon.endDate = endDate;
      if (minimumSubtotal !== undefined) coupon.minimumSubtotal = parseFloat(minimumSubtotal);
      if (maxDiscount !== undefined) coupon.maxDiscount = parseFloat(maxDiscount);
      coupon.updatedAt = new Date().toISOString();

      store.saveToDisk();

      AuditService.log({
        actorId: req.user?._id || 'admin',
        actorName: req.user?.fullName || 'Super Admin',
        actorRole: req.user?.role || 'SUPER_ADMIN',
        action: 'COUPON_UPDATED',
        targetType: 'COUPON',
        targetId: coupon._id,
        metadata: { code: coupon.code, active: coupon.active },
        ip: req.ip,
      });

      res.json({ message: 'Coupon updated.', coupon });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to update coupon.' });
    }
  }

  /**
   * Super Admin: Delete coupon
   */
  public static async deleteCoupon(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const index = store.coupons.findIndex((c) => c._id === id);
      if (index === -1) {
        res.status(404).json({ error: 'Coupon not found.' });
        return;
      }

      const [deleted] = store.coupons.splice(index, 1);
      store.saveToDisk();

      AuditService.log({
        actorId: req.user?._id || 'admin',
        actorName: req.user?.fullName || 'Super Admin',
        actorRole: req.user?.role || 'SUPER_ADMIN',
        action: 'COUPON_DELETED',
        targetType: 'COUPON',
        targetId: id,
        metadata: { code: deleted.code },
        ip: req.ip,
      });

      res.json({ message: `Coupon '${deleted.code}' deleted.` });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to delete coupon.' });
    }
  }

  /**
   * Public: Validate coupon at checkout
   */
  public static async validateCoupon(req: Request, res: Response): Promise<void> {
    try {
      const { code, subtotal, customerPhone, customerEmail } = req.body;
      if (!code) {
        res.status(400).json({ valid: false, error: 'Please enter a coupon code.' });
        return;
      }

      const formattedCode = String(code).trim().toUpperCase();
      const currentSubtotal = Math.max(0, parseFloat(subtotal || 0));

      const coupon = store.coupons.find(
        (c) => c.code.toUpperCase() === formattedCode && c.active
      );

      if (!coupon) {
        res.status(404).json({ valid: false, error: 'Invalid or inactive coupon code.' });
        return;
      }

      if (coupon.endDate && new Date(coupon.endDate) < new Date()) {
        res.status(400).json({ valid: false, error: 'This coupon has expired.' });
        return;
      }

      if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
        res.status(400).json({ valid: false, error: 'Coupon usage limit has been reached.' });
        return;
      }

      // Check per-user limit
      const userKey = (customerPhone || customerEmail || '').replace(/[^a-zA-Z0-9]/g, '');
      if (coupon.userUsageLimit && userKey) {
        const userCount = coupon.userUsage?.[userKey] || 0;
        if (userCount >= coupon.userUsageLimit) {
          res.status(400).json({
            valid: false,
            error: `You have already reached the maximum usage limit (${coupon.userUsageLimit}) for this coupon.`,
          });
          return;
        }
      }

      if (currentSubtotal < coupon.minimumSubtotal) {
        res.status(400).json({
          valid: false,
          error: `Minimum order amount of Rs. ${coupon.minimumSubtotal.toLocaleString()} required for this coupon.`,
        });
        return;
      }

      let discount = 0;
      if (coupon.type === 'percentage') {
        discount = Math.round((currentSubtotal * coupon.amount) / 100);
        if (coupon.maxDiscount && coupon.amount < 100) {
          discount = Math.min(discount, coupon.maxDiscount);
        }
      } else {
        discount = Math.min(currentSubtotal, coupon.amount);
      }

      const isFullDiscount = coupon.amount === 100 && coupon.type === 'percentage';

      res.json({
        valid: true,
        code: coupon.code,
        type: coupon.type,
        amount: coupon.amount,
        discount,
        isFullDiscount,
        message: isFullDiscount
          ? 'Special 100% VIP Discount Applied! Product cost is Rs. 0!'
          : `${coupon.amount}${coupon.type === 'percentage' ? '%' : ' Rs.'} Discount Applied! (Saved Rs. ${discount.toLocaleString()})`,
      });
    } catch (err: any) {
      res.status(500).json({ valid: false, error: err.message || 'Validation failed.' });
    }
  }
}
