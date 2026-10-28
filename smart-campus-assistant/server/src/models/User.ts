/**
 * User.ts
 * Sequelize model for the `users` table.
 *
 * Passwords are NEVER stored in plain text.
 * bcryptjs hashes the password before it reaches the DB (see auth controller).
 * The `password_hash` column is excluded from all API responses.
 */

import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/db';

// All fields on a stored user
export interface UserAttributes {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  branch: string;
  year: number;
  created_at?: Date;
  updated_at?: Date;
}

// Fields optional when creating (id and timestamps are auto-generated)
export type UserCreationAttributes = Optional<
  UserAttributes,
  'id' | 'created_at' | 'updated_at'
>;

export class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  declare id: number;
  declare name: string;
  declare email: string;
  declare password_hash: string;
  declare branch: string;
  declare year: number;
  declare created_at: Date;
  declare updated_at: Date;

  /** Returns a plain object safe to send to the client — no password hash. */
  toSafeObject(): Omit<UserAttributes, 'password_hash'> {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      branch: this.branch,
      year: this.year,
      created_at: this.created_at,
      updated_at: this.updated_at,
    };
  }
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(120),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    branch: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: 'Not specified',
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: { min: 1, max: 5 },
    },
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true,
    underscored: true, // maps createdAt → created_at in the DB
  },
);

export default User;
