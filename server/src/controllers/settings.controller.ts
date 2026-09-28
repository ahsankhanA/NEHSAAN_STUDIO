import { Request, Response } from 'express';
import { store } from '../db/store.js';
import { AuditService } from '../services/audit.service.js';
import type { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import type { ISettings } from '../../src/types/index.js';

export class SettingsController {
  /**
   * Public settings (Store details, contact info, shipping terms)
   */
  public static async getPublicSettings(req: Request, res: Response): Promise<void> {
    const s = store.settings;
    if (!s) {
      res.status(500).json({ error: 'Settings not initialized' });
      return;
    }

    res.json({
      store: s.store,
      shipping: {
        singleSuitFee: s.shipping.singleSuitFee,
        twoSuitsFee: s.shipping.twoSuitsFee,
        threeSuitsBaseFee: s.shipping.threeSuitsBaseFee,
        additionalSuitFee: s.shipping.additionalSuitFee,
        carrierName: s.shipping.carrierName,
      },
      extraCharge: {
        enabled: s.extraCharge.enabled,
        ratePerThousand: s.extraCharge.ratePerThousand,
      },
      exchange: {
        customerExchangeFee: s.exchange.customerExchangeFee,
        checkWindowDays: s.exchange.checkWindowDays,
        eligibleReasons: s.exchange.eligibleReasons,
      },
    });
  }

  /**
   * Super Admin Full Settings (includes API keys, profit formulas, reseller rules)
   */
  public static async getAdminSettings(req: AuthenticatedRequest, res: Response): Promise<void> {
    res.json({ settings: store.settings });
  }

  /**
   * Super Admin Update Settings
   */
  public static async updateSettings(req: AuthenticatedRequest, res: Response): Promise<void> {
    const updates: any = req.body;

    if (!store.settings) {
      res.status(500).json({ error: 'Settings not initialized' });
      return;
    }

    // Support flat / alternative structure from UI
    if (updates.brandName || updates.tagline || updates.supportPhone || updates.address) {
      store.settings.store = {
        ...store.settings.store,
        ...(updates.brandName && { brandName: updates.brandName }),
        ...(updates.tagline && { tagline: updates.tagline }),
        ...(updates.address && { address: updates.address }),
        ...(updates.supportPhone && { primaryPhone: updates.supportPhone, whatsappNumber: updates.supportPhone }),
      };
    }

    if (updates.shippingRules) {
      store.settings.shipping = {
        ...store.settings.shipping,
        ...(updates.shippingRules.oneSuitFee !== undefined && { singleSuitFee: Number(updates.shippingRules.oneSuitFee) }),
        ...(updates.shippingRules.twoSuitsFee !== undefined && { twoSuitsFee: Number(updates.shippingRules.twoSuitsFee) }),
        ...(updates.shippingRules.threeSuitsBaseFee !== undefined && { threeSuitsBaseFee: Number(updates.shippingRules.threeSuitsBaseFee) }),
        ...(updates.shippingRules.additionalSuitFee !== undefined && { additionalSuitFee: Number(updates.shippingRules.additionalSuitFee) }),
      };
    }

    if (updates.extraPerThousandCharge !== undefined) {
      store.settings.extraCharge.ratePerThousand = Number(updates.extraPerThousandCharge);
    }

    if (updates.exchangeFee !== undefined) {
      store.settings.exchange.customerExchangeFee = Number(updates.exchangeFee);
    }

    if (updates.resellerSettings) {
      store.settings.reseller = {
        ...store.settings.reseller,
        ...(updates.resellerSettings.commissionPerDeliveredOrder !== undefined && { commissionPerDeliveredOrder: Number(updates.resellerSettings.commissionPerDeliveredOrder) }),
        ...(updates.resellerSettings.bonusMilestoneThreshold !== undefined && { bonusThreshold: Number(updates.resellerSettings.bonusMilestoneThreshold) }),
        ...(updates.resellerSettings.bonusMilestoneAmount !== undefined && { bonusAmount: Number(updates.resellerSettings.bonusMilestoneAmount) }),
      };
    }

    if (updates.postEx) {
      store.settings.postex = {
        ...store.settings.postex,
        ...(updates.postEx.apiUrl && { apiUrl: updates.postEx.apiUrl }),
        ...(updates.postEx.token && { apiKey: updates.postEx.token }),
      };
    }

    if (updates.whatsapp?.recipient) {
      store.settings.whatsapp.adminPhone = updates.whatsapp.recipient;
    }

    // Standard Deep merge sections
    if (updates.store) store.settings.store = { ...store.settings.store, ...updates.store };
    if (updates.shipping) store.settings.shipping = { ...store.settings.shipping, ...updates.shipping };
    if (updates.extraCharge) store.settings.extraCharge = { ...store.settings.extraCharge, ...updates.extraCharge };
    if (updates.reseller) store.settings.reseller = { ...store.settings.reseller, ...updates.reseller };
    if (updates.exchange) store.settings.exchange = { ...store.settings.exchange, ...updates.exchange };
    if (updates.profitCosts) store.settings.profitCosts = { ...store.settings.profitCosts, ...updates.profitCosts };
    if (updates.postex) store.settings.postex = { ...store.settings.postex, ...updates.postex };
    if (updates.whatsapp) store.settings.whatsapp = { ...store.settings.whatsapp, ...updates.whatsapp };
    if (updates.announcement) {
      store.settings.announcement = { ...store.settings.announcement, ...updates.announcement };
    }

    store.saveToDisk();

    AuditService.log({
      actorId: req.user!._id,
      actorName: req.user!.fullName,
      actorRole: 'SUPER_ADMIN',
      action: 'SETTINGS_UPDATED',
      targetType: 'SYSTEM_SETTINGS',
      metadata: updates,
      ip: req.ip,
    });

    res.json({
      message: 'Platform configuration updated successfully.',
      settings: store.settings,
    });
  }
}
