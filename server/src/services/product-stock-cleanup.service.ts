import { ProductModel } from '../models/index.js';
import { store } from '../db/store.js';
import { AuditService } from './audit.service.js';
import type { IProduct, UserRole } from '../../src/types/index.js';

export class ProductStockCleanupService {
  private static workerInterval: NodeJS.Timeout | null = null;
  private static isCleaningUp: boolean = false;

  // Exact 3 days in milliseconds (3 * 24 * 60 * 60 * 1000)
  public static readonly THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

  /**
   * Start the background worker for automatic 3-day cleanup of out-of-stock products.
   * Runs immediately on startup, then periodically every 15 minutes.
   */
  public static startWorker(): void {
    if (this.workerInterval) return;

    console.log('[StockCleanup] Initializing 3-Day Out-of-Stock Automatic Cleanup Worker...');

    // Run immediately on boot to clean up any expired products that expired while server was offline / sleeping on Render
    this.cleanupExpiredProducts().catch((err) => {
      console.error('[StockCleanup Boot Error]:', (err as Error).message);
    });

    // Run every 15 minutes (900,000 ms) while backend server is running
    this.workerInterval = setInterval(() => {
      this.cleanupExpiredProducts().catch((err) => {
        console.error('[StockCleanup Interval Error]:', (err as Error).message);
      });
    }, 15 * 60 * 1000);
  }

  /**
   * Stop background worker if needed
   */
  public static stopWorker(): void {
    if (this.workerInterval) {
      clearInterval(this.workerInterval);
      this.workerInterval = null;
      console.log('[StockCleanup] Background worker stopped.');
    }
  }

  /**
   * Set the stock status of a product (IN_STOCK or OUT_OF_STOCK).
   * Server timestamp is authoritative:
   * - When OUT_OF_STOCK: stockStatus = 'OUT_OF_STOCK', outOfStockAt = current server Date
   * - When IN_STOCK: stockStatus = 'IN_STOCK', outOfStockAt = null (cancelling 3-day deletion deadline)
   */
  public static async setProductStockStatus(
    productId: string,
    newStatus: 'IN_STOCK' | 'OUT_OF_STOCK',
    actor?: { id: string; name: string; role: UserRole | 'SYSTEM'; ip?: string }
  ): Promise<IProduct | null> {
    // 1. Locate product in store or DB
    let product = store.products.find((p) => p._id === productId);

    if (!product) {
      const dbDoc = await ProductModel.findById(productId).lean();
      if (!dbDoc) return null;
      product = dbDoc as unknown as IProduct;
    }

    const now = new Date();
    const isOutOfStock = newStatus === 'OUT_OF_STOCK';

    // 2. Authoritative server updates
    product.stockStatus = isOutOfStock ? 'OUT_OF_STOCK' : 'IN_STOCK';
    product.outOfStockAt = isOutOfStock ? now.toISOString() : null;
    product.stockState = isOutOfStock ? 'out_of_stock' : 'in_stock';
    product.stock = isOutOfStock ? 0 : (product.stock > 0 ? product.stock : 25);
    product.updatedAt = now.toISOString();

    // 3. Persist directly to MongoDB Atlas
    await ProductModel.updateOne(
      { _id: product._id },
      {
        $set: {
          stockStatus: product.stockStatus,
          outOfStockAt: isOutOfStock ? now : null,
          stockState: product.stockState,
          stock: product.stock,
          updatedAt: product.updatedAt,
        },
      }
    );

    // 4. Update in-memory store
    const storeIdx = store.products.findIndex((p) => p._id === productId);
    if (storeIdx !== -1) {
      store.products[storeIdx] = { ...product };
    } else {
      store.products.unshift({ ...product });
    }

    // 5. Audit Logging
    if (actor) {
      AuditService.log({
        actorId: actor.id,
        actorName: actor.name,
        actorRole: actor.role,
        action: isOutOfStock ? 'PRODUCT_MARKED_OUT_OF_STOCK' : 'PRODUCT_MARKED_IN_STOCK',
        targetType: 'PRODUCT',
        targetId: product._id,
        metadata: {
          name: product.name,
          sku: product.sku,
          stockStatus: product.stockStatus,
          outOfStockAt: product.outOfStockAt,
        },
        ip: actor.ip,
      });
    }

    console.log(
      `[StockCleanup] Product "${product.name}" (${product._id}) is now ${product.stockStatus} (outOfStockAt: ${product.outOfStockAt || 'null'}).`
    );

    return product;
  }

