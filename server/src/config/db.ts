import mongoose from 'mongoose';
import { ENV } from './env.js';
import { store } from '../db/store.js';

interface DBStatus {
  isConnected: boolean;
  mode: 'mongodb_atlas' | 'embedded_memory';
  host?: string;
  lastError?: string;
  errorDetail?: string;
  lastAttemptAt?: string;
}

export const dbStatus: DBStatus = {
  isConnected: false,
  mode: 'embedded_memory',
};

export async function connectDB(): Promise<void> {
  const uri = ENV.MONGODB_URI?.trim();
  dbStatus.lastAttemptAt = new Date().toISOString();
  if (uri && (uri.startsWith('mongodb://') || uri.startsWith('mongodb+srv://'))) {
    try {
      console.log('[DB] Connecting to MongoDB Atlas cluster with 15s timeout...');
      await mongoose.connect(uri, {
        dbName: 'nehsaan',
        serverSelectionTimeoutMS: 15000,
        connectTimeoutMS: 20000,
        socketTimeoutMS: 45000,
      });
      dbStatus.isConnected = true;
      dbStatus.mode = 'mongodb_atlas';
      dbStatus.host = mongoose.connection.host;
      dbStatus.lastError = undefined;
      dbStatus.errorDetail = undefined;
      console.log(`[DB] Connected successfully to MongoDB Atlas cluster: ${mongoose.connection.host} [database: ${mongoose.connection.db?.databaseName}]`);
      // Automatically load snapshot & collections from cloud MongoDB so server restarts never lose data
      const loadedSomething = await store.loadFromCloudDatabase();
      if (!loadedSomething && store.products.length > 0) {
        console.log('[DB] Cloud database is newly linked. Initializing MongoDB Atlas cluster with active store data...');
        await store.syncToCloudDatabase();
      }
      return;
    } catch (err) {
      const errMsg = (err as Error).message;
      dbStatus.lastError = errMsg;
      if (errMsg.toLowerCase().includes('auth')) {
        dbStatus.errorDetail = 'Authentication Failed: MongoDB Atlas Database User credentials do not match. Check username or reset password in MongoDB Atlas -> Database Access.';
      } else if (errMsg.includes('querySrv') || errMsg.includes('ENOTFOUND')) {
        dbStatus.errorDetail = 'DNS Host Resolution Failed: Could not resolve MongoDB cluster hostname.';
      } else if (errMsg.toLowerCase().includes('timeout') || errMsg.toLowerCase().includes('serverselection')) {
        dbStatus.errorDetail = 'Connection Timeout: Ensure Network Access in MongoDB Atlas has 0.0.0.0/0 enabled.';
      } else {
        dbStatus.errorDetail = errMsg;
      }
      console.error('[DB ERROR] Could not connect to MongoDB Atlas:', errMsg);
      console.warn(`[DB DETAIL] ${dbStatus.errorDetail}`);
      dbStatus.isConnected = false;
      dbStatus.mode = 'embedded_memory';

      // Schedule background reconnection check without blocking execution
      scheduleAtlasReconnect();
    }
  } else {
    console.log('[DB] Running with high-performance persistent local document store (MONGODB_URI not provided).');
    dbStatus.isConnected = true;
    dbStatus.mode = 'embedded_memory';
  }
}

let reconnectTimer: NodeJS.Timeout | null = null;
function scheduleAtlasReconnect() {
  const uri = ENV.MONGODB_URI?.trim();
  if (reconnectTimer || !uri) return;

  reconnectTimer = setInterval(async () => {
    if (dbStatus.mode === 'mongodb_atlas' && mongoose.connection.readyState === 1) {
      if (reconnectTimer) clearInterval(reconnectTimer);
      return;
    }

    try {
      console.log('[DB] Retrying connection to MongoDB Atlas...');
      await mongoose.connect(uri, {
        dbName: 'nehsaan',
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 15000,
      });
      dbStatus.isConnected = true;
      dbStatus.mode = 'mongodb_atlas';
      dbStatus.host = mongoose.connection.host;
      dbStatus.lastError = undefined;
      dbStatus.errorDetail = undefined;
      console.log(`[DB] Successfully linked with MongoDB Atlas cluster: ${mongoose.connection.host}`);
      // Automatically sync collections & snapshot upon reconnection
      await store.loadFromCloudDatabase();
      if (reconnectTimer) clearInterval(reconnectTimer);
    } catch (e) {
      dbStatus.lastAttemptAt = new Date().toISOString();
      dbStatus.lastError = (e as Error).message;
      // Will keep retrying seamlessly in background
    }
  }, 10000);
}

export const connectDatabase = connectDB;
