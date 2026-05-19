'use client';

import { FilterState, COUNTRIES, LANGUAGES, BRANDS, PHASES, CONVERSATION_TYPES, Country, Phase, ConversationType, Medium, getMediumLabel } from '@/app/data/mockData';

interface FiltersProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
}

// Content sources for the Brand/Content filter
const CONTENT_SOURCES: Medium[] = ['facebook', 'instagram', 'twitter', 'google-ads', 'meta-ads', 'youversion', 'website', 'ai', 'daily-devotionals'];

export default function Filters({ filters, onFilterChange }: FiltersProps) {
  const handleCountryToggle = (country: Country) => {
    const newCountries = filters.countries.includes(country)
      ? filters.countries.filter(c => c !== country)
      : [...filters.countries, country];
    onFilterChange({ ...filters, countries: newCountries });
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    onFilterChange({ ...filters, languages: value ? [value] : [] });
  };

  const handleBrandToggle = (item: string) => {
    const newBrands = filters.brands.includes(item)
      ? filters.brands.filter(b => b !== item)
      : [...filters.brands, item];
    onFilterChange({ ...filters, brands: newBrands });
  };

  const handlePhaseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    onFilterChange({ ...filters, phases: value ? [value as Phase] : [] });
  };

  const handleConversationToggle = (type: ConversationType) => {
    const newTypes = filters.conversationTypes.includes(type)
      ? filters.conversationTypes.filter(t => t !== type)
      : [...filters.conversationTypes, type];
    onFilterChange({ ...filters, conversationTypes: newTypes });
  };

  const handleReset = () => {
    onFilterChange({
      countries: [],
      languages: [],
      brands: [],
      phases: [],
      conversationTypes: [],
      dateRange: filters.dateRange // Keep date range unchanged
    });
  };

  // Get display label for brand/content items
  const getBrandLabel = (item: string): string => {
    // Check if it's a medium (content source)
    if (CONTENT_SOURCES.includes(item as Medium)) {
      return getMediumLabel(item as Medium);
    }
    // Otherwise it's a brand
    return item;
  };

  return (
    <div className="bg-gradient-to-r from-[#1a1f2e] to-[#1e2433] light:from-white light:to-gray-50 rounded-2xl shadow-2xl border border-[#2d3548]/50 light:border-gray-200 p-6 mb-8 transition-all duration-300">
      <div className="flex flex-wrap items-start gap-6">
        {/* Country - Multi-select */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-gray-400 light:text-gray-600 uppercase tracking-wider">Country</label>
          <div className="relative">
            <div className="min-w-[180px] px-4 py-2.5 pr-10 text-sm border-2 border-[#2d3548] light:border-gray-300 rounded-xl bg-[#0f1419] light:bg-white transition-all duration-200 hover:border-blue-500/50 shadow-lg cursor-pointer">
              <div className="flex flex-wrap gap-1 min-h-[24px]">
                {filters.countries.length === 0 ? (
                  <span className="text-gray-500 light:text-gray-400">All Countries</span>
                ) : (
                  filters.countries.map(country => (
                    <span key={country} className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-500/20 light:bg-blue-100 text-blue-300 light:text-blue-700 rounded text-xs font-medium">
                      {country}
                      <button 
                        type="button"
                        onClick={(e) => { 
                          e.preventDefault();
                          e.stopPropagation(); 
                          handleCountryToggle(country); 
                        }} 
                        className="ml-1 hover:text-blue-100 light:hover:text-blue-900 font-bold text-base leading-none"
                      >
                        ×
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>
            {/* Dropdown arrow indicator */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            <select
              onChange={(e) => { if (e.target.value) handleCountryToggle(e.target.value as Country); e.target.value = ''; }}
              className="absolute inset-0 opacity-0 cursor-pointer"
              style={{
                color: '#fff',
                backgroundColor: '#0f1419',
              }}
            >
              <option value="" style={{ backgroundColor: '#1a1f2e', color: '#9ca3af', padding: '8px' }}>Select Country...</option>
              {COUNTRIES.map(country => (
                <option 
                  key={country} 
                  value={country}
                  style={{ 
                    backgroundColor: '#1a1f2e', 
                    color: '#e5e7eb',
                    padding: '8px',
                    borderBottom: '1px solid #2d3548'
                  }}
                >
                  {country}
                </option>
              ))}
            </select>
          </div>
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

        {/* Brand/Content - Multi-select */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-gray-400 light:text-gray-600 uppercase tracking-wider">Brand/Content</label>
          <div className="relative">
            <div className="min-w-[200px] max-w-[250px] px-4 py-2.5 pr-10 text-sm border-2 border-[#2d3548] light:border-gray-300 rounded-xl bg-[#0f1419] light:bg-white transition-all duration-200 hover:border-blue-500/50 shadow-lg cursor-pointer">
              <div className="flex flex-wrap gap-1 min-h-[24px]">
                {filters.brands.length === 0 ? (
                  <span className="text-gray-500 light:text-gray-400">All Brands/Content</span>
                ) : (
                  filters.brands.map(item => (
                    <span key={item} className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-500/20 light:bg-purple-100 text-purple-300 light:text-purple-700 rounded text-xs font-medium">
                      {getBrandLabel(item)}
                      <button 
                        type="button"
                        onClick={(e) => { 
                          e.preventDefault();
                          e.stopPropagation(); 
                          handleBrandToggle(item); 
                        }} 
                        className="ml-1 hover:text-purple-100 light:hover:text-purple-900 font-bold text-base leading-none"
                      >
                        ×
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>
            {/* Dropdown arrow indicator */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            <select
              onChange={(e) => { if (e.target.value) handleBrandToggle(e.target.value); e.target.value = ''; }}
              className="absolute inset-0 opacity-0 cursor-pointer"
              style={{
                color: '#fff',
                backgroundColor: '#0f1419',
              }}
            >
              <option value="" style={{ backgroundColor: '#1a1f2e', color: '#9ca3af', padding: '8px' }}>Select Brand/Content...</option>
              <optgroup label="Brands" style={{ backgroundColor: '#1a1f2e', color: '#a78bfa', fontWeight: 'bold', padding: '4px' }}>
                {BRANDS.map(brand => (
                  <option 
                    key={brand} 
                    value={brand}
                    style={{ 
                      backgroundColor: '#1a1f2e', 
                      color: '#e5e7eb',
                      padding: '8px 8px 8px 16px',
                      borderBottom: '1px solid #2d3548'
                    }}
                  >
                    {brand}
                  </option>
                ))}
              </optgroup>
              <optgroup label="Content Sources" style={{ backgroundColor: '#1a1f2e', color: '#60a5fa', fontWeight: 'bold', padding: '4px' }}>
                {CONTENT_SOURCES.map(source => (
                  <option 
                    key={source} 
                    value={source}
                    style={{ 
                      backgroundColor: '#1a1f2e', 
                      color: '#e5e7eb',
                      padding: '8px 8px 8px 16px',
                      borderBottom: '1px solid #2d3548'
                    }}
                  >
                    {getMediumLabel(source)}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>
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

        {/* Conversation Type - Multi-select */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-gray-400 light:text-gray-600 uppercase tracking-wider">Conversation</label>
          <div className="relative">
            <div className="min-w-[180px] px-4 py-2.5 pr-10 text-sm border-2 border-[#2d3548] light:border-gray-300 rounded-xl bg-[#0f1419] light:bg-white transition-all duration-200 hover:border-blue-500/50 shadow-lg cursor-pointer">
              <div className="flex flex-wrap gap-1 min-h-[24px]">
                {filters.conversationTypes.length === 0 ? (
                  <span className="text-gray-500 light:text-gray-400">All Types</span>
                ) : (
                  filters.conversationTypes.map(type => (
                    <span key={type} className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-500/20 light:bg-green-100 text-green-300 light:text-green-700 rounded text-xs font-medium capitalize">
                      {type}
                      <button 
                        type="button"
                        onClick={(e) => { 
                          e.preventDefault();
                          e.stopPropagation(); 
                          handleConversationToggle(type); 
                        }} 
                        className="ml-1 hover:text-green-100 light:hover:text-green-900 font-bold text-base leading-none"
                      >
                        ×
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>
            {/* Dropdown arrow indicator */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            <select
              onChange={(e) => { if (e.target.value) handleConversationToggle(e.target.value as ConversationType); e.target.value = ''; }}
              className="absolute inset-0 opacity-0 cursor-pointer"
              style={{
                color: '#fff',
                backgroundColor: '#0f1419',
              }}
            >
              <option value="" style={{ backgroundColor: '#1a1f2e', color: '#9ca3af', padding: '8px' }}>Select Conversation Type...</option>
              {CONVERSATION_TYPES.map(type => (
                <option 
                  key={type} 
                  value={type} 
                  className="capitalize"
                  style={{ 
                    backgroundColor: '#1a1f2e', 
                    color: '#e5e7eb',
                    padding: '8px',
                    borderBottom: '1px solid #2d3548',
                    textTransform: 'capitalize'
                  }}
                >
                  {type}
                </option>
              ))}
            </select>
          </div>
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
