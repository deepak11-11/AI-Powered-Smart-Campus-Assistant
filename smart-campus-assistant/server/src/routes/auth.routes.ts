/**
 * auth.routes.ts
 *
 * POST /api/auth/register  — create account
 * POST /api/auth/login     — sign in, get token
 * GET  /api/auth/me        — get current user (requires token)
 */

import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, me } from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

// ─── Validation rules ─────────────────────────────────────────────────────────

const registerRules = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 120 })
    .withMessage('Name must be between 2 and 120 characters.'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please enter a valid email address.')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters.'),
  body('branch')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Branch must be under 100 characters.'),
  body('year')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Year must be between 1 and 5.')
    .toInt(),
];

const loginRules = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please enter a valid email address.')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required.'),
];

// ─── Routes ───────────────────────────────────────────────────────────────────

router.post('/register', registerRules, register);
router.post('/login', loginRules, login);
router.get('/me', requireAuth, me);

export default router;
