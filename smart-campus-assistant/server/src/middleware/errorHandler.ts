/**
 * errorHandler.ts
 * Global Express error-handling middleware.
 * Must be registered LAST (after all routes).
 * Catches any error passed via next(err) and returns a
 * consistent JSON shape so the frontend always knows what to expect.
 */

import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void {
  const statusCode = err.statusCode ?? 500;
  const message =
    err.isOperational || process.env['NODE_ENV'] !== 'production'
      ? err.message
      : 'Something went wrong. Please try again later.';

  console.error(`[ERROR] ${statusCode} — ${err.message}`);
  if (statusCode === 500) {
    console.error(err.stack);
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
}
