'use client';

import { useState, useRef, useEffect } from 'react';
import {
  FilterState, COUNTRIES, LANGUAGES, BRANDS, PHASES,
  CONVERSATION_TYPES, GOALS, Country, Phase, ConversationType,
  Medium, getMediumLabel, Goal,
} from '@/app/data/mockData';

interface FiltersProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
}

const CONTENT_SOURCES: Medium[] = [
  'facebook', 'instagram', 'twitter', 'google-ads', 'meta-ads',
  'youversion', 'website', 'ai', 'daily-devotionals',
];

// ── Compact dropdown ──────────────────────────────────────────────────────────
interface DropdownProps<T> {
  title: string;
  options: T[];
  selected: T[];
  onToggle: (o: T) => void;
  getLabel?: (o: T) => string;
  accentClass?: string;
  badge?: React.ReactNode;
}

function Dropdown<T>({ title, options, selected, onToggle, getLabel, accentClass = 'checked:bg-blue-500 checked:border-blue-500', badge }: DropdownProps<T>) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      {badge && <div className="absolute -top-2 -right-2 z-10">{badge}</div>}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-[#1a1f2e] border border-gray-700 hover:border-gray-500 rounded-lg text-gray-300 hover:text-white transition-all text-xs"
      >
        <span className="font-semibold uppercase tracking-wider truncate">{title}</span>
        <div className="flex items-center gap-1 shrink-0">
          {selected.length > 0 && (
            <span className="bg-blue-500/20 text-blue-400 text-[10px] font-bold px-1.5 py-0.5 rounded">
              {selected.length}
            </span>
          )}
          <svg className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {open && (
        <div className="absolute z-30 left-0 right-0 mt-1 bg-[#12171e] border border-gray-700 rounded-lg shadow-2xl p-2 max-h-48 overflow-y-auto custom-scrollbar">
          {options.map(opt => (
            <label key={String(opt)} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-gray-800 cursor-pointer">
              <div className="relative shrink-0">
                <input
                  type="checkbox"
                  className={`peer appearance-none w-4 h-4 border-2 border-gray-600 rounded bg-transparent ${accentClass} transition-all cursor-pointer`}
                  checked={selected.includes(opt)}
                  onChange={() => onToggle(opt)}
                />
                <svg className="absolute inset-0 w-4 h-4 pointer-events-none opacity-0 peer-checked:opacity-100 text-white p-0.5" viewBox="0 0 14 10" fill="none">
                  <path d="M1 5L4.5 8.5L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="text-xs text-gray-300 capitalize leading-none">
                {getLabel ? getLabel(opt) : String(opt)}
              </span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Section label ─────────────────────────────────────────────────────────────
function SectionLabel({ color, children }: { color: string; children: string }) {
  return (
    <div className={`flex items-center gap-2 mb-2`}>
      <div className={`w-0.5 h-4 ${color} rounded-full`} />
      <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{children}</span>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function Filters({ filters, onFilterChange }: FiltersProps) {
  const [localStart, setLocalStart] = useState(filters.dateRange?.start?.slice(0, 7) || '2020-01');
  const [localEnd,   setLocalEnd]   = useState(filters.dateRange?.end?.slice(0, 7)   || '2099-12');

  const toggle = <T,>(arr: T[], item: T): T[] =>
    arr.includes(item) ? arr.filter(i => i !== item) : [...arr, item];

  const patch = (partial: Partial<FilterState>) => onFilterChange({ ...filters, ...partial });

  const handleApplyDate = () => {
    patch({ dateRange: { start: localStart, end: localEnd } });
  };

  const handleReset = () => {
    setLocalStart('2020-01');
    setLocalEnd('2099-12');
    onFilterChange({
      countries: [], languages: [], brands: [], contentSources: [],
      phases: [], conversationTypes: [], goals: [],
      dateRange: { start: '2020-01', end: '2099-12' },
    });
  };

  return (
    <div className="space-y-5">
      {/* Date Range */}
      <div>
        <SectionLabel color="bg-blue-500">Date Range</SectionLabel>
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <label className="block text-[10px] text-gray-500 uppercase mb-1">From</label>
            <input
              type="month"
              value={localStart}
              onChange={e => setLocalStart(e.target.value || '2020-01')}
              className="w-full bg-[#12171e] border border-gray-700 text-gray-300 text-xs rounded-lg px-2.5 py-2 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <div className="flex-1">
            <label className="block text-[10px] text-gray-500 uppercase mb-1">To</label>
            <input
              type="month"
              value={localEnd}
              onChange={e => setLocalEnd(e.target.value || '2099-12')}
              className="w-full bg-[#12171e] border border-gray-700 text-gray-300 text-xs rounded-lg px-2.5 py-2 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <button
            onClick={handleApplyDate}
            className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition-all shrink-0"
          >
            Apply
          </button>
        </div>
      </div>

      {/* Platform Filters */}
      <div>
        <SectionLabel color="bg-blue-400">Platform</SectionLabel>
        <div className="grid grid-cols-3 gap-2">
          <Dropdown title="Content"       options={CONTENT_SOURCES}   selected={filters.contentSources}   onToggle={c => patch({ contentSources: toggle(filters.contentSources, c) })}   getLabel={getMediumLabel} />
          <Dropdown title="Conversation"  options={CONVERSATION_TYPES} selected={filters.conversationTypes} onToggle={t => patch({ conversationTypes: toggle(filters.conversationTypes, t) })} accentClass="checked:bg-green-500 checked:border-green-500" />
          <Dropdown title="Goal"          options={GOALS}              selected={filters.goals}             onToggle={g => patch({ goals: toggle(filters.goals, g) })}                     accentClass="checked:bg-purple-500 checked:border-purple-500" />
        </div>
      </div>

      {/* Brand Filters */}
      <div>
        <SectionLabel color="bg-purple-400">Brand</SectionLabel>
        <div className="grid grid-cols-2 gap-2">
          <Dropdown
            title="Country"
            options={COUNTRIES}
            selected={filters.countries}
            onToggle={c => patch({ countries: toggle(filters.countries, c) })}
            badge={
              <span className="bg-amber-500 text-gray-900 text-[9px] font-bold px-1 py-0.5 rounded leading-none">
                Ads only
              </span>
            }
          />
          <Dropdown title="Language" options={LANGUAGES} selected={filters.languages} onToggle={l => patch({ languages: toggle(filters.languages, l) })} />
          <Dropdown title="Phase"    options={PHASES}    selected={filters.phases}    onToggle={p => patch({ phases: toggle(filters.phases, p) })} />
          <Dropdown title="Brand"    options={BRANDS}    selected={filters.brands}    onToggle={b => patch({ brands: toggle(filters.brands, b) })} />
        </div>
      </div>

      {/* Reset */}
      <button
        onClick={handleReset}
        className="w-full py-2 text-xs font-semibold text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg transition-all"
      >
        Reset All Filters
      </button>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.03); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.25); }
      ` }} />
    </div>
  );
}
