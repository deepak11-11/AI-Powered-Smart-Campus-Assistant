/**
 * types/index.ts
 * Shared TypeScript interfaces used across client components.
 * Extended in later stages as new modules are added.
 */

// ─── API wrapper ──────────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface User {
  id: number;
  name: string;
  email: string;
  branch: string;
  year: number;
}

export interface AuthTokenPayload {
  userId: number;
  email: string;
}

// ─── Health check ─────────────────────────────────────────────────────────────

export interface HealthResponse {
  success: boolean;
  status: 'ok' | 'degraded';
  timestamp: string;
  database: 'connected' | 'disconnected';
  environment: string;
  dbError?: string;
}
