import crypto from 'crypto';
import mongoose from 'mongoose';
import {
  SystemSnapshotModel,
  ProductModel,
  OrderModel,
  UserModel,
  ResellerModel,
  SupplierModel,
  SettingsModel,
  CustomerModel,
} from '../models/index.js';
import { ImageOptimizationService } from '../services/image-optimization.service.js';
import type {
  IUser,
  IReseller,
  IProduct,
  ISupplier,
  IOrder,
  ICommission,
  IBonus,
  IPayout,
  ICoupon,
  IReturnRequest,
  IExchangeRequest,
  ISettings,
  IAuditLog,
  INotification,
  ICategory,
  IReview,
  IAbandonedCart,
  IBoutique,
  IHeroSlide,
} from '../../src/types/index.js';

export interface ICustomerDoc {
  _id: string;
  fullName: string;
  phone: string;
  whatsapp: string;
  email?: string;
  address: string;
  city: string;
  province: string;
  totalOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  returnedOrders: number;
  totalSpend: number;
  associatedResellerId?: string | null;
  createdAt: string;
  updatedAt: string;
}

// In-Memory document store with optional disk backing and automatic MongoDB cloud sync
class MemoryDataStore {
  public users: IUser[] = [];
  public resellers: IReseller[] = [];
  public products: IProduct[] = [];
  public suppliers: ISupplier[] = [];
  public orders: IOrder[] = [];
  public commissions: ICommission[] = [];
  public bonuses: IBonus[] = [];
  public payouts: IPayout[] = [];
  public customers: ICustomerDoc[] = [];
  public returns: IReturnRequest[] = [];
  public exchanges: IExchangeRequest[] = [];
  public coupons: ICoupon[] = [];
  public settings: ISettings | null = null;
  public auditLogs: IAuditLog[] = [];
  public notifications: INotification[] = [];
  public categories: ICategory[] = [];
  public reviews: IReview[] = [];
  public abandonedCarts: IAbandonedCart[] = [];
  public boutiques: IBoutique[] = [];
  public heroSlides: IHeroSlide[] = [];

  constructor() {
    this.categories = this.getDefaultCategories();
    this.boutiques = this.getDefaultBoutiques();
    this.heroSlides = this.getDefaultHeroSlides();
    this.reviews = [];
    this.products = [];
    this.orders = [];
    this.resellers = [];
    this.users = [];
    this.customers = [];
    this.suppliers = [];
    this.coupons = [];
  }

