'use client';

import { User } from '@/app/data/mockData';
import { useState } from 'react';

interface UserExplorerProps {
  users: User[];
}

export default function UserExplorer({ users }: UserExplorerProps) {
  const [sortBy, setSortBy] = useState<'date' | 'engagement' | 'name'>('date');
  const [expandedUser, setExpandedUser] = useState<string | null>(null);

  const sortedUsers = [...users].sort((a, b) => {
    if (sortBy === 'date') return new Date(b.date).getTime() - new Date(a.date).getTime();
    if (sortBy === 'engagement') return b.engagementLevel - a.engagementLevel;
    return a.name.localeCompare(b.name);
  });

  const getStatusColor = (status: string) => {
    return status === 'active' 
      ? 'bg-green-500/20 dark:bg-green-500/20 light:bg-green-100 text-green-400 dark:text-green-400 light:text-green-800 border border-green-500/30 dark:border-green-500/30 light:border-transparent' 
      : 'bg-gray-500/20 dark:bg-gray-500/20 light:bg-gray-100 text-gray-400 dark:text-gray-400 light:text-gray-800 border border-gray-500/30 dark:border-gray-500/30 light:border-transparent';
  };

  const getPhaseColor = (phase: string) => {
    const colors: Record<string, string> = {
      evangelism: 'bg-blue-500/20 dark:bg-blue-500/20 light:bg-blue-100 text-blue-400 dark:text-blue-400 light:text-blue-800 border border-blue-500/30 dark:border-blue-500/30 light:border-transparent',
      discipleship: 'bg-purple-500/20 dark:bg-purple-500/20 light:bg-purple-100 text-purple-400 dark:text-purple-400 light:text-purple-800 border border-purple-500/30 dark:border-purple-500/30 light:border-transparent',
      leadership: 'bg-indigo-500/20 dark:bg-indigo-500/20 light:bg-indigo-100 text-indigo-400 dark:text-indigo-400 light:text-indigo-800 border border-indigo-500/30 dark:border-indigo-500/30 light:border-transparent',
    };
    return colors[phase] || 'bg-gray-500/20 dark:bg-gray-500/20 light:bg-gray-100 text-gray-400 dark:text-gray-400 light:text-gray-800 border border-gray-500/30 dark:border-gray-500/30 light:border-transparent';
  };

  const getGoalColor = (goal: string) => {
    return goal === 'church' 
      ? 'bg-green-500/20 dark:bg-green-500/20 light:bg-green-100 text-green-400 dark:text-green-400 light:text-green-800 border border-green-500/30 dark:border-green-500/30 light:border-transparent' 
      : 'bg-orange-500/20 dark:bg-orange-500/20 light:bg-orange-100 text-orange-400 dark:text-orange-400 light:text-orange-800 border border-orange-500/30 dark:border-orange-500/30 light:border-transparent';
  };

  if (users.length === 0) return null;

  return (
    <div className="bg-[#1a1f2e] dark:bg-[#1a1f2e] light:bg-white rounded-xl shadow-lg p-8 mt-8 border border-[#2d3548] dark:border-[#2d3548] light:border-transparent transition-colors duration-300">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-100 dark:text-gray-100 light:text-gray-900">User Details</h2>
        <div className="flex gap-2">
          {['date', 'engagement', 'name'].map(sort => (
            <button
              key={sort}
              onClick={() => setSortBy(sort as 'date' | 'engagement' | 'name')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                sortBy === sort
                  ? 'bg-blue-600 text-white'
                  : 'bg-[#0f1419] dark:bg-[#0f1419] light:bg-gray-200 text-gray-400 dark:text-gray-400 light:text-gray-700 hover:bg-[#2d3548] dark:hover:bg-[#2d3548] light:hover:bg-gray-300 border border-[#2d3548]'
              }`}
            >
              Sort by {sort === 'engagement' ? 'Engagement' : sort === 'date' ? 'Date' : 'Name'}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#0f1419] dark:bg-[#0f1419] light:bg-gray-50 border-b-2 border-[#2d3548] dark:border-[#2d3548] light:border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300 dark:text-gray-300 light:text-gray-900">Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300 dark:text-gray-300 light:text-gray-900">Medium</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300 dark:text-gray-300 light:text-gray-900">Language</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300 dark:text-gray-300 light:text-gray-900">Phase</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300 dark:text-gray-300 light:text-gray-900">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300 dark:text-gray-300 light:text-gray-900">Engagement</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-300 dark:text-gray-300 light:text-gray-900">Goal</th>
            </tr>
          </thead>
          <tbody>
            {sortedUsers.map((user, idx) => (
              <tr
                key={user.id}
                className="border-b border-[#2d3548] dark:border-[#2d3548] light:border-gray-200 hover:bg-[#0f1419] dark:hover:bg-[#0f1419] light:hover:bg-gray-50 transition cursor-pointer"
                onClick={() => setExpandedUser(expandedUser === user.id ? null : user.id)}
              >
                <td className="px-6 py-4 text-sm font-medium text-gray-300 dark:text-gray-300 light:text-gray-900">{user.name}</td>
                <td className="px-6 py-4 text-sm text-gray-400 dark:text-gray-400 light:text-gray-700 capitalize">{user.medium}</td>
                <td className="px-6 py-4 text-sm text-gray-400 dark:text-gray-400 light:text-gray-700">{user.language}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPhaseColor(user.phase)}`}>
                    {user.phase}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(user.status)}`}>
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-[#0f1419] dark:bg-[#0f1419] light:bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${user.engagementLevel}%` }}
                      />
                    </div>
                    <span className="font-semibold text-gray-300 dark:text-gray-300 light:text-gray-900">{user.engagementLevel}%</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getGoalColor(user.goal)}`}>
                    {user.goal}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
