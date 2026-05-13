'use client';

import { useState } from 'react';
import Filters from '@/app/components/Filters';
import SankeyVisualization from '@/app/components/SankeyVisualization';
import DetailedStats from '@/app/components/DetailedStats';
import UserExplorer from '@/app/components/UserExplorer';
import { mockUsers, filterUsers, FilterState } from '@/app/data/mockData';

export default function Home() {
  const [filters, setFilters] = useState<FilterState>({
    content: [],
    languages: [],
    phases: [],
    statuses: [],
    dateRange: { start: '2024-01-01', end: '2024-12-31' }
  });

  const filteredUsers = filterUsers(mockUsers, filters);

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="text-center mb-6">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-3">
              🎯 User Journey Analytics
            </h1>
            <p className="text-xl text-gray-600">
              Track and analyze user engagement across all platforms and channels
            </p>
          </div>

          {/* Compact Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Total Users in Dataset</p>
              <p className="text-3xl font-bold text-blue-600">{mockUsers.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Filtered Results</p>
              <p className="text-3xl font-bold text-purple-600">{filteredUsers.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 text-center">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Filter Coverage</p>
              <p className="text-3xl font-bold text-green-600">
                {Math.round((filteredUsers.length / mockUsers.length) * 100)}%
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Filters filters={filters} onFilterChange={setFilters} />

        {/* Sankey Visualization */}
        <SankeyVisualization users={filteredUsers} />

        {/* Detailed Stats */}
        <DetailedStats users={filteredUsers} />

        {/* User Explorer */}
        <UserExplorer users={filteredUsers} />
      </div>
    </div>
  );
}
