import bcrypt from 'bcryptjs';
import { store } from '../db/store.js';
import { UserModel } from '../models/index.js';
import type { ISettings, IUser } from '../../src/types/index.js';

export const DEFAULT_SETTINGS: ISettings = {
  store: {
    brandName: 'MaNHSaaN clothing',
    logoUrl: '',
    faviconUrl: '',
    tagline: 'Exclusive Haute Couture & Luxury Clothing',
    primaryPhone: '+92 323 5277238',
    whatsappNumber: '+923235277238',
    email: 'nehsaan@gmail.com',
    address: 'Sohan Islamabad',
    currency: 'PKR',
    socialLinks: {
      facebook: 'https://facebook.com',
      instagram: 'https://instagram.com',
      tiktok: 'https://tiktok.com',
    },
  },
  shipping: {
    singleSuitFee: 300,
    twoSuitsFee: 400,
    threeSuitsBaseFee: 450,
    additionalSuitFee: 50,
    carrierName: 'Express Courier',
  },
  extraCharge: {
    enabled: true,
    ratePerThousand: 50,
    roundingRule: 'ceiling',
  },
  reseller: {
    commissionPerDeliveredOrder: 300,
    bonusThreshold: 10,
    bonusAmount: 500,
    bonusMode: 'lifetime',
    minimumPayout: 1000,
    approvalRequired: true,
  },
  exchange: {
    customerExchangeFee: 300,
    checkWindowDays: 7,
    eligibleReasons: ['damaged_item', 'wrong_product', 'size_exchange', 'color_mismatch', 'change_of_mind'],
  },
  profitCosts: {
    packagingCostPerOrder: 100,
    codHandlingFee: 50,
    defaultRtoCost: 250,
    operationalCostPerOrder: 50,
  },
  postex: {
    enabled: true,
    apiUrl: 'https://api.postex.pk/services/integration/api',
    apiKey: '',
  },
  whatsapp: {
    enabled: true,
    adminPhone: '+923235277238',
    apiUrl: 'https://graph.facebook.com/v19.0',
    phoneNumberId: '',
    accessToken: '',
  },
};

export async function seedInitialData(force = false): Promise<void> {
  // 1. Always ensure store settings exist
  if (!store.settings || force) {
    store.settings = { ...DEFAULT_SETTINGS };
    console.log('[Seed] Initialized default store and business settings');
  }

  // 2. ALWAYS GUARANTEE SUPER ADMIN EXISTS in memory and in MongoDB Atlas
  const superAdminEmail = 'nehsaan@gmail.com';
  const hashedAdminPassword = await bcrypt.hash('NEHSAAN7211898', 10);
  let existingAdmin = store.users.find((u) => u.email?.toLowerCase() === superAdminEmail);

  if (!existingAdmin) {
    const adminUserId = store.generateId();
    existingAdmin = {
      _id: adminUserId,
      email: superAdminEmail,
      passwordHash: hashedAdminPassword,
      fullName: 'MaNHSaaN Super Admin',
      phone: '+923235277238',
      role: 'SUPER_ADMIN',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    store.users.push(existingAdmin);
    console.log('[Seed] Initialized Super Admin user: nehsaan@gmail.com');
  } else {
    existingAdmin.email = superAdminEmail;
    existingAdmin.passwordHash = hashedAdminPassword;
    existingAdmin.fullName = 'MaNHSaaN Super Admin';
    existingAdmin.phone = '+923235277238';
    existingAdmin.role = 'SUPER_ADMIN';
    existingAdmin.isActive = true;
    console.log('[Seed] Verified Super Admin user: nehsaan@gmail.com');
  }

  // Guarantee Super Admin document is safely stored in MongoDB Atlas UserModel collection
  try {
    await UserModel.updateOne(
      { email: superAdminEmail },
      { $set: existingAdmin },
      { upsert: true }
    );
    console.log('[Seed] Super Admin user successfully verified in MongoDB Atlas UserModel.');
  } catch (err) {
    console.warn('[Seed] Could not directly write Super Admin to MongoDB Atlas:', (err as Error).message);
  }

  // 3. Ensure default product categories exist if completely empty
  if (!store.categories || store.categories.length === 0) {
    store.categories = store.getDefaultCategories();
  }

  // 4. Ensure default boutiques exist if completely empty
  if (!store.boutiques || store.boutiques.length === 0) {
    store.boutiques = store.getDefaultBoutiques();
  }

  // NOTE: Absolutely NO mock/sample products, fake orders, or demo resellers are ever seeded!
  // The system starts with a pristine clean slate; only real products created by Super Admin exist.

  store.saveToDisk();
}
