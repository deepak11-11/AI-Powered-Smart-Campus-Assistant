/**
 * auth.ts  — JWT authentication middleware
 *
 * Reads the Bearer token from the Authorization header,
 * verifies it with JWT_SECRET, and attaches userId + email
 * to the request object so downstream handlers can use them.
 *
 * Usage:
 *   import { requireAuth } from '../middleware/auth';
 *   router.get('/protected', requireAuth, handler);
 *
 * Returns 401 if token is missing, malformed, or expired.
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface AuthPayload {
  userId: number;
  email: string;
}

// Extend Express Request so TypeScript knows about our custom properties
declare global {
  namespace Express {
    interface Request {
      userId?: number;
      userEmail?: string;
    }
  }
}

export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Authentication required. Please log in.' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as AuthPayload;
    req.userId = payload.userId;
    req.userEmail = payload.email;
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Session expired or invalid. Please log in again.' });
  }
}
