/**
 * Landing page (/)
 * For Stage 1 this simply confirms the frontend is running and shows a
 * live status check of the backend health endpoint.
 * Future stages will redirect authenticated users to /dashboard.
 */

'use client';

import { useEffect, useState } from 'react';

interface HealthResponse {
  success: boolean;
  status: string;
  timestamp: string;
  database: string;
  environment: string;
  dbError?: string;
}

export default function HomePage() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

    fetch(`${apiUrl}/api/health`)
      .then((res) => res.json())
      .then((data: HealthResponse) => {
        setHealth(data);
        setLoading(false);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to reach backend');
        setLoading(false);
      });
  }, []);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-gradient-to-br from-brand-50 to-blue-100">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-brand-600 rounded-2xl mb-4 shadow-lg">
            <span className="text-3xl">🎓</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Smart Campus Assistant
          </h1>
          <p className="text-gray-500 text-lg">
            AI-powered academic companion for college students
          </p>
        </div>

        {/* Backend health card */}
        <div className="card mb-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Stage 1 — System Status
          </h2>

          {loading && (
            <div className="flex items-center gap-3 text-gray-500">
              <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">Checking backend…</span>
            </div>
          )}

          {error && (
            <StatusRow
              label="Backend API"
              value="Unreachable"
              ok={false}
              detail={error}
            />
          )}

          {health && (
            <div className="space-y-3">
              <StatusRow
                label="API Server"
                value={health.status === 'ok' ? 'Running' : 'Degraded'}
                ok={health.status === 'ok'}
              />
              <StatusRow
                label="PostgreSQL"
                value={health.database}
                ok={health.database === 'connected'}
                detail={health.dbError}
              />
              <StatusRow
                label="Environment"
                value={health.environment}
                ok
              />
              <StatusRow
                label="Timestamp"
                value={new Date(health.timestamp).toLocaleString()}
                ok
              />
            </div>
          )}
        </div>

        {/* Next steps hint */}
        <p className="text-center text-sm text-gray-400">
          Stage 2 will add authentication. More modules coming soon.
        </p>
      </div>
    </main>
  );
}

// ─── Small helper component ────────────────────────────────────────────────────

function StatusRow({
  label,
  value,
  ok,
  detail,
}: {
  label: string;
  value: string;
  ok: boolean;
  detail?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-sm text-gray-600 font-medium">{label}</span>
      <div className="flex flex-col items-end">
        <span
          className={`inline-flex items-center gap-1.5 text-sm font-semibold ${
            ok ? 'text-green-600' : 'text-red-600'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${ok ? 'bg-green-500' : 'bg-red-500'}`}
          />
          {value}
        </span>
        {detail && (
          <span className="text-xs text-red-400 mt-0.5 text-right max-w-xs">
            {detail}
          </span>
        )}
      </div>
    </div>
  );
}
