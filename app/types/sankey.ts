import { User } from '@/app/data/mockData';

export interface PhaseBox {
  id: string;
  label: string;
  count: number;
  percentage: number;
  color: string;
  users: User[];
  x: number;
  y: number;
  width: number;
  height: number;
  isExpandable?: boolean;
  children?: string[];
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
  users: User[];
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

export const COLOR_MAP: Record<string, string> = {
  // Phase 1 - Content sources
  facebook: '#3b82f6',
  instagram: '#ec4899',
  ads: '#f59e0b',
  youversion: '#8b5cf6',
  website: '#10b981',
  ai: '#06b6d4',
  courses: '#ef4444',
  
  // Phase 1 - Categories
  'social-media': '#3b82f6',
  
  // Phase 2 - Conversation types
  comments: '#60a5fa',
  dm: '#a78bfa',
  chat: '#22d3ee',
  
  // Phase 3 - Goals
  conversation: '#fb923c',
  church: '#34d399',
};

export const LABEL_MAP: Record<string, string> = {
  'social-media': 'Social Media',
  'website': 'Website',
  'ads': 'Ads',
  'youversion': 'YouVersion',
  'ai': 'AI',
  'courses': 'Courses',
  'facebook': 'Facebook',
  'instagram': 'Instagram',
  'comments': 'Comments',
  'dm': 'DM',
  'chat': 'Chat',
  'conversation': 'Conversation',
  'church': 'Church',
};
