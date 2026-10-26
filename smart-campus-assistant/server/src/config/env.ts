/**
 * env.ts
 * Loads and validates all required environment variables at startup.
 * If a required variable is missing the server will refuse to start —
 * this prevents silent misconfiguration bugs.
 */

import dotenv from 'dotenv';
import path from 'path';

// Load .env from the server root (one level above src/)
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function optionalEnv(key: string, fallback: string): string {
  return process.env[key] ?? fallback;
}

export const env = {
  NODE_ENV: optionalEnv('NODE_ENV', 'development'),
  PORT: parseInt(optionalEnv('PORT', '4000'), 10),

  // Database — all required
  DB_HOST: requireEnv('DB_HOST'),
  DB_PORT: parseInt(requireEnv('DB_PORT'), 10),
  DB_NAME: requireEnv('DB_NAME'),
  DB_USER: requireEnv('DB_USER'),
  DB_PASSWORD: requireEnv('DB_PASSWORD'),

  // Auth — required
  JWT_SECRET: requireEnv('JWT_SECRET'),

  // LLM — optional (chatbot degrades gracefully without it)
  OPENAI_API_KEY: process.env['OPENAI_API_KEY'] ?? '',
  OPENAI_BASE_URL: optionalEnv('OPENAI_BASE_URL', 'https://api.openai.com/v1'),
  LLM_MODEL: optionalEnv('LLM_MODEL', 'gpt-4o-mini'),
};
