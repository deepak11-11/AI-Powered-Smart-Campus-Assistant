/**
 * auth.ts
 * Client-side token helpers.
 *
 * Tokens are stored in localStorage so they survive page refreshes.
 * localStorage is fine for a student app — for higher security apps
 * you would use httpOnly cookies instead.
 *
 * IMPORTANT: Never store DB passwords or server secrets here.
 * The JWT itself is safe to store — it only contains userId + email.
 */

import { apiFetch } from './api';

const TOKEN_KEY = 'sca_token';
const USER_KEY = 'sca_user';

export interface StoredUser {
  id: number;
  name: string;
  email: string;
  branch: string;
  year: number;
}

// ─── Token storage ────────────────────────────────────────────────────────────

export function saveAuth(token: string, user: StoredUser): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): StoredUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as StoredUser) : null;
  } catch {
    return null;
  }
}

export function clearAuth(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function isLoggedIn(): boolean {
  return !!getToken();
}

// ─── API calls ────────────────────────────────────────────────────────────────

interface AuthResponse {
  success: boolean;
  token: string;
  user: StoredUser;
  message?: string;
}

export async function apiRegister(data: {
  name: string;
  email: string;
  password: string;
  branch: string;
  year: number;
}): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function apiLogin(data: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  return apiFetch<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function apiMe(): Promise<StoredUser> {
  const token = getToken();
  const res = await apiFetch<{ success: boolean; user: StoredUser }>(
    '/api/auth/me',
    { token: token ?? undefined },
  );
  return res.user;
}

export async function logout(router: { push: (path: string) => void }): Promise<void> {
  clearAuth();
  router.push('/login');
}
