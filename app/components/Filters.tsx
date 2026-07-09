'use client';

import { useState, useRef, useEffect } from 'react';
import { FilterState, COUNTRIES, LANGUAGES, BRANDS, PHASES, CONVERSATION_TYPES, GOALS, Country, Phase, ConversationType, Medium, getMediumLabel, Goal } from '@/app/data/mockData';

interface FiltersProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
}

const CONTENT_SOURCES: Medium[] = ['social-media', 'twitter', 'google-ads', 'meta-ads', 'youversion', 'website', 'ai', 'daily-devotionals'];

interface FilterDropdownProps<T> {
  title: string;
  options: T[];
  selectedOptions: T[];
  onToggle: (option: T) => void;
  getLabel?: (option: T) => string;
  colorClass: string;
}

function FilterDropdown<T>({ title, options, selectedOptions, onToggle, getLabel, colorClass }: FilterDropdownProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-[#0f1419] p-4 rounded-xl border border-gray-700/50 flex justify-between items-center text-gray-300 hover:text-white hover:border-gray-500 transition-all"
      >
        <span className="text-sm font-bold uppercase tracking-wider">{title}</span>
        <div className="flex items-center gap-2">
          {selectedOptions.length > 0 && (
            <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-1 rounded-md">
              {selectedOptions.length}
            </span>
          )}
          <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {isOpen && (
        <div className="absolute z-20 w-full mt-2 bg-[#0f1419] border border-gray-700/50 rounded-xl shadow-2xl p-4 max-h-60 overflow-y-auto custom-scrollbar">
          <div className="flex flex-col gap-2">
            {options.map(option => (
              <label key={String(option)} className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center">
                  <input 
                    type="checkbox" 
                    className={`peer appearance-none w-5 h-5 border-2 border-gray-600 rounded bg-transparent ${colorClass} transition-all cursor-pointer`}
                    checked={selectedOptions.includes(option)}
                    onChange={() => onToggle(option)}
                  />
                  <svg className="absolute w-3.5 h-3.5 pointer-events-none opacity-0 peer-checked:opacity-100 text-white transition-opacity" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 5L4.5 8.5L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <span className="text-sm text-gray-300 group-hover:text-white transition-colors capitalize">
                  {getLabel ? getLabel(option) : String(option)}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Filters({ filters, onFilterChange }: FiltersProps) {
  const [localDateRange, setLocalDateRange] = useState({
    start: filters.dateRange?.start || '2020-01',
    end: filters.dateRange?.end || '2099-12'
  });

  useEffect(() => {
    setLocalDateRange({
      start: filters.dateRange?.start || '2020-01',
      end: filters.dateRange?.end || '2099-12'
    });
  }, [filters.dateRange]);

  const toggleArrayItem = <T,>(arr: T[], item: T): T[] => {
    return arr.includes(item) ? arr.filter(i => i !== item) : [...arr, item];
  };

  const handleCountryToggle = (country: Country) => onFilterChange({ ...filters, countries: toggleArrayItem(filters.countries, country) });
  const handleLanguageToggle = (language: string) => onFilterChange({ ...filters, languages: toggleArrayItem(filters.languages, language) });
  const handleBrandToggle = (brand: string) => onFilterChange({ ...filters, brands: toggleArrayItem(filters.brands, brand) });
  const handlePhaseToggle = (phase: Phase) => onFilterChange({ ...filters, phases: toggleArrayItem(filters.phases, phase) });
  
  const handleContentToggle = (content: Medium) => onFilterChange({ ...filters, contentSources: toggleArrayItem(filters.contentSources, content) });
  const handleConversationToggle = (type: ConversationType) => onFilterChange({ ...filters, conversationTypes: toggleArrayItem(filters.conversationTypes, type) });
  const handleGoalToggle = (goal: Goal) => onFilterChange({ ...filters, goals: toggleArrayItem(filters.goals, goal) });

  const handleReset = () => {
    onFilterChange({
      countries: [],
      languages: [],
      brands: [],
      contentSources: [],
      phases: [],
      conversationTypes: [],
      goals: [],
      dateRange: { start: '2020-01', end: '2099-12' }
    });
  };

  const handleDateChange = (field: 'start' | 'end', value: string) => {
    setLocalDateRange(prev => ({
      ...prev,
      [field]: value || (field === 'start' ? '2020-01' : '2099-12')
    }));
  };

  const handleApplyDate = () => {
    onFilterChange({
      ...filters,
      dateRange: localDateRange
    });
  };

  return (
    <div className="bg-gradient-to-r from-[#1a1f2e] to-[#1e2433] light:from-white light:to-gray-50 rounded-2xl shadow-2xl border border-[#2d3548]/50 light:border-gray-200 p-6 mb-8 transition-all duration-300">
      
      <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-6 border-b border-gray-700/50 pb-6 gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-100 mb-4">Filters</h2>
          
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Start Month</label>
              <input
                type="month"
                value={localDateRange.start.slice(0, 7)}
                onChange={(e) => handleDateChange('start', e.target.value)}
                className="bg-[#0f1419] border border-gray-700/50 text-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 transition-all"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">End Month</label>
              <input
                type="month"
                value={localDateRange.end.slice(0, 7)}
                onChange={(e) => handleDateChange('end', e.target.value)}
                className="bg-[#0f1419] border border-gray-700/50 text-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 transition-all"
              />
            </div>
            <button
              onClick={handleApplyDate}
              className="mt-5 px-4 h-[42px] text-sm font-semibold text-gray-900 bg-blue-500 hover:bg-blue-400 rounded-lg transition-all"
            >
              Apply Dates
            </button>
          </div>
        </div>
        
        <button
          onClick={handleReset}
          className="px-4 py-2.5 h-10 text-sm font-semibold text-gray-300 bg-red-500/10 hover:bg-red-500/20 border-red-500/30 border rounded-lg transition-all whitespace-nowrap"
        >
          Reset Filters
        </button>
      </div>

      {/* Platform Filters */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-300 mb-4 border-l-4 border-blue-500 pl-3">Platform Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FilterDropdown
            title="Content"
            options={CONTENT_SOURCES}
            selectedOptions={filters.contentSources}
            onToggle={handleContentToggle}
            getLabel={getMediumLabel}
            colorClass="checked:bg-blue-500 checked:border-blue-500"
          />
          <FilterDropdown
            title="Conversations"
            options={CONVERSATION_TYPES}
            selectedOptions={filters.conversationTypes}
            onToggle={handleConversationToggle}
            colorClass="checked:bg-green-500 checked:border-green-500"
          />
          <FilterDropdown
            title="Goal"
            options={GOALS}
            selectedOptions={filters.goals}
            onToggle={handleGoalToggle}
            colorClass="checked:bg-purple-500 checked:border-purple-500"
          />
        </div>
      </div>

      {/* Brand Filters */}
      <div>
        <h3 className="text-lg font-semibold text-gray-300 mb-4 border-l-4 border-purple-500 pl-3">Brand Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="relative">
            <FilterDropdown
              title="Country"
              options={COUNTRIES}
              selectedOptions={filters.countries}
              onToggle={handleCountryToggle}
              colorClass="checked:bg-blue-400 checked:border-blue-400"
            />
            <span className="absolute -top-1 -right-1 bg-amber-500/80 text-gray-900 text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
              Google Ads only
            </span>
          </div>
          <FilterDropdown
            title="Language"
            options={LANGUAGES}
            selectedOptions={filters.languages}
            onToggle={handleLanguageToggle}
            colorClass="checked:bg-blue-400 checked:border-blue-400"
          />
          <FilterDropdown
            title="Phase"
            options={PHASES}
            selectedOptions={filters.phases}
            onToggle={handlePhaseToggle}
            colorClass="checked:bg-blue-400 checked:border-blue-400"
          />
          <FilterDropdown
            title="Brand"
            options={BRANDS}
            selectedOptions={filters.brands}
            onToggle={handleBrandToggle}
            colorClass="checked:bg-blue-400 checked:border-blue-400"
          />
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}} />
    </div>
  );
}
