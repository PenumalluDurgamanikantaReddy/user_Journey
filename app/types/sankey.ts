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
  // ── Content boxes (Phase 1) — light blue tone ──────────────────────────────
  facebook:            '#7eb3e8',
  instagram:           '#7eb3e8',
  twitter:             '#7eb3e8',
  'google-ads':        '#7eb3e8',
  'meta-ads':          '#7eb3e8',
  youversion:          '#7eb3e8',
  website:             '#7eb3e8',
  ai:                  '#7eb3e8',
  'daily-devotionals': '#7eb3e8',
  'Social Media':      '#7eb3e8',
  'social-media':      '#7eb3e8',
  Ads:                 '#7eb3e8',
  ads:                 '#7eb3e8',

  // ── Conversation boxes (Phase 2) — medium blue tone ───────────────────────
  Comments:          '#3b82f6',
  comments:          '#3b82f6',
  'Direct Messages': '#3b82f6',
  dm:                '#3b82f6',
  Courses:           '#3b82f6',
  courses:           '#3b82f6',

  // ── Goal box (Phase 3) — deep blue tone ───────────────────────────────────
  Church: '#1e3a8a',
  church: '#1e3a8a',
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
