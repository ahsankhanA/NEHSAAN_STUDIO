import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env.js';
import { store } from '../db/store.js';
import type { IUser, IReseller } from '../../src/types/index.js';

export interface AuthenticatedRequest extends Request {
  user?: IUser;
  reseller?: IReseller;
}

export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required. No token provided.' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, ENV.JWT_SECRET) as { id: string; role: string };
    const user = store.users.find((u) => u._id === decoded.id && u.isActive);

    if (!user) {
      res.status(401).json({ error: 'User account not found or deactivated.' });
      return;
    }

    req.user = user;

    if (user.role === 'RESELLER') {
      const reseller = store.resellers.find((r) => r.userId === user._id || r._id === user.resellerId);
      if (reseller) {
        req.reseller = reseller;
      }
    }

    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired session token.' });
  }
}

export function requireSuperAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (!req.user || req.user.role !== 'SUPER_ADMIN') {
    res.status(403).json({ error: 'Access denied: Super Admin authorization required.' });
    return;
  }
  next();
}

export function requireReseller(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (!req.user || req.user.role !== 'RESELLER') {
    res.status(403).json({ error: 'Access denied: Reseller credentials required.' });
    return;
  }

  const reseller = req.reseller || store.resellers.find((r) => r.userId === req.user?._id);
  if (!reseller) {
    res.status(403).json({ error: 'Reseller profile not found.' });
    return;
  }

  if (reseller.status === 'resigned') {
    res.status(403).json({ error: 'Account access has been closed due to resignation.' });
    return;
  }

  if (reseller.status === 'suspended') {
    res.status(403).json({ error: 'Reseller account has been suspended by administration.' });
    return;
  }

  if (reseller.status !== 'approved') {
    res.status(403).json({ error: `Account status is ${reseller.status}. Access granted upon approval.` });
    return;
  }

  req.reseller = reseller;
  next();
}
