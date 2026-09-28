import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { store } from '../db/store.js';
import { dbStatus } from '../config/db.js';
import { ENV } from '../config/env.js';

export class SystemController {
  // Check live storage status and recommendations for Render
  static async getDatabaseStatus(req: Request, res: Response): Promise<void> {
    try {
      res.json({
        engine: dbStatus.mode,
        isConnected: dbStatus.isConnected,
        isAtlasConfigured: Boolean(ENV.MONGODB_URI && ENV.MONGODB_URI.startsWith('mongodb')),
        host: dbStatus.host || null,
        lastError: dbStatus.lastError || null,
        errorDetail: dbStatus.errorDetail || null,
        lastAttemptAt: dbStatus.lastAttemptAt || null,
        counts: {
          products: store.products.length,
          resellers: store.resellers.length,
          orders: store.orders.length,
          users: store.users.length,
          boutiques: store.boutiques.length,
          heroSlides: store.heroSlides.length,
          categories: store.categories.length,
          suppliers: store.suppliers.length,
        },
        message: dbStatus.mode === 'mongodb_atlas'
          ? 'Connected to MongoDB Atlas cloud database. All data is automatically synchronized and permanently preserved across all Render restarts.'
          : (dbStatus.lastError
              ? `MongoDB Connection Error: ${dbStatus.lastError}. ${dbStatus.errorDetail || ''}`
              : 'Running on local persistent JSON store with automatic browser snapshot mirror.'),
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to get system status', error: (error as Error).message });
    }
  }

  // Test any MongoDB connection string in real-time
  static async testDatabaseUri(req: Request, res: Response): Promise<void> {
    try {
      const { uri } = req.body;
      if (!uri || typeof uri !== 'string') {
        res.status(400).json({ success: false, message: 'Please provide a MongoDB connection string (URI).' });
        return;
      }
      const cleanUri = uri.trim();
      if (!cleanUri.startsWith('mongodb://') && !cleanUri.startsWith('mongodb+srv://')) {
        res.status(400).json({ success: false, message: 'Connection string must start with mongodb:// or mongodb+srv://' });
        return;
      }

      console.log('[System DB Test] Verifying MongoDB URI connection...');
      const testConn = await mongoose.createConnection(cleanUri, {
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 12000,
      }).asPromise();

      const host = testConn.host;
      const dbName = testConn.name;
      let collections: string[] = [];
      try {
        if (testConn.db) {
          const cols = await testConn.db.listCollections().toArray();
          collections = cols.map((c) => c.name);
        }
      } catch {}

      await testConn.close();

      res.json({
        success: true,
        host,
        dbName,
        collections,
        message: `Connected successfully to MongoDB Atlas! Cluster: ${host}, Database: ${dbName}. This connection string is valid.`,
      });
    } catch (err: any) {
      const errMsg = err.message || 'Unknown connection error';
      let diagnosis = 'Unknown error';
      if (errMsg.toLowerCase().includes('auth')) {
        diagnosis = 'Aapke Database User ka Password ya Username ghalat hai. MongoDB Atlas me Database Access me ja kar naya user banayein ya password reset karein.';
      } else if (errMsg.toLowerCase().includes('timeout') || errMsg.toLowerCase().includes('serverselection')) {
        diagnosis = 'IP whitelist issue: MongoDB Atlas me Network Access me ja kar "0.0.0.0/0" (Allow Access from Anywhere) verify karein.';
      } else if (errMsg.includes('querySrv') || errMsg.includes('ENOTFOUND')) {
        diagnosis = 'Cluster hostname ghalat hai ya cluster create nahi hua.';
      }

      res.json({
        success: false,
        error: errMsg,
        diagnosis,
        message: `Connection test failed: ${errMsg}. ${diagnosis}`,
      });
    }
  }

  // Switch to new working MongoDB URI live and trigger immediate cloud sync
  static async switchDatabaseUri(req: Request, res: Response): Promise<void> {
    try {
      const { uri } = req.body;
      if (!uri || typeof uri !== 'string') {
        res.status(400).json({ success: false, message: 'URI required' });
        return;
      }

      const cleanUri = uri.trim();
      await mongoose.disconnect().catch(() => {});
      await mongoose.connect(cleanUri, {
        serverSelectionTimeoutMS: 15000,
        connectTimeoutMS: 20000,
        socketTimeoutMS: 45000,
      });

      dbStatus.isConnected = true;
      dbStatus.mode = 'mongodb_atlas';
      dbStatus.host = mongoose.connection.host;
      dbStatus.lastError = undefined;
      dbStatus.errorDetail = undefined;
      ENV.MONGODB_URI = cleanUri;

      // Automatically sync collections & snapshot
      await store.loadFromCloudDatabase();
      // Ensure all current data is saved to MongoDB
      store.saveToDisk();

      res.json({
        success: true,
        message: `Connected live to MongoDB Atlas (${mongoose.connection.host})! Cloud sync is now active. Make sure to also set MONGODB_URI in your Render environment variables so Render uses it on future restarts.`,
        counts: {
          products: store.products.length,
          orders: store.orders.length,
          resellers: store.resellers.length,
        },
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  }

  // Export full backup
  static async exportBackup(req: Request, res: Response): Promise<void> {
    try {
      const backup = store.exportBackup();
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=nehsaan_backup_${Date.now()}.json`);
      res.json(backup);
    } catch (error) {
      res.status(500).json({ message: 'Failed to export backup', error: (error as Error).message });
    }
  }

  // Import / restore backup
  static async restoreBackup(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body;
      if (!data) {
        res.status(400).json({ message: 'No backup data provided' });
        return;
      }
      const result = store.importBackup(data);
      res.json({
        message: 'Database backup restored successfully',
        ...result,
      });
    } catch (error) {
      res.status(500).json({ message: 'Failed to restore backup', error: (error as Error).message });
    }
  }

  // Automatic silent restoration from client mirror when server restarts with reset/empty data
  static async autoRestore(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body;
      if (!data || typeof data !== 'object') {
        res.status(400).json({ message: 'No valid data for auto-restoration' });
        return;
      }

      const clientProducts = Array.isArray(data.products) ? data.products : [];
      const clientProductsCount = clientProducts.length;
      const clientResellersCount = Array.isArray(data.resellers) ? data.resellers.length : 0;

      // Check if client mirror has custom products that server doesn't have
      const serverProductSlugs = new Set(store.products.map((p) => p.slug || p._id));
      const hasUniqueClientProducts = clientProducts.some((p: any) => !serverProductSlugs.has(p.slug || p._id));

      // Only auto-restore if server was restarted with fewer items, missing resellers, unique products, or if forced
      const shouldRestore =
        req.query.force === 'true' ||
        (clientResellersCount > 0 && store.resellers.length === 0) ||
        (clientProductsCount > store.products.length) ||
        hasUniqueClientProducts;

      if (shouldRestore) {
        const result = store.importBackup(data);
        console.log(`[System] Auto-restored state from client mirror! (${result.counts.products} products, ${result.counts.resellers} resellers)`);
        res.json({
          restored: true,
          message: 'Server detected restart or reset: 100% data successfully restored from automated mirror.',
          ...result,
        });
      } else {
        res.json({
          restored: false,
          message: 'Server data is current and healthy. No restoration needed.',
          counts: {
            products: store.products.length,
            resellers: store.resellers.length,
            orders: store.orders.length,
          },
        });
      }
    } catch (error) {
      res.status(500).json({ message: 'Auto-restore failed', error: (error as Error).message });
    }
  }
}
