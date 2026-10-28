'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiRegister, saveAuth, isLoggedIn } from '@/lib/auth';

const BRANCHES = [
  'Computer Science',
  'Information Technology',
  'Electronics & Communication',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Chemical Engineering',
  'Other',
];

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    branch: '',
    year: '1',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isLoggedIn()) router.replace('/dashboard');
  }, [router]);

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!form.name.trim() || form.name.trim().length < 2)
      e.name = 'Name must be at least 2 characters.';
    if (!form.email.trim()) e.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = 'Enter a valid email address.';
    if (!form.password) e.password = 'Password is required.';
    else if (form.password.length < 6)
      e.password = 'Password must be at least 6 characters.';
    if (form.password !== form.confirmPassword)
      e.confirmPassword = 'Passwords do not match.';
    if (!form.branch) e.branch = 'Please select your branch.';
    const yr = parseInt(form.year);
    if (!yr || yr < 1 || yr > 5) e.year = 'Year must be between 1 and 5.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await apiRegister({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        branch: form.branch,
        year: parseInt(form.year),
      });
      saveAuth(res.token, res.user);
      router.push('/dashboard');
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const field = (key: string) => ({
    className: `input ${errors[key] ? 'border-red-400 focus:border-red-400 focus:ring-red-400' : ''}`,
  });

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 to-blue-100 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-brand-600 rounded-2xl mb-3 shadow-lg">
            <span className="text-2xl">🎓</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Smart Campus Assistant</h1>
          <p className="text-gray-500 text-sm mt-1">Create your student account</p>
        </div>

        <div className="card">
          {serverError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Full name */}
            <div>
              <label htmlFor="name" className="label">Full name</label>
              <input id="name" type="text" autoComplete="name" placeholder="Arjun Sharma"
                {...field('name')} value={form.name} disabled={loading}
                onChange={(e) => setForm({ ...form, name: e.target.value })} />
              {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="label">Email address</label>
              <input id="email" type="email" autoComplete="email" placeholder="you@college.edu"
                {...field('email')} value={form.email} disabled={loading}
                onChange={(e) => setForm({ ...form, email: e.target.value })} />
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="label">Password</label>
              <input id="password" type="password" autoComplete="new-password" placeholder="Min 6 characters"
                {...field('password')} value={form.password} disabled={loading}
                onChange={(e) => setForm({ ...form, password: e.target.value })} />
              {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
            </div>

            {/* Confirm password */}
            <div>
              <label htmlFor="confirmPassword" className="label">Confirm password</label>
              <input id="confirmPassword" type="password" autoComplete="new-password" placeholder="Repeat password"
                {...field('confirmPassword')} value={form.confirmPassword} disabled={loading}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} />
              {errors.confirmPassword && <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>}
            </div>

            {/* Branch + Year side by side */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="branch" className="label">Branch</label>
                <select id="branch" {...field('branch')} value={form.branch} disabled={loading}
                  onChange={(e) => setForm({ ...form, branch: e.target.value })}>
                  <option value="">Select…</option>
                  {BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
                {errors.branch && <p className="mt-1 text-xs text-red-600">{errors.branch}</p>}
              </div>
              <div>
                <label htmlFor="year" className="label">Year</label>
                <select id="year" {...field('year')} value={form.year} disabled={loading}
                  onChange={(e) => setForm({ ...form, year: e.target.value })}>
                  {[1, 2, 3, 4, 5].map((y) => (
                    <option key={y} value={y}>Year {y}</option>
                  ))}
                </select>
                {errors.year && <p className="mt-1 text-xs text-red-600">{errors.year}</p>}
              </div>
            </div>

            <button type="submit" className="btn-primary w-full mt-2" disabled={loading}>
              {loading ? (
                <span className="flex items-center gap-2 justify-center">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating account…
                </span>
              ) : 'Create account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            Already have an account?{' '}
            <Link href="/login" className="text-brand-600 font-medium hover:text-brand-700">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
