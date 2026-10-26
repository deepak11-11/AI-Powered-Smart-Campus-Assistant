/**
 * db.ts
 * Creates and exports the Sequelize instance that the rest of the
 * application uses to talk to PostgreSQL.
 *
 * sequelize.authenticate() is called once at startup so any
 * misconfiguration (wrong password, DB does not exist, etc.) surfaces
 * immediately with a clear error message.
 */

import { Sequelize } from 'sequelize';
import { env } from './env';

export const sequelize = new Sequelize(env.DB_NAME, env.DB_USER, env.DB_PASSWORD, {
  host: env.DB_HOST,
  port: env.DB_PORT,
  dialect: 'postgres',
  logging: env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

/**
 * Attempts a real connection to the database.
 * Returns true on success, throws on failure.
 */
export async function connectDB(): Promise<void> {
  await sequelize.authenticate();
  console.log('[DB] PostgreSQL connection established successfully.');
}