  // Automatic Cloud Database Sync on boot or reconnection
  public async loadFromCloudDatabase(): Promise<boolean> {
    try {
      if (mongoose.connection.readyState !== 1) return false;

      // 1. Direct restore from individual ProductModel collection
      try {
        const cloudProducts = await ProductModel.find({}).lean();
        const isClothingProduct = (p: any) => {
          const id = String(p._id || '').toLowerCase();
          const name = String(p.name || '').toLowerCase();
          const cat = String(p.category || '').toLowerCase();
          if (id.startsWith('prod_crispy') || id.startsWith('prod_animal') || id.startsWith('prod_belgian')) return false;
          if (name.includes('broast') || name.includes('fries') || name.includes('shake') || name.includes('burger')) return false;
          if (cat.includes('chicken') || cat.includes('fries') || cat.includes('shake') || cat.includes('beverage') || cat.includes('food')) return false;
          return true;
        };

        const validClothing = (cloudProducts || []).filter(isClothingProduct);
        console.log(`[Store] Synced ${validClothing.length} products directly from MongoDB Atlas products collection.`);
        this.products = validClothing.map((p: any) => ({
          ...p,
          _id: String(p._id),
          stockStatus: p.stockStatus || (p.stock > 0 && p.stockState !== 'out_of_stock' ? 'IN_STOCK' : 'OUT_OF_STOCK'),
          sizes: p.subcategory && p.subcategory.toLowerCase() === 'unstitched' ? ['Unstitched'] : (p.sizes || []),
        }));
      } catch (e) {
        console.warn('[Store] Could not read ProductModel collection:', (e as Error).message);
      }

      // 2. Direct restore from OrderModel collection
      try {
        const cloudOrders = await OrderModel.find({}).lean();
        this.orders = (cloudOrders || []).map((o: any) => ({ ...o, _id: String(o._id) }));
        console.log(`[Store] Synced ${this.orders.length} orders from MongoDB Atlas orders collection.`);
      } catch (e) {
        console.warn('[Store] Could not read OrderModel collection:', (e as Error).message);
      }

      // 3. Direct restore from ResellerModel collection
      try {
        const cloudResellers = await ResellerModel.find({}).lean();
        this.resellers = (cloudResellers || []).map((r: any) => ({ ...r, _id: String(r._id) }));
        console.log(`[Store] Synced ${this.resellers.length} resellers from MongoDB Atlas resellers collection.`);
      } catch (e) {
        console.warn('[Store] Could not read ResellerModel collection:', (e as Error).message);
      }

      // 4. Direct restore from UserModel collection
      try {
        const cloudUsers = await UserModel.find({}).lean();
        const userMap = new Map(this.users.map((u) => [u.email.toLowerCase(), u]));
        for (const u of (cloudUsers || [])) {
          userMap.set(u.email.toLowerCase(), { ...u, _id: String(u._id) } as any);
        }
        this.users = Array.from(userMap.values());
        console.log(`[Store] Synced ${this.users.length} users from MongoDB Atlas users collection.`);
      } catch (e) {
        console.warn('[Store] Could not read UserModel collection:', (e as Error).message);
      }

      // 5. Restore settings, categories, heroSlides, boutiques from snapshot (NEVER products)
      try {
        const snapshot = await SystemSnapshotModel.findOne({ key: 'main_snapshot' }).lean();
        if (snapshot && (snapshot as any).data) {
          const snapData = (snapshot as any).data;
          if (snapData.settings) this.settings = snapData.settings;
          if (snapData.categories && snapData.categories.length > 0) this.categories = snapData.categories;
          if (snapData.boutiques && snapData.boutiques.length > 0) this.boutiques = snapData.boutiques;
          if (snapData.heroSlides && snapData.heroSlides.length > 0) this.heroSlides = snapData.heroSlides;
          if (snapData.coupons && snapData.coupons.length > 0) this.coupons = snapData.coupons;
          if (snapData.suppliers && snapData.suppliers.length > 0) this.suppliers = snapData.suppliers;
        }
      } catch (e) {
        console.warn('[Store] Could not read SystemSnapshotModel:', (e as Error).message);
      }

      console.log(`[Store] MongoDB Cloud Sync COMPLETE: ${this.products.length} Products, ${this.orders.length} Orders, ${this.resellers.length} Resellers.`);
      // Run background WebP optimization on any existing raw base64 images to accelerate catalog delivery
      this.optimizeExistingProductImagesInBackground().catch(() => {});
      return true;
    } catch (err) {
      console.warn('[Store] Cloud database sync error:', (err as Error).message);
      return false;
    }
  }

  public async optimizeExistingProductImagesInBackground(): Promise<void> {
    try {
      let optimizedCount = 0;
      for (const product of this.products) {
        if (
          Array.isArray(product.images) &&
          product.images.some(
            (img) => typeof img === 'string' && img.startsWith('data:image') && !img.startsWith('data:image/webp')
          )
        ) {
          product.images = await ImageOptimizationService.optimizeProductImageList(product.images, 1080, 80);
          optimizedCount++;
          if (mongoose.connection.readyState === 1) {
            ProductModel.updateOne({ _id: product._id }, { $set: { images: product.images } }).catch(() => {});
          }
        }
      }
      if (optimizedCount > 0) {
        console.log(`[Store] Compressed ${optimizedCount} products with heavy images to lightweight WebP in background.`);
      }
    } catch (err) {
      console.warn('[Store] Background image optimization notice:', (err as Error).message);
    }
  }

  public getDefaultCategories(): ICategory[] {
    const now = new Date().toISOString();
    return [
      { _id: 'cat_lawn', name: 'Lawn', slug: 'lawn', description: 'Premium Swiss & Voile Summer Lawn', order: 1, createdAt: now, updatedAt: now },
      { _id: 'cat_chiffon', name: 'Chiffon', slug: 'chiffon', description: 'Luxury Embroidered Pure Chiffon', order: 2, createdAt: now, updatedAt: now },
      { _id: 'cat_organza', name: 'Organza', slug: 'organza', description: 'Formal Festive Embroidered Organza', order: 3, createdAt: now, updatedAt: now },
      { _id: 'cat_boski', name: 'Boski', slug: 'boski', description: 'Authentic Imperial Gents Boski', order: 4, createdAt: now, updatedAt: now },
      { _id: 'cat_jacquard', name: 'Jacquard', slug: 'jacquard', description: 'Woven Zari & Self-Weave Jacquard', order: 5, createdAt: now, updatedAt: now },
      // Dedicated Seasonal Collections
      { _id: 'cat_summer', name: 'Summer', slug: 'summer', description: 'Breezy Swiss Voile & Lawn Summer Edit', order: 6, createdAt: now, updatedAt: now },
      { _id: 'cat_winter', name: 'Winter', slug: 'winter', description: 'Warm Pashmina, Shawl & Velvet Ensembles', order: 7, createdAt: now, updatedAt: now },
      { _id: 'cat_festive', name: 'Festive Wear', slug: 'festive-wear', description: 'Handcrafted Zari & Tilla Wedding Formals', order: 8, createdAt: now, updatedAt: now },
    ];
  }

