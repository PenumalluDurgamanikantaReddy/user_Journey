'use client';

import { FilterState, COUNTRIES, LANGUAGES, BRANDS, PHASES, CONVERSATION_TYPES, GOALS, Country, Phase, ConversationType, Medium, getMediumLabel, Goal } from '@/app/data/mockData';

interface FiltersProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
}

const CONTENT_SOURCES: Medium[] = ['facebook', 'instagram', 'twitter', 'google-ads', 'meta-ads', 'youversion', 'website', 'ai', 'daily-devotionals'];

export default function Filters({ filters, onFilterChange }: FiltersProps) {
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
      dateRange: filters.dateRange
    });
  };

  return (
    <div className="bg-gradient-to-r from-[#1a1f2e] to-[#1e2433] light:from-white light:to-gray-50 rounded-2xl shadow-2xl border border-[#2d3548]/50 light:border-gray-200 p-6 mb-8 transition-all duration-300">
      
      <div className="flex justify-between items-center mb-6 border-b border-gray-700/50 pb-4">
        <h2 className="text-xl font-bold text-gray-100">Filters</h2>
        <button
          onClick={handleReset}
          className="px-4 py-2 text-sm font-semibold text-gray-300 bg-red-500/10 hover:bg-red-500/20 border-red-500/30 border rounded-lg transition-all"
        >
          Reset Filters
        </button>
      </div>

      {/* Platform Filters */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-300 mb-4 border-l-4 border-blue-500 pl-3">Platform Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Content */}
          <div className="bg-[#0f1419] p-4 rounded-xl border border-gray-700/50">
            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Content</h4>
            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
              {CONTENT_SOURCES.map(source => (
                <label key={source} className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input 
                      type="checkbox" 
                      className="peer appearance-none w-5 h-5 border-2 border-gray-600 rounded bg-transparent checked:bg-blue-500 checked:border-blue-500 transition-all cursor-pointer"
                      checked={filters.contentSources.includes(source)}
                      onChange={() => handleContentToggle(source)}
                    />
                    <svg className="absolute w-3.5 h-3.5 pointer-events-none opacity-0 peer-checked:opacity-100 text-white transition-opacity" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 5L4.5 8.5L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <span className="text-sm text-gray-300 group-hover:text-white transition-colors">{getMediumLabel(source)}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Conversations */}
          <div className="bg-[#0f1419] p-4 rounded-xl border border-gray-700/50">
            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Conversations</h4>
            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
              {CONVERSATION_TYPES.map(type => (
                <label key={type} className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input 
                      type="checkbox" 
                      className="peer appearance-none w-5 h-5 border-2 border-gray-600 rounded bg-transparent checked:bg-green-500 checked:border-green-500 transition-all cursor-pointer"
                      checked={filters.conversationTypes.includes(type)}
                      onChange={() => handleConversationToggle(type)}
                    />
                    <svg className="absolute w-3.5 h-3.5 pointer-events-none opacity-0 peer-checked:opacity-100 text-white transition-opacity" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 5L4.5 8.5L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <span className="text-sm text-gray-300 group-hover:text-white transition-colors capitalize">{type}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Goals */}
          <div className="bg-[#0f1419] p-4 rounded-xl border border-gray-700/50">
            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Goal</h4>
            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
              {GOALS.map(goal => (
                <label key={goal} className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input 
                      type="checkbox" 
                      className="peer appearance-none w-5 h-5 border-2 border-gray-600 rounded bg-transparent checked:bg-purple-500 checked:border-purple-500 transition-all cursor-pointer"
                      checked={filters.goals.includes(goal)}
                      onChange={() => handleGoalToggle(goal)}
                    />
                    <svg className="absolute w-3.5 h-3.5 pointer-events-none opacity-0 peer-checked:opacity-100 text-white transition-opacity" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 5L4.5 8.5L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <span className="text-sm text-gray-300 group-hover:text-white transition-colors capitalize">{goal}</span>
                </label>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Brand Filters */}
      <div>
        <h3 className="text-lg font-semibold text-gray-300 mb-4 border-l-4 border-purple-500 pl-3">Brand Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          
          {/* Country */}
          <div className="bg-[#0f1419] p-4 rounded-xl border border-gray-700/50">
            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Country</h4>
            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
              {COUNTRIES.map(country => (
                <label key={country} className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input 
                      type="checkbox" 
                      className="peer appearance-none w-5 h-5 border-2 border-gray-600 rounded bg-transparent checked:bg-blue-400 checked:border-blue-400 transition-all cursor-pointer"
                      checked={filters.countries.includes(country)}
                      onChange={() => handleCountryToggle(country)}
                    />
                    <svg className="absolute w-3.5 h-3.5 pointer-events-none opacity-0 peer-checked:opacity-100 text-white transition-opacity" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 5L4.5 8.5L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <span className="text-sm text-gray-300 group-hover:text-white transition-colors">{country}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Language */}
          <div className="bg-[#0f1419] p-4 rounded-xl border border-gray-700/50">
            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Language</h4>
            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
              {LANGUAGES.map(lang => (
                <label key={lang} className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input 
                      type="checkbox" 
                      className="peer appearance-none w-5 h-5 border-2 border-gray-600 rounded bg-transparent checked:bg-blue-400 checked:border-blue-400 transition-all cursor-pointer"
                      checked={filters.languages.includes(lang)}
                      onChange={() => handleLanguageToggle(lang)}
                    />
                    <svg className="absolute w-3.5 h-3.5 pointer-events-none opacity-0 peer-checked:opacity-100 text-white transition-opacity" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 5L4.5 8.5L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <span className="text-sm text-gray-300 group-hover:text-white transition-colors">{lang}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Phase */}
          <div className="bg-[#0f1419] p-4 rounded-xl border border-gray-700/50">
            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Phase</h4>
            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
              {PHASES.map(phase => (
                <label key={phase} className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input 
                      type="checkbox" 
                      className="peer appearance-none w-5 h-5 border-2 border-gray-600 rounded bg-transparent checked:bg-blue-400 checked:border-blue-400 transition-all cursor-pointer"
                      checked={filters.phases.includes(phase)}
                      onChange={() => handlePhaseToggle(phase)}
                    />
                    <svg className="absolute w-3.5 h-3.5 pointer-events-none opacity-0 peer-checked:opacity-100 text-white transition-opacity" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 5L4.5 8.5L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <span className="text-sm text-gray-300 group-hover:text-white transition-colors capitalize">{phase}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Brand */}
          <div className="bg-[#0f1419] p-4 rounded-xl border border-gray-700/50">
            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Brand</h4>
            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
              {BRANDS.map(brand => (
                <label key={brand} className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input 
                      type="checkbox" 
                      className="peer appearance-none w-5 h-5 border-2 border-gray-600 rounded bg-transparent checked:bg-blue-400 checked:border-blue-400 transition-all cursor-pointer"
                      checked={filters.brands.includes(brand)}
                      onChange={() => handleBrandToggle(brand)}
                    />
                    <svg className="absolute w-3.5 h-3.5 pointer-events-none opacity-0 peer-checked:opacity-100 text-white transition-opacity" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 5L4.5 8.5L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <span className="text-sm text-gray-300 group-hover:text-white transition-colors">{brand}</span>
                </label>
              ))}
            </div>
          </div>

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