  /**
   * Find and permanently delete all products that have been OUT_OF_STOCK for 3 days or longer.
   * Condition: stockStatus = 'OUT_OF_STOCK' AND outOfStockAt <= current server time - 3 days.
   * Safe, idempotent, database-driven.
   */
  public static async cleanupExpiredProducts(): Promise<{
    deletedCount: number;
    deletedProducts: { id: string; name: string; sku: string; outOfStockAt: Date }[];
  }> {
    if (this.isCleaningUp) {
      console.log('[StockCleanup] Cleanup already in progress, skipping concurrent run.');
      return { deletedCount: 0, deletedProducts: [] };
    }

    this.isCleaningUp = true;
    try {
      const now = new Date();
      const cutoffTime = new Date(now.getTime() - this.THREE_DAYS_MS);

      // Query MongoDB Atlas directly for authoritative truth
      // Matches products where stockStatus = 'OUT_OF_STOCK' AND outOfStockAt <= current server time - 3 days
      const expiredQuery = {
        $or: [
          {
            stockStatus: 'OUT_OF_STOCK',
            outOfStockAt: { $ne: null, $lte: cutoffTime },
          },
          {
            stockStatus: 'OUT_OF_STOCK',
            outOfStockAt: { $ne: null, $lte: cutoffTime.toISOString() },
          },
          {
            stockState: 'out_of_stock',
            stockStatus: { $ne: 'IN_STOCK' },
            outOfStockAt: { $ne: null, $lte: cutoffTime },
          },
          {
            stockState: 'out_of_stock',
            stockStatus: { $ne: 'IN_STOCK' },
            outOfStockAt: { $ne: null, $lte: cutoffTime.toISOString() },
          },
        ],
      };

      // Also ensure any out-of-stock product with missing outOfStockAt gets stamped with now
      try {
        await ProductModel.updateMany(
          { stockStatus: 'OUT_OF_STOCK', outOfStockAt: null },
          { $set: { outOfStockAt: now } }
        );
      } catch {}

      const expiredDocs = await ProductModel.find(expiredQuery)
        .select('_id name sku outOfStockAt')
        .lean();

      if (!expiredDocs || expiredDocs.length === 0) {
        return { deletedCount: 0, deletedProducts: [] };
      }

      const expiredIds = expiredDocs.map((d: any) => String(d._id));
      const deletedInfo = expiredDocs.map((d: any) => ({
        id: String(d._id),
        name: d.name || 'Unnamed Product',
        sku: d.sku || '',
        outOfStockAt: d.outOfStockAt,
      }));

      // 1. Permanently delete from MongoDB Atlas
      const deleteResult = await ProductModel.deleteMany({ _id: { $in: expiredIds } });

      // 2. Remove from in-memory store
      store.products = store.products.filter((p) => !expiredIds.includes(p._id));

      // 3. Log audit entries
      for (const item of deletedInfo) {
        AuditService.log({
          actorId: 'SYSTEM_SCHEDULER',
          actorName: 'Nehsaan 3-Day Auto Cleanup Engine',
          actorRole: 'SUPER_ADMIN',
          action: 'PRODUCT_AUTO_CLEANUP_DELETED',
          targetType: 'PRODUCT',
          targetId: item.id,
          metadata: {
            name: item.name,
            sku: item.sku,
            reason: '3-Day Out of Stock Retention Expired',
            outOfStockAt: item.outOfStockAt,
            deletedAt: now.toISOString(),
          },
        });
      }

      console.log(
        `[StockCleanup] Successfully deleted ${deleteResult.deletedCount} expired out-of-stock product(s) from MongoDB Atlas.`
      );

      return {
        deletedCount: deleteResult.deletedCount || expiredIds.length,
        deletedProducts: deletedInfo,
      };
    } catch (err) {
      console.error('[StockCleanup Error]:', (err as Error).message);
      return { deletedCount: 0, deletedProducts: [] };
    } finally {
      this.isCleaningUp = false;
    }
  }

  /**
   * Delete ALL products currently marked as OUT_OF_STOCK (manual admin action).
   * Does NOT touch IN_STOCK products.
   */
  public static async removeAllOutOfStockProducts(actor?: {
    id: string;
    name: string;
    role: UserRole | 'SYSTEM';
    ip?: string;
  }): Promise<{
    deletedCount: number;
    deletedProducts: { id: string; name: string; sku: string }[];
  }> {
    // 1. Find all OUT_OF_STOCK products in MongoDB Atlas (Never delete IN_STOCK products)
    const query = {
      $or: [
        { stockStatus: 'OUT_OF_STOCK' },
        {
          stockStatus: { $ne: 'IN_STOCK' },
          $or: [
            { stockState: 'out_of_stock' },
            { stock: { $lte: 0 } },
          ],
        },
      ],
    };

    const outOfStockDocs = await ProductModel.find(query)
      .select('_id name sku')
      .lean();

    if (!outOfStockDocs || outOfStockDocs.length === 0) {
      return { deletedCount: 0, deletedProducts: [] };
    }

    const idsToDelete = outOfStockDocs.map((d: any) => String(d._id));
    const deletedInfo = outOfStockDocs.map((d: any) => ({
      id: String(d._id),
      name: d.name || 'Unnamed Product',
      sku: d.sku || '',
    }));

    // 2. Permanently delete from MongoDB Atlas
    const deleteResult = await ProductModel.deleteMany({ _id: { $in: idsToDelete } });

    // 3. Remove from in-memory store
    store.products = store.products.filter((p) => !idsToDelete.includes(p._id));

    // 4. Log audit entries
    if (actor) {
      AuditService.log({
        actorId: actor.id,
        actorName: actor.name,
        actorRole: actor.role,
        action: 'ALL_OUT_OF_STOCK_PRODUCTS_DELETED',
        targetType: 'PRODUCT',
        targetId: 'BATCH_DELETE',
        metadata: {
          count: deleteResult.deletedCount,
          deletedIds: idsToDelete,
        },
        ip: actor.ip,
      });
    }

    console.log(
      `[StockCleanup] Admin "${actor?.name || 'Admin'}" permanently deleted all ${deleteResult.deletedCount} out-of-stock products.`
    );

    return {
      deletedCount: deleteResult.deletedCount || idsToDelete.length,
      deletedProducts: deletedInfo,
    };
  }
}
