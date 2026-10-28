/**
 * auth.controller.ts
 * Handles: POST /api/auth/register
 *          POST /api/auth/login
 *          GET  /api/auth/me
 *
 * Security rules:
 *  - Passwords hashed with bcrypt (saltRounds = 12)
 *  - JWT signed with JWT_SECRET from env (never exposed to client)
 *  - password_hash is NEVER included in any response
 *  - Email compared case-insensitively
 */

import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import { User } from '../models/User';
import { env } from '../config/env';

const SALT_ROUNDS = 12;
const TOKEN_TTL = '7d'; // token valid for 7 days

// ─── helpers ──────────────────────────────────────────────────────────────────

function signToken(userId: number, email: string): string {
  return jwt.sign({ userId, email }, env.JWT_SECRET, { expiresIn: TOKEN_TTL });
}

function validationError(res: Response, errors: ReturnType<typeof validationResult>) {
  return res.status(422).json({
    success: false,
    message: 'Validation failed.',
    errors: errors.array().map((e) => ({ field: (e as { path?: string }).path ?? 'unknown', message: e.msg })),
  });
}

// ─── POST /api/auth/register ──────────────────────────────────────────────────

export async function register(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) { validationError(res, errors); return; }

    const { name, email, password, branch, year } = req.body as {
      name: string;
      email: string;
      password: string;
      branch: string;
      year: number;
    };

    // Reject duplicate emails (case-insensitive)
    const existing = await User.findOne({
      where: { email: email.toLowerCase().trim() },
    });
    if (existing) {
      res.status(409).json({ success: false, message: 'An account with that email already exists.' });
      return;
    }

    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password_hash,
      branch: branch?.trim() ?? 'Not specified',
      year: Number(year) || 1,
    });

    const token = signToken(user.id, user.email);

    res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      token,
      user: user.toSafeObject(),
    });
  } catch (err) {
    next(err);
  }
}

// ─── POST /api/auth/login ─────────────────────────────────────────────────────

export async function login(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) { validationError(res, errors); return; }

    const { email, password } = req.body as { email: string; password: string };

    const user = await User.findOne({
      where: { email: email.toLowerCase().trim() },
    });

    // Same generic message for both "not found" and "wrong password"
    // prevents email enumeration attacks
    const INVALID_MSG = 'Invalid email or password.';

    if (!user) {
      res.status(401).json({ success: false, message: INVALID_MSG });
      return;
    }

    const passwordValid = await bcrypt.compare(password, user.password_hash);
    if (!passwordValid) {
      res.status(401).json({ success: false, message: INVALID_MSG });
      return;
    }

    const token = signToken(user.id, user.email);

    res.json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: user.toSafeObject(),
    });
  } catch (err) {
    next(err);
  }
}

// ─── GET /api/auth/me (requires valid JWT) ────────────────────────────────────

export async function me(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    // req.userId is attached by the auth middleware
    const userId = (req as Request & { userId?: number }).userId;

    const user = await User.findByPk(userId);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    res.json({ success: true, user: user.toSafeObject() });
  } catch (err) {
    next(err);
  }
}
