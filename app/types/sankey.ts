import { Medium, ConversationType } from '@/app/data/mockData';

export interface PhaseBox {
  id: string;
  label: string;
  count: number;
  percentage: number;
  color: string;
  // No more User[] — counts only
  x: number;
  y: number;
  width: number;
  height: number;
  isExpandable?: boolean;
  /** when true this box is rendered as part of an overlay group (e.g. Facebook/Instagram behind Social Media) */
  overlayGroup?: string;
  /** order index within an overlay group */
  overlayIndex?: number;
  children?: string[];
  medium?: Medium;
  /** filters that were applied to this box's data query */
  appliedFilters?: string[];
  /** filters that are active but were NOT applied to this box */
  unappliedFilters?: string[];
}

export interface FlowBand {
  id: string;
  sourceId: string;
  targetId: string;
  sourceLabel: string;
  targetLabel: string;
  count: number;
  percentage: number;
  color: string;
  // No more User[] — counts only
  sourceY: number;
  targetY: number;
  sourceHeight: number;
  targetHeight: number;
}

export interface LayoutData {
  phase1Boxes: PhaseBox[];
  phase2Boxes: PhaseBox[];
  phase3Boxes: PhaseBox[];
  phase1to2Bands: FlowBand[];
  phase2to3Bands: FlowBand[];
  totalHeight: number;
  totalWidth: number;
}

// ── Aggregated data shape returned by useAnalyticsData ───────────────────────

export interface PlatformCounts {
  medium: Medium;
  /** raw total (e.g. 86 405 243 for facebook) */
  total: number;
  comments: number;
  dms: number;
  courses: number;
  /** which filters were actually applied to this platform's query */
  appliedFilters: string[];
}

export interface AggregatedData {
  platforms: PlatformCounts[];
  /** sum of all platform totals */
  grandTotal: number;
  /** which filters are currently active in the UI */
  activeFilters: {
    language?: string;
    countries?: string;
    brand?: string;
  };
  /** conversation type filters applied (e.g. ['dm'], ['comments','courses']) */
  conversationTypes?: string[];
}

export const COLOR_MAP: Record<string, string> = {
  // Phase 1 - Content sources (individual platforms)
  facebook: '#3b82f6',
  instagram: '#ec4899',
  twitter: '#1da1f2',
  'google-ads': '#f34aff',
  'meta-ads': '#0668e1',
  youversion: '#8b5cf6',
  website: '#10b981',
  ai: '#06b6d4',
  'daily-devotionals': '#ef4444',

  // Phase 1 - Categories (grouped)
  'social-media': '#3b82f6',
  'Social Media': '#3b82f6',
  ads: '#f59e0b',
  Ads: '#f59e0b',

  // Phase 2 - Conversation types
  comments: '#60a5fa',
  dm: '#a78bfa',
  'Direct Messages': '#a78bfa',
  Comments: '#60a5fa',
  Courses: '#ef4444',

  // Phase 3 - Goals
  church: '#34d399',
  Church: '#34d399',
};

export const LABEL_MAP: Record<string, string> = {
  'social-media': 'Social Media',
  website: 'Website',
  ads: 'Ads',
  youversion: 'YouVersion',
  ai: 'AI',
  'daily-devotionals': 'Daily Devotionals',
  facebook: 'Facebook',
  instagram: 'Instagram',
  twitter: 'Twitter',
  'google-ads': 'Google Ads',
  'meta-ads': 'Meta Ads',
  comments: 'Comments',
  dm: 'Direct Messages',
  church: 'Church',
};
