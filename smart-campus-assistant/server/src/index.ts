/**
 * index.ts
 * Express application entry point.
 *
 * Startup sequence:
 *  1. Validate environment variables (throws immediately if any are missing)
 *  2. Connect to PostgreSQL (throws if DB is unreachable)
 *  3. Mount middleware and routes
 *  4. Start HTTP server
 */

import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { connectDB } from './config/db';
import { errorHandler } from './middleware/errorHandler';
import healthRouter from './routes/health.routes';
import authRouter from './routes/auth.routes';

const app = express();

// ─── Middleware ────────────────────────────────────────────────────────────────

// Allow the Next.js dev server (port 3000) to call this API during development.
// In production, replace the origin with your actual domain.
app.use(
  cors({
    origin:
      env.NODE_ENV === 'production'
        ? process.env['ALLOWED_ORIGIN'] ?? 'https://your-domain.com'
        : 'http://localhost:3000',
    credentials: true,
  }),
);

// Parse incoming JSON request bodies
app.use(express.json());

// Parse URL-encoded form data
app.use(express.urlencoded({ extended: true }));

// ─── Routes ───────────────────────────────────────────────────────────────────

app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);

// Placeholder for future modules — each will be imported and mounted here
// app.use('/api/academic',  academicRouter);
// app.use('/api/skills',    skillsRouter);
// etc.

// 404 handler — catches any route not matched above
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' });
});

// ─── Global error handler (must be last) ──────────────────────────────────────
app.use(errorHandler);

// ─── Start server ─────────────────────────────────────────────────────────────

async function startServer(): Promise<void> {
  try {
    // Step 1: Connect to the database before accepting any traffic
    await connectDB();

    // Step 2: Start listening
    app.listen(env.PORT, () => {
      console.log(`[Server] Running in ${env.NODE_ENV} mode`);
      console.log(`[Server] Listening on http://localhost:${env.PORT}`);
      console.log(`[Server] Health check → http://localhost:${env.PORT}/api/health`);
    });
  } catch (error) {
    console.error('[Server] Failed to start:', error);
    process.exit(1);
  }
}

startServer();