  public getDefaultReviews(): IReview[] {
    return [];
  }

  public getDefaultBoutiques(): IBoutique[] {
    const now = new Date().toISOString();
    return [
      {
        _id: 'boutique_summer',
        name: 'Summer Edit',
        subtitle: 'Swiss Voile & Light Lawns',
        image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
        categoryQuery: 'Summer',
        fabricQuery: 'Lawn',
        tag: 'Trending',
        order: 1,
        active: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        _id: 'boutique_festive',
        name: 'Festive Wear',
        subtitle: 'Zari & Organza Formals',
        image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80',
        categoryQuery: 'Festive Wear',
        tag: 'Haute Drop',
        order: 2,
        active: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        _id: 'boutique_winter',
        name: 'Winter Collection',
        subtitle: 'Velvet, Shawls & Pashmina',
        image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80',
        categoryQuery: 'Winter',
        fabricQuery: 'Jacquard',
        order: 3,
        active: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        _id: 'boutique_boski',
        name: 'Imperial Boski',
        subtitle: 'Authentic 10-Pound Gents Silk',
        image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80',
        categoryQuery: 'Boski',
        fabricQuery: 'Boski',
        tag: 'Classic',
        order: 4,
        active: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        _id: 'boutique_chiffon',
        name: 'Pure Chiffon',
        subtitle: 'Delicate Embroidered Dupattas',
        image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
        categoryQuery: 'Chiffon',
        fabricQuery: 'Chiffon',
        order: 5,
        active: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        _id: 'boutique_lawn',
        name: 'Swiss Lawn',
        subtitle: 'Printed & Stitched Daily Wear',
        image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80',
        categoryQuery: 'Lawn',
        fabricQuery: 'Lawn',
        order: 6,
        active: true,
        createdAt: now,
        updatedAt: now,
      },
    ];
  }

  public getDefaultHeroSlides(): IHeroSlide[] {
    const now = new Date().toISOString();
    return [
      {
        _id: 'hero_eid_edit',
        tag: 'Limited Festive Drop',
        title: 'Eid Edit 2026',
        subtitle: 'Up to 30% Off Haute Couture Ensembles',
        description: 'Handcrafted zari, resham and tilla embroidery on pure swiss lawn & chiffon. Express Cash on Delivery nationwide.',
        image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=2000&q=80',
        ctaText: 'Shop Eid Edit',
        secondaryCta: 'View Festive Wear',
        category: 'Festive Wear',
        fabric: 'Organza',
        order: 1,
        active: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        _id: 'hero_summer_lawn',
        tag: 'New Season Arrival',
        title: 'Summer Voile & Lawn',
        subtitle: 'Breezy Swiss Weaves & Floral Prints',
        description: 'Ultra-breathable summer textures crafted for effortless daytime sophistication and evening comfort.',
        image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=2000&q=80',
        ctaText: 'Explore Summer Edit',
        secondaryCta: 'Shop Swiss Lawn',
        category: 'Summer',
        fabric: 'Lawn',
        order: 2,
        active: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        _id: 'hero_winter_shawl',
        tag: 'Regal Ensembles',
        title: 'Winter Luxury & Shawls',
        subtitle: 'Pashmina, Raw Silk & Embroidered Velvet',
        description: 'Rich jewel tones, heavy embroidered borders and handcrafted warm shawls for statement occasions.',
        image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=2000&q=80',
        ctaText: 'Explore Winter',
        secondaryCta: 'View Luxury Pret',
        category: 'Winter',
        fabric: 'Jacquard',
        order: 3,
        active: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        _id: 'hero_gents_boski',
        tag: 'Heritage Collection',
        title: 'Imperial Gents Boski & Pret',
        subtitle: 'Authentic 10-Pound Boski Silk & Cotton',
        description: 'Traditional heritage wear tailored for gentlemen. Genuine gold seal fabric with flawless drape and luxury finish.',
        image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=2000&q=80',
        ctaText: 'Shop Gents Boski',
        secondaryCta: 'View All Designs',
        category: 'Boski',
        fabric: 'Boski',
        order: 4,
        active: true,
        createdAt: now,
        updatedAt: now,
      },
    ];
  }

