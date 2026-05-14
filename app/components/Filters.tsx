'use client';

import { FilterState, CONTENT_SOURCES, LANGUAGES, PHASES, getContentLabel, ContentSource } from '@/app/data/mockData';

interface FiltersProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
}

export default function Filters({ filters, onFilterChange }: FiltersProps) {
  const handleContentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    onFilterChange({ ...filters, content: value ? [value as ContentSource] : [] });
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    onFilterChange({ ...filters, languages: value ? [value] : [] });
  };

  const handlePhaseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    onFilterChange({ ...filters, phases: value ? [value as typeof PHASES[0]] : [] });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    onFilterChange({ ...filters, statuses: value ? [value as 'active' | 'inactive'] : [] });
  };

  const handleReset = () => {
    onFilterChange({
      content: [],
      languages: [],
      phases: [],
      statuses: [],
      dateRange: filters.dateRange // Keep date range unchanged
    });
  };

  return (
    <div className="bg-gradient-to-r from-[#1a1f2e] to-[#1e2433] light:from-white light:to-gray-50 rounded-2xl shadow-2xl border border-[#2d3548]/50 light:border-gray-200 p-6 mb-8 transition-all duration-300">
      <div className="flex flex-wrap items-center gap-6">
        {/* Content */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-gray-400 light:text-gray-600 uppercase tracking-wider">Content</label>
          <select
            value={filters.content[0] || ''}
            onChange={handleContentChange}
            className="appearance-none px-4 py-2.5 text-sm border-2 border-[#2d3548] light:border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-[#0f1419] light:bg-white text-gray-200 light:text-gray-900 min-w-[160px] transition-all duration-200 cursor-pointer hover:border-blue-500/50 font-medium shadow-lg"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 0.5rem center',
              backgroundSize: '1.5em 1.5em',
              paddingRight: '2.5rem'
            }}
          >
            <option value="">All Content</option>
            {CONTENT_SOURCES.map(content => (
              <option key={content} value={content}>{getContentLabel(content)}</option>
            ))}
          </select>
        </div>

        {/* Language */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-gray-400 light:text-gray-600 uppercase tracking-wider">Language</label>
          <select
            value={filters.languages[0] || ''}
            onChange={handleLanguageChange}
            className="appearance-none px-4 py-2.5 text-sm border-2 border-[#2d3548] light:border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-[#0f1419] light:bg-white text-gray-200 light:text-gray-900 min-w-[140px] transition-all duration-200 cursor-pointer hover:border-blue-500/50 font-medium shadow-lg"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 0.5rem center',
              backgroundSize: '1.5em 1.5em',
              paddingRight: '2.5rem'
            }}
          >
            <option value="">All Languages</option>
            {LANGUAGES.map(language => (
              <option key={language} value={language}>{language}</option>
            ))}
          </select>
        </div>

        {/* Phase */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-gray-400 light:text-gray-600 uppercase tracking-wider">Phase</label>
          <select
            value={filters.phases[0] || ''}
            onChange={handlePhaseChange}
            className="appearance-none px-4 py-2.5 text-sm border-2 border-[#2d3548] light:border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-[#0f1419] light:bg-white text-gray-200 light:text-gray-900 capitalize min-w-[140px] transition-all duration-200 cursor-pointer hover:border-blue-500/50 font-medium shadow-lg"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 0.5rem center',
              backgroundSize: '1.5em 1.5em',
              paddingRight: '2.5rem'
            }}
          >
            <option value="">All Phases</option>
            {PHASES.map(phase => (
              <option key={phase} value={phase} className="capitalize">{phase}</option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-gray-400 light:text-gray-600 uppercase tracking-wider">Status</label>
          <select
            value={filters.statuses[0] || ''}
            onChange={handleStatusChange}
            className="appearance-none px-4 py-2.5 text-sm border-2 border-[#2d3548] light:border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-[#0f1419] light:bg-white text-gray-200 light:text-gray-900 capitalize min-w-[130px] transition-all duration-200 cursor-pointer hover:border-blue-500/50 font-medium shadow-lg"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 0.5rem center',
              backgroundSize: '1.5em 1.5em',
              paddingRight: '2.5rem'
            }}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Reset Button */}
        <div className="flex flex-col gap-2 ml-auto">
          <label className="text-xs font-bold text-transparent uppercase tracking-wider select-none">Reset</label>
          <button
            onClick={handleReset}
            className="group relative px-6 py-2.5 text-sm font-semibold text-gray-300 light:text-gray-700 bg-gradient-to-r from-red-500/10 to-orange-500/10 light:from-red-50 light:to-orange-50 hover:from-red-500/20 hover:to-orange-500/20 light:hover:from-red-100 light:hover:to-orange-100 border-2 border-red-500/30 light:border-red-300 hover:border-red-500 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
          >
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reset Filters
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
