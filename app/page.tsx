'use client';

import { useState, useEffect } from 'react';
import { ThemeProvider } from '@/app/components/ThemeProvider';
import ThemeToggle from '@/app/components/ThemeToggle';
import Filters from '@/app/components/Filters';
import SankeyVisualization from '@/app/components/SankeyVisualization';
import DetailedStats from '@/app/components/DetailedStats';
import AuthStatus from '@/app/components/AuthStatus';
import { FilterState } from '@/app/data/mockData';
import { useAnalyticsData } from '@/app/hooks/useAnalyticsData';

interface SessionState {
  authenticated: boolean;
  user: {
    email: string;
    expiresAt: string;
  } | null;
}

function BigQueryRunner({ isAuthenticated }: { isAuthenticated: boolean }) {
  const [query, setQuery] = useState(
    'SELECT\n  COUNT(*) AS total_rows,\n  SUM(SUBSCRIPTIONS) AS total_subscriptions\nFROM `dashboard-data-421414.globalrize_india.youversion_combined_language_statistics`'
  );
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRunQuery = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError(null);
    setResults(null);
    try {
      const res = await fetch('/api/bigquery/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sql: query }),
      });
      const data = await res.json();
      if (!res.ok || data.success === false) {
        throw new Error(data.error || 'Failed to execute query');
      }
      setResults(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown query execution error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative overflow-hidden bg-[#141a21]/60 backdrop-blur-md border border-gray-800 rounded-2xl p-6 shadow-xl mb-8">
      {/* Locked Overlay if not Authenticated */}
      {!isAuthenticated && (
        <div className="absolute inset-0 bg-[#0f1419]/70 backdrop-blur-md flex flex-col items-center justify-center z-20 p-6 text-center transition-all duration-300">
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-full p-4 mb-4">
            <svg className="w-8 h-8 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-100 mb-2">Google BigQuery REST API Explorer</h3>
          <p className="text-sm text-gray-400 max-w-md mb-6">
            Execute SQL queries directly against your Google Cloud BigQuery datasets. Authentication is required to securely call the REST endpoints.
          </p>
          <a
            href="/api/auth/login"
            className="flex items-center gap-2 px-6 py-3 bg-amber-400 hover:bg-amber-300 text-gray-900 font-bold rounded-xl transition-all duration-200 shadow-lg hover:shadow-amber-500/10 cursor-pointer active:scale-95"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
            </svg>
            Authenticate with Google
          </a>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
        <h2 className="text-xl font-bold text-gray-100 flex items-center gap-2">
          ⚡ BigQuery REST Query Explorer
        </h2>
        <span className="text-xs text-gray-400 font-mono bg-gray-900/80 px-2.5 py-1 rounded-lg border border-gray-800">
          POST /api/bigquery/query
        </span>
      </div>

      <div className="mb-4">
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          rows={4}
          className="w-full bg-[#0a0d11] text-gray-100 font-mono text-sm p-4 rounded-xl border border-gray-700 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none transition-all resize-y"
          placeholder="Enter standard SQL..."
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <span className="text-xs text-gray-400 max-w-lg">
          * Executes directly through Google REST API with the active account's billing context under project{' '}
          <code className="bg-gray-900 border border-gray-800 text-amber-300 font-semibold px-1.5 py-0.5 rounded">
            dashboard-data-421414
          </code>.
        </span>
        <button
          onClick={handleRunQuery}
          disabled={loading || !query.trim()}
          className="w-full sm:w-auto px-6 py-2.5 bg-amber-400 hover:bg-amber-350 disabled:bg-gray-850 disabled:text-gray-500 text-gray-900 font-bold rounded-xl transition-all duration-250 shadow-md hover:shadow-amber-500/10 cursor-pointer flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4 text-gray-900" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Executing Query...
            </>
          ) : (
            'Run Query'
          )}
        </button>
      </div>

      {error && (
        <div className="bg-red-950/30 border border-red-800/40 rounded-xl p-4 text-red-400 text-sm mt-6 animate-fadeIn">
          <div className="font-semibold mb-1">REST Request Error</div>
          <p className="font-mono text-xs overflow-x-auto whitespace-pre-wrap">{error}</p>
        </div>
      )}

      {results && (
        <div className="mt-6 border-t border-gray-800 pt-6 animate-fadeIn">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-semibold text-gray-300">
              Response Data ({results.length} rows returned)
            </h3>
          </div>
          
          <div className="overflow-x-auto border border-gray-800 rounded-xl bg-[#0a0d11] max-h-96">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-900/60 border-b border-gray-800 sticky top-0">
                  {results.length > 0 && Object.keys(results[0]).map((key) => (
                    <th key={key} className="p-3 text-gray-400 font-semibold uppercase tracking-wider bg-gray-900/90">
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {results.length > 0 ? (
                  results.map((row, rIdx) => (
                    <tr key={rIdx} className="border-b border-gray-850 hover:bg-gray-800/20">
                      {Object.values(row).map((val: any, cIdx) => (
                        <td key={cIdx} className="p-3 text-gray-300 font-mono whitespace-nowrap">
                          {typeof val === 'object' && val !== null ? JSON.stringify(val) : String(val)}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="p-4 text-center text-gray-500">Query returned zero rows.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function HomeContent() {
  const [filters, setFilters] = useState<FilterState>({
    countries: [],
    languages: [],
    brands: [],
    contentSources: [],
    phases: [],
    conversationTypes: [],
    goals: [],
    // Use a wide open range so live data (dated today) is never filtered out by default
    dateRange: { start: '2020-01-01', end: '2099-12-31' }
  });

  const [session, setSession] = useState<SessionState | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    async function fetchSession() {
      try {
        const res = await fetch('/api/auth/session');
        if (res.ok) {
          const data = await res.json();
          setSession(data);
        }
      } catch (err) {
        console.error('Failed to retrieve OAuth session status:', err);
      } finally {
        setAuthChecked(true);
      }
    }
    fetchSession();
  }, []);

  // Build analytics filters from the UI filter state.
  // Only send a year filter when the user has selected a specific year range
  // (i.e. start and end are in the same calendar year). Otherwise fetch all years.
  const startYear = filters.dateRange.start ? new Date(filters.dateRange.start).getFullYear() : null;
  const endYear   = filters.dateRange.end   ? new Date(filters.dateRange.end).getFullYear()   : null;
  const analyticsFilters = {
    year:  startYear && endYear && startYear === endYear ? startYear.toString() : undefined,
    brand: filters.brands.length === 1 ? filters.brands[0] : undefined,
  };

  // Fetch live data from BigQuery APIs
  const { data: analyticsData, loading: analyticsLoading, error: analyticsError } = useAnalyticsData(analyticsFilters);

  return (
    <div className="min-h-screen bg-[#0f1419] light:bg-gradient-to-br light:from-gray-50 light:via-white light:to-gray-50 py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        {/* Navigation & Auth Status Row */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
          <AuthStatus />
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-100 light:text-gray-900 mb-3">
              🎯 User Journey Analytics
            </h1>
            <p className="text-xl text-gray-400 light:text-gray-600">
              Track and analyze user engagement across all platforms and channels
            </p>
          </div>

          {/* Live BigQuery REST API Section */}
          {authChecked && (
            <BigQueryRunner isAuthenticated={!!session?.authenticated} />
          )}

          {/* Elegant Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            <div className="group relative bg-gradient-to-br from-blue-500/10 to-blue-600/5 light:from-blue-50 light:to-blue-100 rounded-2xl shadow-xl border border-blue-500/20 light:border-blue-200 p-6 text-center transition-all duration-300 hover:shadow-2xl hover:scale-105 hover:border-blue-500/40">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-blue-600/0 group-hover:from-blue-500/5 group-hover:to-blue-600/10 rounded-2xl transition-all duration-300"></div>
              <div className="relative">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-500/20 light:bg-blue-100 mb-3">
                  <svg className="w-6 h-6 text-blue-400 light:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <p className="text-xs font-semibold text-gray-400 light:text-gray-600 uppercase tracking-wider mb-2">Total Users</p>
                {analyticsLoading ? (
                  <div className="h-10 flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                  <p className="text-4xl font-bold text-blue-400 light:text-blue-600 mb-1">
                    {analyticsData.grandTotal.toLocaleString()}
                  </p>
                )}
                <p className="text-xs text-gray-500 light:text-gray-500">across all platforms</p>
              </div>
            </div>

            <div className="group relative bg-gradient-to-br from-purple-500/10 to-purple-600/5 light:from-purple-50 light:to-purple-100 rounded-2xl shadow-xl border border-purple-500/20 light:border-purple-200 p-6 text-center transition-all duration-300 hover:shadow-2xl hover:scale-105 hover:border-purple-500/40">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-purple-600/0 group-hover:from-purple-500/5 group-hover:to-purple-600/10 rounded-2xl transition-all duration-300"></div>
              <div className="relative">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-500/20 light:bg-purple-100 mb-3">
                  <svg className="w-6 h-6 text-purple-400 light:text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                </div>
                <p className="text-xs font-semibold text-gray-400 light:text-gray-600 uppercase tracking-wider mb-2">Active Platforms</p>
                <p className="text-4xl font-bold text-purple-400 light:text-purple-600 mb-1">
                    {analyticsData.platforms.length.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 light:text-gray-500">active platforms</p>
              </div>
            </div>

            <div className="group relative bg-gradient-to-br from-green-500/10 to-green-600/5 light:from-green-50 light:to-green-100 rounded-2xl shadow-xl border border-green-500/20 light:border-green-200 p-6 text-center transition-all duration-300 hover:shadow-2xl hover:scale-105 hover:border-green-500/40">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/0 to-green-600/0 group-hover:from-green-500/5 group-hover:to-green-600/10 rounded-2xl transition-all duration-300"></div>
              <div className="relative">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-500/20 light:bg-green-100 mb-3">
                  <svg className="w-6 h-6 text-green-400 light:text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <p className="text-xs font-semibold text-gray-400 light:text-gray-600 uppercase tracking-wider mb-2">Church Goal</p>
                <p className="text-4xl font-bold text-green-400 light:text-green-600 mb-1">—</p>
                <p className="text-xs text-gray-500 light:text-gray-500">data coming soon</p>
              </div>
            </div>
          </div>

          {/* Analytics error banner */}
          {analyticsError && !analyticsLoading && (
            <div className="mb-6 p-4 bg-amber-950/30 border border-amber-700/40 rounded-xl text-amber-400 text-sm">
              ⚠️ {analyticsError}
            </div>
          )}
        </div>

        {/* Filters */}
        <Filters filters={filters} onFilterChange={setFilters} />

        {/* Sankey Visualization */}
        {analyticsLoading ? (
          <div className="bg-[#1a1f2e] rounded-xl shadow-lg p-12 mb-8 flex flex-col items-center justify-center gap-4">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-400 text-lg">Loading analytics data from BigQuery…</p>
          </div>
        ) : (
          <SankeyVisualization data={analyticsData} />
        )}

        {/* Detailed Stats */}
        <DetailedStats data={analyticsData} />
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <ThemeProvider>
      <HomeContent />
    </ThemeProvider>
  );
}