  public saveToDisk() {
    try {
      const data = {
        users: this.users,
        resellers: this.resellers,
        products: this.products,
        suppliers: this.suppliers,
        orders: this.orders,
        commissions: this.commissions,
        bonuses: this.bonuses,
        payouts: this.payouts,
        customers: this.customers,
        returns: this.returns,
        exchanges: this.exchanges,
        coupons: this.coupons,
        settings: this.settings,
        auditLogs: this.auditLogs,
        notifications: this.notifications,
        categories: this.categories,
        reviews: this.reviews,
        abandonedCarts: this.abandonedCarts,
        boutiques: this.boutiques,
        heroSlides: this.heroSlides,
      };

      // AUTOMATIC MONGODB ATLAS CLOUD PERSISTENCE (Single Source of Truth)
      if (mongoose.connection.readyState === 1) {
        // Direct individual product persistence (bypassing 16MB document size limit)
        if (this.products && this.products.length > 0) {
          const bulkProducts = this.products.map((p) => ({
            updateOne: {
              filter: { _id: p._id },
              update: { $set: p },
              upsert: true,
            },
          }));
          ProductModel.bulkWrite(bulkProducts).catch((err) => {
            console.warn('[MongoDB] Product bulk sync warning:', (err as Error).message);
          });
        }

        // Direct orders persistence
        if (this.orders && this.orders.length > 0) {
          const uniqueOrdersMap = new Map();
          for (const o of this.orders) {
            if (o.orderNumber) uniqueOrdersMap.set(o.orderNumber, o);
            else uniqueOrdersMap.set(o._id, o);
          }
          const uniqueOrders = Array.from(uniqueOrdersMap.values());
          const bulkOrders = uniqueOrders.map((o) => ({
            updateOne: {
              filter: { orderNumber: o.orderNumber },
              update: { $set: o },
              upsert: true,
            },
          }));
          OrderModel.bulkWrite(bulkOrders).catch((err) => {
            console.warn('[MongoDB] Order bulk sync warning:', (err as Error).message);
          });
        }

        // Direct resellers persistence
        if (this.resellers && this.resellers.length > 0) {
          const bulkResellers = this.resellers.map((r) => ({
            updateOne: {
              filter: { _id: r._id },
              update: { $set: r },
              upsert: true,
            },
          }));
          ResellerModel.bulkWrite(bulkResellers).catch((err) => {
            console.warn('[MongoDB] Reseller bulk sync warning:', (err as Error).message);
          });
        }

        // Direct users persistence (ensures Super Admin and Resellers are never lost)
        if (this.users && this.users.length > 0) {
          const bulkUsers = this.users.map((u) => ({
            updateOne: {
              filter: { email: u.email.toLowerCase() },
              update: { $set: u },
              upsert: true,
            },
          }));
          UserModel.bulkWrite(bulkUsers).catch((err) => {
            console.warn('[MongoDB] User bulk sync warning:', (err as Error).message);
          });
        }

        // Direct customers persistence
        if (this.customers && this.customers.length > 0) {
          const bulkCustomers = this.customers.map((c) => ({
            updateOne: {
              filter: { phone: c.phone },
              update: { $set: c },
              upsert: true,
            },
          }));
          CustomerModel.bulkWrite(bulkCustomers).catch((err: any) => {
            console.warn('[MongoDB] Customer bulk sync warning:', (err as Error).message);
          });
        }

        // Metadata Snapshot (settings, categories, hero slides, boutiques - NEVER products)
        const metadataOnly = {
          settings: this.settings,
          categories: this.categories,
          boutiques: this.boutiques,
          heroSlides: this.heroSlides,
          coupons: this.coupons,
          suppliers: this.suppliers,
        };
        SystemSnapshotModel.findOneAndUpdate(
          { key: 'main_snapshot' },
          { key: 'main_snapshot', data: metadataOnly, lastSavedAt: new Date().toISOString() },
          { upsert: true }
        ).catch(() => {});
      }
    } catch (e) {
      // Ignore disk write errors if read-only
    }
  }

