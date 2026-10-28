'use client';

import { useEffect, useState } from 'react';
import { getStoredUser, StoredUser } from '@/lib/auth';

const MODULES = [
  {
    title: 'Academic Activity',
    description: 'Timetable, assignments, and deadlines.',
    icon: '📚',
    href: '/dashboard/academic',
    color: 'bg-blue-50 border-blue-200',
    iconBg: 'bg-blue-100',
    status: 'Coming in Stage 3',
  },
  {
    title: 'Skill Gap Analysis',
    description: 'Compare your skills against target roles.',
    icon: '🧠',
    href: '/dashboard/skills',
    color: 'bg-purple-50 border-purple-200',
    iconBg: 'bg-purple-100',
    status: 'Coming in Stage 4',
  },
  {
    title: 'Learning Path',
    description: 'Personalised weekly learning roadmap.',
    icon: '🗺️',
    href: '/dashboard/learning',
    color: 'bg-green-50 border-green-200',
    iconBg: 'bg-green-100',
    status: 'Coming in Stage 5',
  },
  {
    title: 'Placement Readiness',
    description: 'Track aptitude, coding, and interviews.',
    icon: '🎯',
    href: '/dashboard/placement',
    color: 'bg-orange-50 border-orange-200',
    iconBg: 'bg-orange-100',
    status: 'Coming in Stage 6',
  },
  {
    title: 'Job Recommendations',
    description: 'Jobs matched to your skills.',
    icon: '💼',
    href: '/dashboard/jobs',
    color: 'bg-yellow-50 border-yellow-200',
    iconBg: 'bg-yellow-100',
    status: 'Coming in Stage 7',
  },
  {
    title: 'AI Career Chatbot',
    description: 'Ask anything about learning and careers.',
    icon: '🤖',
    href: '/dashboard/chatbot',
    color: 'bg-pink-50 border-pink-200',
    iconBg: 'bg-pink-100',
    status: 'Coming in Stage 8',
  },
];

export default function DashboardPage() {
  const [user, setUser] = useState<StoredUser | null>(null);

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  if (!user) return null;

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Welcome banner */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          {greeting}, {user.name.split(' ')[0]} 👋
        </h1>
        <p className="text-gray-500 mt-1">
          {user.branch} · Year {user.year} · Welcome to your Smart Campus dashboard.
        </p>
      </div>

      {/* Profile card */}
      <div className="card mb-8 flex items-center gap-5">
        <div className="w-14 h-14 rounded-2xl bg-brand-100 flex items-center justify-center text-2xl font-bold text-brand-700 flex-shrink-0">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-semibold text-gray-900">{user.name}</h2>
          <p className="text-sm text-gray-500">{user.email}</p>
          <div className="flex gap-3 mt-2">
            <span className="inline-flex items-center text-xs bg-brand-50 text-brand-700 px-2.5 py-1 rounded-full font-medium">
              {user.branch}
            </span>
            <span className="inline-flex items-center text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium">
              Year {user.year}
            </span>
          </div>
        </div>
        <div className="hidden sm:block text-right">
          <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Status</p>
          <p className="text-sm font-semibold text-green-600 mt-0.5">● Active</p>
        </div>
      </div>

      {/* Module grid */}
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
        Modules
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {MODULES.map((mod) => (
          <div
            key={mod.href}
            className={`rounded-xl border p-5 ${mod.color} flex flex-col gap-3`}
          >
            <div className="flex items-start justify-between">
              <div className={`w-10 h-10 rounded-xl ${mod.iconBg} flex items-center justify-center text-xl`}>
                {mod.icon}
              </div>
              <span className="text-xs text-gray-400 font-medium bg-white/70 px-2 py-0.5 rounded-full">
                {mod.status}
              </span>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-800">{mod.title}</h3>
              <p className="text-xs text-gray-500 mt-0.5">{mod.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Stage 2 confirmation notice */}
      <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
        <span className="text-green-500 text-lg mt-0.5">✓</span>
        <div>
          <p className="text-sm font-semibold text-green-800">Stage 2 complete — Authentication is working</p>
          <p className="text-xs text-green-600 mt-0.5">
            You registered, logged in, and reached this protected page. JWT token is stored securely.
            Module pages will be built incrementally in Stages 3–8.
          </p>
        </div>
      </div>
    </div>
  );
}
