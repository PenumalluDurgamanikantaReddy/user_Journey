'use client';

import { useState } from 'react';
import { ThemeProvider } from '@/app/components/ThemeProvider';
import ThemeToggle from '@/app/components/ThemeToggle';
import Filters from '@/app/components/Filters';
import InteractiveMap from '@/app/components/InteractiveMap';
import SankeyVisualization from '@/app/components/SankeyVisualization';
import DetailedStats from '@/app/components/DetailedStats';
import UserExplorer from '@/app/components/UserExplorer';
import { mockUsers, filterUsers, FilterState } from '@/app/data/mockData';

function HomeContent() {
  const [filters, setFilters] = useState<FilterState>({
    countries: [],
    languages: [],
    brands: [],
    phases: [],
    conversationTypes: [],
    dateRange: { start: '2024-01-01', end: '2024-12-31' }
  });

  const filteredUsers = filterUsers(mockUsers, filters);

  const handleDateChange = (field: 'start' | 'end', value: string) => {
    const newRange = {
      ...filters.dateRange,
      [field]: value
    };
    setFilters({ ...filters, dateRange: newRange });
  };

  return (
    <div className="min-h-screen bg-[#0f1419] light:bg-gradient-to-br light:from-gray-50 light:via-white light:to-gray-50 py-8 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <ThemeToggle />
      
      <div className="max-w-7xl mx-auto">
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
                <p className="text-4xl font-bold text-blue-400 light:text-blue-600 mb-1">{mockUsers.length}</p>
                <p className="text-xs text-gray-500 light:text-gray-500">in dataset</p>
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
                <p className="text-xs font-semibold text-gray-400 light:text-gray-600 uppercase tracking-wider mb-2">Filtered Results</p>
                <p className="text-4xl font-bold text-purple-400 light:text-purple-600 mb-1">{filteredUsers.length}</p>
                <p className="text-xs text-gray-500 light:text-gray-500">matching criteria</p>
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
                <p className="text-xs font-semibold text-gray-400 light:text-gray-600 uppercase tracking-wider mb-2">Coverage</p>
                <p className="text-4xl font-bold text-green-400 light:text-green-600 mb-1">
                  {Math.round((filteredUsers.length / mockUsers.length) * 100)}%
                </p>
                <p className="text-xs text-gray-500 light:text-gray-500">of total data</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters - Above Sankey */}
        <Filters filters={filters} onFilterChange={setFilters} />

        {/* Interactive Map - HIDDEN */}
        {/* <InteractiveMap users={filteredUsers} /> */}

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

export default function Home() {
  return (
    <ThemeProvider>
      <HomeContent />
    </ThemeProvider>
  );
}
