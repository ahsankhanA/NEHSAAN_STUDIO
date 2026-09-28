import { store } from '../db/store.js';
import type { IAuditLog, UserRole } from '../../src/types/index.js';

export class AuditService {
  public static log(params: {
    actorId: string;
    actorName: string;
    actorRole: UserRole | 'SYSTEM';
    action: string;
    targetType: string;
    targetId?: string;
    metadata?: Record<string, any>;
    ip?: string;
  }): IAuditLog {
    const entry: IAuditLog = {
      _id: store.generateId(),
      actorId: params.actorId,
      actorName: params.actorName,
      actorRole: params.actorRole,
      action: params.action,
      targetType: params.targetType,
      targetId: params.targetId,
      metadata: params.metadata,
      timestamp: new Date().toISOString(),
      ip: params.ip,
    };

    store.auditLogs.unshift(entry);
    // Keep max 2000 logs in memory/store
    if (store.auditLogs.length > 2000) {
      store.auditLogs = store.auditLogs.slice(0, 2000);
    }
    store.saveToDisk();
    return entry;
  }
}
