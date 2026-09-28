import { Response } from 'express';
import { store } from '../db/store.js';
import type { AuthenticatedRequest } from '../middleware/auth.middleware.js';

export class AuditController {
  public static async getLogs(req: AuthenticatedRequest, res: Response): Promise<void> {
    const { action, targetType, search } = req.query;
    let list = [...store.auditLogs];

    if (action) {
      list = list.filter((l) => l.action.toLowerCase() === String(action).toLowerCase());
    }

    if (targetType) {
      list = list.filter((l) => l.targetType.toLowerCase() === String(targetType).toLowerCase());
    }

    if (search) {
      const q = String(search).toLowerCase();
      list = list.filter(
        (l) =>
          l.actorName.toLowerCase().includes(q) ||
          l.action.toLowerCase().includes(q) ||
          (l.targetId && l.targetId.includes(q))
      );
    }

    res.json({
      total: list.length,
      logs: list.slice(0, 100), // Return recent 100 entries
    });
  }
}