  // Explicit awaited cloud database sync
  public async syncToCloudDatabase(): Promise<boolean> {
    if (mongoose.connection.readyState !== 1) return false;
    try {
      console.log(`[Store] Uploading and syncing data to MongoDB Atlas (${this.products.length} products, ${this.orders.length} orders, ${this.resellers.length} resellers)...`);
      if (this.products.length > 0) {
        const bulkProducts = this.products.map((p) => ({
          updateOne: {
            filter: { _id: p._id },
            update: { $set: p },
            upsert: true,
          },
        }));
        await ProductModel.bulkWrite(bulkProducts);
      }

      if (this.orders.length > 0) {
        const uniqueOrdersMap = new Map();
        for (const o of this.orders) {
          if (o.orderNumber) uniqueOrdersMap.set(o.orderNumber, o);
          else uniqueOrdersMap.set(o._id, o);
        }
        const uniqueOrders = Array.from(uniqueOrdersMap.values());
        this.orders = uniqueOrders;
        const bulkOrders = uniqueOrders.map((o) => ({
          updateOne: {
            filter: { orderNumber: o.orderNumber },
            update: { $set: o },
            upsert: true,
          },
        }));
        await OrderModel.bulkWrite(bulkOrders);
      }

      if (this.resellers.length > 0) {
        const bulkResellers = this.resellers.map((r) => ({
          updateOne: {
            filter: { _id: r._id },
            update: { $set: r },
            upsert: true,
          },
        }));
        await ResellerModel.bulkWrite(bulkResellers);
      }

      const data = {
        users: this.users,
        resellers: this.resellers,
        products: this.products,
        suppliers: this.suppliers,
        orders: this.orders,
        commissions: this.commissions,
        bonuses: this.bonuses,
        payouts: this.payouts,
        customers: this.customers,
        returns: this.returns,
        exchanges: this.exchanges,
        coupons: this.coupons,
        settings: this.settings,
        auditLogs: this.auditLogs,
        notifications: this.notifications,
        categories: this.categories,
        reviews: this.reviews,
        abandonedCarts: this.abandonedCarts,
        boutiques: this.boutiques,
        heroSlides: this.heroSlides,
      };

      await SystemSnapshotModel.findOneAndUpdate(
        { key: 'main_snapshot' },
        { key: 'main_snapshot', data, lastSavedAt: new Date().toISOString() },
        { upsert: true }
      );

      console.log('[Store] Cloud persistence sync complete! All records permanently saved in MongoDB Atlas.');
      return true;
    } catch (err: any) {
      console.warn('[Store] Could not complete syncToCloudDatabase:', err.message);
      return false;
    }
  }

  public exportBackup(): any {
    return {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      users: this.users,
      resellers: this.resellers,
      products: this.products,
      suppliers: this.suppliers,
      orders: this.orders,
      commissions: this.commissions,
      bonuses: this.bonuses,
      payouts: this.payouts,
      customers: this.customers,
      returns: this.returns,
      exchanges: this.exchanges,
      coupons: this.coupons,
      settings: this.settings,
      categories: this.categories,
      reviews: this.reviews,
      abandonedCarts: this.abandonedCarts,
      boutiques: this.boutiques,
      heroSlides: this.heroSlides,
    };
  }

  public importBackup(data: any): { success: boolean; counts: Record<string, number> } {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid backup data format');
    }

    if (Array.isArray(data.products) && data.products.length > 0) {
      this.products = data.products;
    }
    if (Array.isArray(data.resellers) && data.resellers.length > 0) {
      this.resellers = data.resellers;
    }
    if (Array.isArray(data.users) && data.users.length > 0) {
      // Retain or merge users
      const existingEmails = new Set(this.users.map((u) => u.email.toLowerCase()));
      for (const u of data.users) {
        if (!existingEmails.has(u.email.toLowerCase())) {
          this.users.push(u);
        }
      }
    }
    if (Array.isArray(data.orders)) {
      this.orders = data.orders;
    }
    if (Array.isArray(data.suppliers)) {
      this.suppliers = data.suppliers;
    }
    if (Array.isArray(data.coupons)) {
      this.coupons = data.coupons;
    }
    if (data.settings) {
      this.settings = { ...this.settings, ...data.settings };
    }
    if (Array.isArray(data.categories)) {
      this.categories = data.categories;
    }
    if (Array.isArray(data.reviews)) {
      this.reviews = data.reviews;
    }
    if (Array.isArray(data.boutiques) && data.boutiques.length > 0) {
      this.boutiques = data.boutiques;
    }
    if (Array.isArray(data.heroSlides) && data.heroSlides.length > 0) {
      this.heroSlides = data.heroSlides;
    }

    this.saveToDisk();

    return {
      success: true,
      counts: {
        products: this.products.length,
        resellers: this.resellers.length,
        orders: this.orders.length,
        boutiques: this.boutiques.length,
        heroSlides: this.heroSlides.length,
      },
    };
  }

  public generateId(): string {
    return crypto.randomBytes(12).toString('hex');
  }
}

export const store = new MemoryDataStore();
