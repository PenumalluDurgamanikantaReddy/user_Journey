'use client';

import { useState, useEffect } from 'react';

interface SessionUser {
  email: string;
  expiresAt: string;
}

export default function AuthStatus() {
  const [session, setSession] = useState<{ authenticated: boolean; user: SessionUser | null } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch('/api/auth/session');
        if (res.ok) {
          const data = await res.json();
          setSession(data);
        } else {
          setSession({ authenticated: false, user: null });
        }
      } catch (err) {
        console.error('Failed to fetch session:', err);
        setSession({ authenticated: false, user: null });
      } finally {
        setLoading(false);
      }
    }
    checkSession();
  }, []);

  const handleLogin = () => {
    window.location.href = '/api/auth/login';
  };

  const handleLogout = () => {
    window.location.href = '/api/auth/logout';
  };

  if (loading) {
    return (
      <div className="flex justify-end items-center space-x-2 py-2 px-4 bg-gray-900/40 backdrop-blur-md border border-gray-800 rounded-xl animate-pulse w-full max-w-xs sm:w-auto ml-auto">
        <div className="h-4 w-32 bg-gray-800 rounded"></div>
        <div className="h-8 w-20 bg-gray-800 rounded-lg"></div>
      </div>
    );
  }

  if (session?.authenticated && session.user) {
    return (
      <div className="flex flex-col sm:flex-row items-center justify-between sm:justify-end gap-3 py-2 px-4 bg-[#141a21]/80 backdrop-blur-md border border-emerald-500/20 rounded-xl shadow-lg w-full sm:w-auto ml-auto transition-all duration-300">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-sm font-medium text-gray-300 text-center sm:text-left">
            Connected: <span className="text-emerald-400 font-semibold">{session.user.email}</span>
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="w-full sm:w-auto px-3.5 py-1.5 text-xs font-semibold text-gray-200 bg-gray-850 hover:bg-red-950/40 hover:text-red-200 border border-gray-700 hover:border-red-800/40 rounded-lg transition-all duration-200 cursor-pointer shadow-md hover:shadow-red-950/20"
        >
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between sm:justify-end gap-3 py-2 px-4 bg-[#141a21]/85 backdrop-blur-md border border-amber-500/25 rounded-xl shadow-lg w-full sm:w-auto ml-auto transition-all duration-300">
      <div className="flex items-center gap-2">
        <span className="relative flex h-2.5 w-2.5">
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
        </span>
        <span className="text-sm font-medium text-gray-400 text-center sm:text-left">
          BigQuery: <span className="text-amber-400 font-semibold">Not Connected</span>
        </span>
      </div>
      <button
        onClick={handleLogin}
        className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-gray-900 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 active:scale-95 rounded-lg transition-all duration-200 cursor-pointer shadow-md hover:shadow-amber-500/10"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
        </svg>
        Sign In with Google
      </button>
    </div>
  );
}
