'use client';

import { User, getMediumLabel } from '@/app/data/mockData';

interface StatsProps {
  users: User[];
}

export default function DetailedStats({ users }: StatsProps) {
  if (users.length === 0) return null;

  // Group statistics
  const statsByMedium = users.reduce((acc, user) => {
    const key = user.medium;
    if (!acc[key]) acc[key] = { count: 0, active: 0, church: 0 };
    acc[key].count++;
    if (user.status === 'active') acc[key].active++;
    if (user.goal === 'church') acc[key].church++;
    return acc;
  }, {} as Record<string, { count: number; active: number; church: number }>);

  const statsByPhase = users.reduce((acc, user) => {
    const key = user.phase;
    if (!acc[key]) acc[key] = 0;
    acc[key]++;
    return acc;
  }, {} as Record<string, number>);

  const statsByLanguage = users.reduce((acc, user) => {
    const key = user.language;
    if (!acc[key]) acc[key] = 0;
    acc[key]++;
    return acc;
  }, {} as Record<string, number>);

  const topLanguages = Object.entries(statsByLanguage)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
      {/* Medium Breakdown */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Medium Breakdown</h3>
        <div className="space-y-4">
          {Object.entries(statsByMedium).map(([medium, stats]) => (
            <div key={medium} className="border-l-4 border-blue-500 pl-4">
              <div className="flex justify-between items-center mb-2">
                <p className="font-semibold text-gray-800 capitalize">{getMediumLabel(medium as any)}</p>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-bold">
                  {stats.count}
                </span>
              </div>
              <div className="flex gap-4 text-sm">
                <span className="text-green-600">Active: {stats.active}</span>
                <span className="text-purple-600">Goal: {stats.church}</span>
              </div>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${(stats.count / users.length) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Phase Distribution */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Phase Distribution</h3>
        <div className="space-y-4">
          {Object.entries(statsByPhase).map(([phase, count]) => (
            <div key={phase} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-indigo-500" />
                <span className="font-semibold text-gray-800 capitalize">{phase}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-lg font-bold text-gray-900">{count}</span>
                <span className="text-sm text-gray-600">
                  ({Math.round((count / users.length) * 100)}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Languages */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Top Languages</h3>
        <div className="space-y-4">
          {topLanguages.map(([language, count], idx) => (
            <div key={language} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="font-bold text-gray-500">#{idx + 1}</span>
                <span className="font-semibold text-gray-800">{language}</span>
              </div>
              <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-bold">
                {count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Key Metrics</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center p-4 bg-linear-to-r from-green-50 to-green-100 rounded-lg">
            <span className="text-gray-700">Conversion Rate (to Church)</span>
            <span className="text-2xl font-bold text-green-600">
              {Math.round((users.filter(u => u.goal === 'church').length / users.length) * 100)}%
            </span>
          </div>
          <div className="flex justify-between items-center p-4 bg-linear-to-r from-blue-50 to-blue-100 rounded-lg">
            <span className="text-gray-700">Active Engagement</span>
            <span className="text-2xl font-bold text-blue-600">
              {Math.round((users.filter(u => u.status === 'active').length / users.length) * 100)}%
            </span>
          </div>
          <div className="flex justify-between items-center p-4 bg-linear-to-r from-purple-50 to-purple-100 rounded-lg">
            <span className="text-gray-700">Avg Engagement Level</span>
            <span className="text-2xl font-bold text-purple-600">
              {Math.round(users.reduce((sum, u) => sum + u.engagementLevel, 0) / users.length)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
