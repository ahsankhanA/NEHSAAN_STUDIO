import bcrypt from 'bcryptjs';
import { store } from '../db/store.js';
import { ENV } from '../config/env.js';
import type { ISettings, IProduct, ISupplier, IReseller, IUser, IOrder } from '../../src/types/index.js';

export const DEFAULT_SETTINGS: ISettings = {
  store: {
    brandName: 'NEHSAAN',
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
  // If products already exist (restored from MongoDB Atlas or storage file), preserve them
  if (store.products.length > 0 && !force) {
    console.log(`[Seed] Live database contains ${store.products.length} products. Preserving your existing custom products without overwriting.`);
    return;
  }

  // Always ensure settings exist
  if (!store.settings || force) {
    store.settings = { ...DEFAULT_SETTINGS };
    console.log('[Seed] Initialized default store and business settings');
  }

  // Seed Suppliers strictly for development if enabled
  if ((store.suppliers.length === 0 || force) && ENV.SEED_DEV_DATA) {
    const s1Id = store.generateId();
    const s2Id = store.generateId();

    const supplier1: ISupplier = {
      _id: s1Id,
      name: 'Supplier 1 - Textile Mills Faisalabad',
      category: 'Ladies Unstitched Suits & Gents Unstitched Suits',
      phone: '+92 300 1234567',
      whatsapp: '+923001234567',
      address: 'Industrial Area, Faisalabad',
      notes: 'Wholesale supplier for premium Lawn, Jacquard & Men Latha',
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const supplier2: ISupplier = {
      _id: s2Id,
      name: 'Supplier 2 - Pret Studio Lahore',
      category: 'Ladies Stitched Suits',
      phone: '+92 321 9876543',
      whatsapp: '+923219876543',
      address: 'Shadman Market, Lahore',
      notes: 'Wholesale supplier for ready-to-wear 3-piece and 2-piece pret sets',
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    store.suppliers = [supplier1, supplier2];
    console.log('[Seed] Initialized 2 suppliers');
  }

  // Seed Products strictly in development mode if enabled and empty
  if (store.products.length === 0 && ENV.SEED_DEV_DATA) {
    const s1 = store.suppliers[0]?._id;
    const s2 = store.suppliers[1]?._id;

    const sampleProducts: IProduct[] = [
      {
        _id: store.generateId(),
        name: 'Noor-e-Zainab Luxury Embroidered Pret',
        slug: 'noor-e-zainab-luxury-embroidered-pret',
        sku: 'NVR-LST-01',
        category: 'Ladies',
        subcategory: 'Stitched',
        brand: 'NIVORA',
        description: 'Exquisitely crafted 3-piece stitched organza shirt paired with silk trousers and a digital-printed chiffon dupatta with intricate gold zardozi border work. Perfect for festive evenings and family gatherings.',
        shortDescription: '3-Piece Stitched Organza & Chiffon Festive Suit',
        retailPrice: 8500,
        compareAtPrice: 10500,
        wholesaleCost: 5600, // Strictly internal
        images: [
          'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80',
          'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1000&q=80',
        ],
        color: 'Dusty Rose & Gold',
        fabric: 'Organza with Silk Lining & Chiffon Dupatta',
        sizes: ['Small', 'Medium', 'Large', 'XL'],
        stock: 15,
        lowStockThreshold: 3,
        stockState: 'in_stock',
        supplierId: s2,
        supplierProductCode: 'PRET-ZNB-101',
        status: 'active',
        featured: true,
        newArrival: true,
        bestSeller: true,
        sale: false,
        tags: ['Pret', '3-Piece', 'Festive', 'Embroidery'],
        seoTitle: 'Noor-e-Zainab Stitched Suit | NEHSAAN Luxury Pret',
        seoDescription: 'Shop Noor-e-Zainab luxury 3-piece stitched suit with Express Courier COD and 7-day exchange.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        _id: store.generateId(),
        name: 'Gul-e-Bahar Embroidered Lawn 3PC',
        slug: 'gul-e-bahar-embroidered-lawn-3pc',
        sku: 'NVR-LUN-02',
        category: 'Ladies',
        subcategory: 'Unstitched',
        brand: 'NIVORA',
        description: 'Premium Swiss voile lawn unstitched 3-piece suit with heavy schiffli embroidered front panel, dyed lawn back and sleeves, digital printed silk dupatta, and dyed cambric trousers.',
        shortDescription: '3-Piece Unstitched Luxury Lawn with Silk Dupatta',
        retailPrice: 5200,
        compareAtPrice: 6500,
        wholesaleCost: 3500,
        images: [
          'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?auto=format&fit=crop&w=1000&q=80',
          'https://images.unsplash.com/photo-1596783049554-47b2c019a868?auto=format&fit=crop&w=1000&q=80',
        ],
        color: 'Teal & Emerald',
        fabric: 'Premium Swiss Voile Lawn & Pure Silk',
        sizes: ['Unstitched (3-Piece)'],
        stock: 24,
        lowStockThreshold: 4,
        stockState: 'in_stock',
        supplierId: s1,
        supplierProductCode: 'UNST-GLB-202',
        status: 'active',
        featured: true,
        newArrival: true,
        bestSeller: false,
        sale: true,
        tags: ['Unstitched', 'Lawn', 'Summer Collection', 'Schiffli'],
        seoTitle: 'Gul-e-Bahar Embroidered Lawn Unstitched Suit | NIVORA',
        seoDescription: 'Authentic embroidered 3-piece unstitched lawn suit with silk dupatta.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        _id: store.generateId(),
        name: 'Shahi Boski Men Unstitched Suit',
        slug: 'shahi-boski-men-unstitched-suit',
        sku: 'NVR-GUN-03',
        category: 'Gents',
        subcategory: 'Unstitched',
        brand: 'NIVORA',
        description: 'Traditional 8-pound weight high-grade micro-filament Chinese Boski blend. Offers superior drape, buttery soft texture, and natural luster. Includes 4 meters fabric with authentic metallic buttons and branded collar label.',
        shortDescription: '4.0 Meters Men Boski Fabric with Buttons & Tags',
        retailPrice: 4800,
        compareAtPrice: 5800,
        wholesaleCost: 3100,
        images: [
          'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1000&q=80',
          'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1000&q=80',
        ],
        color: 'Ivory Cream',
        fabric: 'Imperial 8-Pound Boski Silk Blend',
        sizes: ['4.0 Meters (Unstitched)'],
        stock: 18,
        lowStockThreshold: 3,
        stockState: 'in_stock',
        supplierId: s1,
        supplierProductCode: 'GENT-BSK-303',
        status: 'active',
        featured: true,
        newArrival: false,
        bestSeller: true,
        sale: false,
        tags: ['Gents', 'Unstitched', 'Boski', 'Formal', 'Jumma Wear'],
        seoTitle: 'Shahi Boski Gents Unstitched Suit | NIVORA Menswear',
        seoDescription: 'Premium men Boski fabric 4 meters with buttons and signature packaging.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        _id: store.generateId(),
        name: 'Zari Chiffon Festive Stitched Maxi',
        slug: 'zari-chiffon-festive-stitched-maxi',
        sku: 'NVR-LST-04',
        category: 'Ladies',
        subcategory: 'Stitched',
        brand: 'NIVORA',
        description: 'Floor length ready-to-wear flared chiffon maxi featuring thread and zari handwork on neckline, sleeves and hemline. Comes with matching crepe straight pants and scalloped embroidered dupatta.',
        shortDescription: '3-Piece Flared Chiffon Stitched Formal Maxi',
        retailPrice: 9800,
        compareAtPrice: 12500,
        wholesaleCost: 6400,
        images: [
          'https://images.unsplash.com/photo-1566737236500-c8ac43014a67?auto=format&fit=crop&w=1000&q=80',
          'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=1000&q=80',
        ],
        color: 'Deep Plum & Antiqued Gold',
        fabric: 'Crinkle Chiffon with Pure Silk Lining',
        sizes: ['Small', 'Medium', 'Large'],
        stock: 8,
        lowStockThreshold: 2,
        stockState: 'in_stock',
        supplierId: s2,
        supplierProductCode: 'PRET-MAXI-404',
        status: 'active',
        featured: false,
        newArrival: true,
        bestSeller: false,
        sale: true,
        tags: ['Stitched', 'Pret', 'Wedding', 'Maxi', 'Zari'],
        seoTitle: 'Zari Chiffon Festive Maxi | NEHSAAN Luxury Stitched',
        seoDescription: 'Stitched Pakistani formal maxi with rich zari work. Fast Express Courier COD delivery.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        _id: store.generateId(),
        name: 'Al-Karamat Men Latha Unstitched Suit',
        slug: 'al-karamat-men-latha-unstitched-suit',
        sku: 'NVR-GUN-05',
        category: 'Gents',
        subcategory: 'Unstitched',
        brand: 'NIVORA',
        description: 'Pure 100% Egyptian combed cotton classic crispy latha. Crisp stiff finish with a subtle sheen that stays sharp all day. Guaranteed color fastness and shrinkage controlled.',
        shortDescription: '4.5 Meters Crispy Egyptian Cotton Latha',
        retailPrice: 4200,
        compareAtPrice: 4800,
        wholesaleCost: 2800,
        images: [
          'https://images.unsplash.com/photo-1621072156002-e2fccdc0b176?auto=format&fit=crop&w=1000&q=80',
          'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=1000&q=80',
        ],
        color: 'Pure White',
        fabric: '100% Combed Egyptian Cotton Latha',
        sizes: ['4.5 Meters (Unstitched)'],
        stock: 30,
        lowStockThreshold: 5,
        stockState: 'in_stock',
        supplierId: s1,
        supplierProductCode: 'GENT-LTH-505',
        status: 'active',
        featured: true,
        newArrival: false,
        bestSeller: true,
        sale: false,
        tags: ['Gents', 'Cotton', 'Latha', 'White Kurta', 'Unstitched'],
        seoTitle: 'Al-Karamat White Latha Men Suit | NIVORA',
        seoDescription: 'Crisp white Egyptian cotton unstitched latha suit for men.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        _id: store.generateId(),
        name: 'Meena Jacquard 3PC Unstitched Suit',
        slug: 'meena-jacquard-3pc-unstitched-suit',
        sku: 'NVR-LUN-06',
        category: 'Ladies',
        subcategory: 'Unstitched',
        brand: 'NIVORA',
        description: 'Self-weave zari jacquard shirt with embroidered organza gala neckline, dyed jacquard sleeves and back, contrasted woven organza dupatta, and solid raw silk trousers.',
        shortDescription: '3-Piece Self-Weave Jacquard with Organza Dupatta',
        retailPrice: 6200,
        compareAtPrice: 7500,
        wholesaleCost: 4100,
        images: [
          'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1000&q=80',
          'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=80',
        ],
        color: 'Mustard Amber & Crimson',
        fabric: 'Zari Weave Jacquard & Organza Dupatta',
        sizes: ['Unstitched (3-Piece)'],
        stock: 12,
        lowStockThreshold: 2,
        stockState: 'in_stock',
        supplierId: s1,
        supplierProductCode: 'UNST-JQD-606',
        status: 'active',
        featured: true,
        newArrival: true,
        bestSeller: false,
        sale: false,
        tags: ['Jacquard', 'Ladies', 'Unstitched', 'Festive', '3PC'],
        seoTitle: 'Meena Jacquard 3PC Unstitched | NEHSAAN',
        seoDescription: 'Buy luxury jacquard 3-piece unstitched formal suit with Express Courier COD.',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ];

    store.products = sampleProducts;
    console.log('[Seed] Initialized 6 sample luxury products');
  }

  // Ensure Super Admin exists with exact requested credentials
  const superAdminEmail = 'nehsaan@gmail.com';
  // Resellers are ALWAYS preserved across restarts - never wipe them!
  const existingAdmin = store.users.find((u) => u.email?.toLowerCase() === superAdminEmail);
  const hashedAdminPassword = await bcrypt.hash('NEHSAAN7211898', 10);

  if (!existingAdmin) {
    const adminUserId = store.generateId();
    const adminUser: IUser = {
      _id: adminUserId,
      email: superAdminEmail,
      passwordHash: hashedAdminPassword,
      fullName: 'NEHSAAN Super Admin',
      phone: '+923235277238',
      role: 'SUPER_ADMIN',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    store.users.push(adminUser);
    console.log('[Seed] Initialized Super Admin user: nehsaan@gmail.com (NEHSAAN7211898)');
  } else {
    existingAdmin.email = superAdminEmail;
    existingAdmin.passwordHash = hashedAdminPassword;
    existingAdmin.fullName = 'NEHSAAN Super Admin';
    existingAdmin.phone = '+923235277238';
    existingAdmin.role = 'SUPER_ADMIN';
    existingAdmin.isActive = true;
    console.log('[Seed] Verified Super Admin user: nehsaan@gmail.com');
  }

  // Ensure Boutiques exist
  if (!store.boutiques || store.boutiques.length === 0) {
    store.boutiques = store.getDefaultBoutiques();
    console.log('[Seed] Initialized Curated Boutiques');
  }

  store.saveToDisk();

  // Seed default promo coupons if in development
  if ((store.coupons.length === 0 || force) && ENV.SEED_DEV_DATA) {
    store.coupons = [
      {
        _id: store.generateId(),
        code: 'VIP100',
        type: 'percentage',
        amount: 100, // 100% DISCOUNT for special circle
        minimumSubtotal: 0,
        maxDiscount: 999999,
        usageLimit: 50,
        usedCount: 0,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString(),
        active: true,
      },
      {
        _id: store.generateId(),
        code: 'NEHSAAN50',
        type: 'percentage',
        amount: 50,
        minimumSubtotal: 2000,
        maxDiscount: 15000,
        usageLimit: 100,
        usedCount: 0,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 180 * 24 * 3600 * 1000).toISOString(),
        active: true,
      },
      {
        _id: store.generateId(),
        code: 'WELCOME10',
        type: 'percentage',
        amount: 10,
        minimumSubtotal: 1000,
        maxDiscount: 2000,
        usageLimit: 500,
        usedCount: 0,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 90 * 24 * 3600 * 1000).toISOString(),
        active: true,
      },
      {
        _id: store.generateId(),
        code: 'FLAT500',
        type: 'fixed',
        amount: 500,
        minimumSubtotal: 3000,
        maxDiscount: 500,
        usageLimit: 200,
        usedCount: 0,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 90 * 24 * 3600 * 1000).toISOString(),
        active: true,
      },
    ];
  }

  store.saveToDisk();
}
