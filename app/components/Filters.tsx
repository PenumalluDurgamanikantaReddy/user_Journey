'use client';

import { FilterState, CONTENT_SOURCES, LANGUAGES, PHASES, getContentLabel } from '@/app/data/mockData';

interface FiltersProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
}

export default function Filters({ filters, onFilterChange }: FiltersProps) {
  const handleContentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    onFilterChange({ ...filters, content: value ? [value as any] : [] });
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

  const handleDateChange = (field: 'start' | 'end', value: string) => {
    const newRange = {
      ...filters.dateRange,
      [field]: value
    };
    onFilterChange({ ...filters, dateRange: newRange });
  };

  const handleReset = () => {
    onFilterChange({
      content: [],
      languages: [],
      phases: [],
      statuses: [],
      dateRange: { start: '2024-01-01', end: '2024-12-31' }
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex flex-wrap items-center gap-4 text-sm">
        {/* Date Range */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Date</label>
          <input
            type="date"
            value={filters.dateRange.start}
            onChange={(e) => handleDateChange('start', e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-gray-400 text-sm">−</span>
          <input
            type="date"
            value={filters.dateRange.end}
            onChange={(e) => handleDateChange('end', e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Content */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Content</label>
          <select
            value={filters.content[0] || ''}
            onChange={handleContentChange}
            className="px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-w-[140px]"
          >
            <option value="">All</option>
            {CONTENT_SOURCES.map(content => (
              <option key={content} value={content}>{getContentLabel(content)}</option>
            ))}
          </select>
        </div>

        {/* Language */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Language</label>
          <select
            value={filters.languages[0] || ''}
            onChange={handleLanguageChange}
            className="px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-w-[120px]"
          >
            <option value="">All</option>
            {LANGUAGES.map(language => (
              <option key={language} value={language}>{language}</option>
            ))}
          </select>
        </div>

        {/* Phase */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Phase</label>
          <select
            value={filters.phases[0] || ''}
            onChange={handlePhaseChange}
            className="px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white capitalize min-w-[120px]"
          >
            <option value="">All</option>
            {PHASES.map(phase => (
              <option key={phase} value={phase} className="capitalize">{phase}</option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Status</label>
          <select
            value={filters.statuses[0] || ''}
            onChange={handleStatusChange}
            className="px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white capitalize min-w-[110px]"
          >
            <option value="">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Reset Button */}
        <button
          onClick={handleReset}
          className="ml-auto px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
