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
    return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  };

  const getPhaseColor = (phase: string) => {
    const colors: Record<string, string> = {
      evangelism: 'bg-blue-100 text-blue-800',
      discipleship: 'bg-purple-100 text-purple-800',
      leadership: 'bg-indigo-100 text-indigo-800',
    };
    return colors[phase] || 'bg-gray-100 text-gray-800';
  };

  const getGoalColor = (goal: string) => {
    return goal === 'church' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800';
  };

  if (users.length === 0) return null;

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 mt-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">User Details</h2>
        <div className="flex gap-2">
          {['date', 'engagement', 'name'].map(sort => (
            <button
              key={sort}
              onClick={() => setSortBy(sort as 'date' | 'engagement' | 'name')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                sortBy === sort
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Sort by {sort === 'engagement' ? 'Engagement' : sort === 'date' ? 'Date' : 'Name'}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b-2 border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Medium</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Language</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Phase</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Engagement</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Goal</th>
            </tr>
          </thead>
          <tbody>
            {sortedUsers.map((user, idx) => (
              <tr
                key={user.id}
                className="border-b border-gray-200 hover:bg-gray-50 transition cursor-pointer"
                onClick={() => setExpandedUser(expandedUser === user.id ? null : user.id)}
              >
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{user.name}</td>
                <td className="px-6 py-4 text-sm text-gray-700 capitalize">{user.medium}</td>
                <td className="px-6 py-4 text-sm text-gray-700">{user.language}</td>
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
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${user.engagementLevel}%` }}
                      />
                    </div>
                    <span className="font-semibold text-gray-900">{user.engagementLevel}%</span>
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
