import { NextFunction, Request, Response } from 'express';
import { verifyAccessToken } from '../utils/jwt.js';

export type Role = 'LISTENER' | 'ARTIST' | 'VERIFIED_ARTIST' | 'ADMIN';

export interface AuthRequest extends Request {
  auth?: { userId: string; role: Role; tokenVersion: number };
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ message: 'Unauthorized' });
  const token = authHeader.replace('Bearer ', '');
  try {
    const payload = verifyAccessToken(token);
    req.auth = { userId: payload.sub, role: payload.role as Role, tokenVersion: payload.tokenVersion };
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
}

export const requireRole = (...roles: Role[]) => (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.auth) return res.status(401).json({ message: 'Unauthorized' });
  if (!roles.includes(req.auth.role)) return res.status(403).json({ message: 'Forbidden' });
  next();
};
