/**
 * api.ts
 * Central fetch wrapper.
 *
 * Every module uses apiFetch() instead of calling fetch() directly.
 * This means we only need to change one place if the base URL or
 * auth header logic ever changes.
 *
 * NOTE: NEXT_PUBLIC_API_URL is defined in client/.env.local and is
 * the only environment variable exposed to the browser. No secrets here.
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

interface RequestOptions extends RequestInit {
  token?: string;
}

export async function apiFetch<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { token, headers, ...rest } = options;

  const response = await fetch(`${BASE_URL}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  const data = (await response.json()) as T;

  if (!response.ok) {
    const message =
      (data as { message?: string }).message ?? `HTTP ${response.status}`;
    throw new Error(message);
  }

  return data;
}
