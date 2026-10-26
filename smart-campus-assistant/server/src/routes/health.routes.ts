/**
 * health.routes.ts
 * GET /api/health
 *
 * Returns the server status and a live PostgreSQL connectivity check.
 * Use this endpoint to confirm both the server and database are running
 * before testing any other feature.
 *
 * Example successful response:
 * {
 *   "success": true,
 *   "status": "ok",
 *   "timestamp": "2026-10-26T05:30:00.000Z",
 *   "database": "connected",
 *   "environment": "development"
 * }
 */

import { Router, Request, Response } from 'express';
import { sequelize } from '../config/db';
import { env } from '../config/env';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  let dbStatus: 'connected' | 'disconnected' = 'disconnected';
  let dbError: string | undefined;

  try {
    // authenticate() sends a lightweight "SELECT 1" query to check connectivity
    await sequelize.authenticate();
    dbStatus = 'connected';
  } catch (err) {
    dbError = err instanceof Error ? err.message : 'Unknown database error';
  }

  const statusCode = dbStatus === 'connected' ? 200 : 503;

  res.status(statusCode).json({
    success: dbStatus === 'connected',
    status: dbStatus === 'connected' ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    database: dbStatus,
    environment: env.NODE_ENV,
    ...(dbError && { dbError }),
  });
});

export default router;
