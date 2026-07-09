import { Medium } from '@/app/data/mockData';
import { PhaseBox, FlowBand, COLOR_MAP, PlatformCounts } from '@/app/types/sankey';

// Social media organic platforms — grouped into one expandable box
const SOCIAL_MEDIA_PLATFORMS: Medium[] = ['facebook', 'instagram', 'twitter'];

// ── helpers ───────────────────────────────────────────────────────────────────

function mediumLabel(medium: Medium): string {
  const labels: Record<Medium, string> = {
    facebook: 'Facebook',
    instagram: 'Instagram',
    twitter: 'Twitter',
    'google-ads': 'Google Ads',
    'meta-ads': 'Meta Ads',
    youversion: 'YouVersion',
    website: 'Website',
    ai: 'AI Chat',
    'daily-devotionals': 'Daily Devotionals',
  };
  return labels[medium];
}

// ── Phase 1: Content ──────────────────────────────────────────────────────────

export function groupPlatformsByContent(
  platforms: PlatformCounts[],
  expandedCategory: string | null,
  activeFilters?: { language?: string; countries?: string; brand?: string }
): PhaseBox[] {
  const total = platforms.reduce((s, p) => s + p.total, 0);
  if (total === 0) return [];

  // Helper: determine which active filters were NOT applied to a set of platforms
  const getUnapplied = (mediums: Medium[]): string[] => {
    const unapplied: string[] = [];
    if (!activeFilters) return unapplied;
    const allApplied = mediums.flatMap(m => {
      const p = platforms.find(pl => pl.medium === m);
      return p?.appliedFilters ?? [];
    });
    if (activeFilters.language && !allApplied.includes('language'))   unapplied.push('Language');
    if (activeFilters.countries && !allApplied.includes('country'))   unapplied.push('Country');
    if (activeFilters.brand    && !allApplied.includes('brand'))      unapplied.push('Brand');
    return [...new Set(unapplied)];
  };

  const normalised = expandedCategory?.toLowerCase().replace(/\s+/g, '-');

  // Expanded Social Media: show Facebook / Instagram / Twitter individually,
  // while keeping the other content boxes visible.
  if (normalised === 'social-media') {
    const boxes: PhaseBox[] = [];

    // Create child boxes (Facebook/Instagram/Twitter) as overlay children
    SOCIAL_MEDIA_PLATFORMS.forEach((medium, idx) => {
      const p = platforms.find(pl => pl.medium === medium);
      if (!p || p.total === 0) return;
      boxes.push({
        id: medium,
        label: mediumLabel(medium),
        count: p.total,
        percentage: (p.total / total) * 100,
        color: COLOR_MAP[medium] || '#6b7280',
        x: 0, y: 0, width: 0, height: 0,
        isExpandable: false,
        medium,
        appliedFilters: p.appliedFilters,
        unappliedFilters: getUnapplied([medium]),
        overlayGroup: 'Social Media',
        overlayIndex: idx,
      } as PhaseBox);
    });

    // Parent Social Media box (kept on top)
    const socialPlatforms = SOCIAL_MEDIA_PLATFORMS.filter(m => platforms.find(p => p.medium === m && p.total > 0));
    const socialTotal = platforms
      .filter(p => SOCIAL_MEDIA_PLATFORMS.includes(p.medium))
      .reduce((s, p) => s + p.total, 0);
    if (socialTotal > 0) {
      boxes.push({
        id: 'Social Media',
        label: 'Social Media',
        count: socialTotal,
        percentage: (socialTotal / total) * 100,
        color: COLOR_MAP['facebook'],
        x: 0, y: 0, width: 0, height: 0,
        isExpandable: true,
        unappliedFilters: getUnapplied(socialPlatforms),
      });
    }

    // Add remaining individual boxes so they remain visible
    const addIndividualBox = (medium: Medium) => {
      const p = platforms.find(pl => pl.medium === medium);
      if (!p || p.total === 0) return;
      boxes.push({
        id: medium,
        label: mediumLabel(medium),
        count: p.total,
        percentage: (p.total / total) * 100,
        color: COLOR_MAP[medium] || '#6b7280',
        x: 0, y: 0, width: 0, height: 0,
        isExpandable: false,
        medium,
        appliedFilters: p.appliedFilters,
        unappliedFilters: getUnapplied([medium]),
      } as PhaseBox);
    };

    addIndividualBox('google-ads');
    addIndividualBox('meta-ads');
    ['youversion', 'website', 'ai', 'daily-devotionals'].forEach(addIndividualBox);

    return boxes;
  }

  const boxes: PhaseBox[] = [];

  // 1. Social Media grouped (Facebook + Instagram + Twitter)
  const socialPlatforms = SOCIAL_MEDIA_PLATFORMS.filter(m => platforms.find(p => p.medium === m && p.total > 0));
  const socialTotal = platforms
    .filter(p => SOCIAL_MEDIA_PLATFORMS.includes(p.medium))
    .reduce((s, p) => s + p.total, 0);
  if (socialTotal > 0) {
    boxes.push({
      id: 'Social Media',
      label: 'Social Media',
      count: socialTotal,
      percentage: (socialTotal / total) * 100,
      color: COLOR_MAP['facebook'],
      x: 0, y: 0, width: 0, height: 0,
      isExpandable: true,
      unappliedFilters: getUnapplied(socialPlatforms),
    });
  }

  // 2. Google Ads — individual box
  const googleAds = platforms.find(p => p.medium === 'google-ads');
  if (googleAds && googleAds.total > 0) {
    boxes.push({
      id: 'google-ads',
      label: 'Google Ads',
      count: googleAds.total,
      percentage: (googleAds.total / total) * 100,
      color: COLOR_MAP['google-ads'],
      x: 0, y: 0, width: 0, height: 0,
      isExpandable: false,
      medium: 'google-ads',
      appliedFilters: googleAds.appliedFilters,
      unappliedFilters: getUnapplied(['google-ads']),
    });
  }

  // 3. Meta Ads — individual box
  const metaAds = platforms.find(p => p.medium === 'meta-ads');
  if (metaAds && metaAds.total > 0) {
    boxes.push({
      id: 'meta-ads',
      label: 'Meta Ads',
      count: metaAds.total,
      percentage: (metaAds.total / total) * 100,
      color: COLOR_MAP['meta-ads'],
      x: 0, y: 0, width: 0, height: 0,
      isExpandable: false,
      medium: 'meta-ads',
      appliedFilters: metaAds.appliedFilters,
      unappliedFilters: getUnapplied(['meta-ads']),
    });
  }

  // 4. Other individual platforms
  const individual: Medium[] = ['youversion', 'website', 'ai', 'daily-devotionals'];
  individual.forEach(medium => {
    const p = platforms.find(pl => pl.medium === medium);
    if (!p || p.total === 0) return;
    boxes.push({
      id: medium,
      label: mediumLabel(medium),
      count: p.total,
      percentage: (p.total / total) * 100,
      color: COLOR_MAP[medium] || '#6b7280',
      x: 0, y: 0, width: 0, height: 0,
      isExpandable: false,
      medium,
      appliedFilters: p.appliedFilters,
      unappliedFilters: getUnapplied([medium]),
    });
  });

  return boxes;
}

// ── Phase 2: Conversation type ────────────────────────────────────────────────

export function groupByConversationType(platforms: PlatformCounts[]): PhaseBox[] {
  const comments = platforms.reduce((s, p) => s + p.comments, 0);
  const dms      = platforms.reduce((s, p) => s + p.dms, 0);
  const courses  = platforms.reduce((s, p) => s + p.courses, 0);
  const total    = comments + dms + courses;
  if (total === 0) return [];

  const result: PhaseBox[] = [];
  if (comments > 0) result.push({ id: 'Comments',        label: 'Comments',        count: comments, percentage: (comments / total) * 100, color: COLOR_MAP['comments'], x:0,y:0,width:0,height:0 });
  if (dms > 0)      result.push({ id: 'Direct Messages', label: 'Direct Messages', count: dms,      percentage: (dms / total) * 100,      color: COLOR_MAP['dm'],       x:0,y:0,width:0,height:0 });
  if (courses > 0)  result.push({ id: 'Courses',         label: 'Courses',         count: courses,  percentage: (courses / total) * 100,  color: COLOR_MAP['Courses'],  x:0,y:0,width:0,height:0 });
  return result;
}

// ── Phase 3: Goal (placeholder until real church data exists) ─────────────────

export function groupByGoal(_platforms: PlatformCounts[]): PhaseBox[] {
  return [{
    id: 'Church',
    label: 'Church',
    count: 0,
    percentage: 0,
    color: COLOR_MAP['church'],
    x: 0, y: 0, width: 0, height: 80,
    isExpandable: false,
  }];
}

// ── Flow data ─────────────────────────────────────────────────────────────────

export interface FlowData {
  source: string;
  target: string;
  count: number;
}

export function buildContentToConversationFlows(
  sourceBoxes: PhaseBox[],
  targetBoxes: PhaseBox[],
  platforms: PlatformCounts[]
): FlowData[] {
  const flows: FlowData[] = [];

  sourceBoxes.forEach(src => {
    // Which platforms feed this source box?
    const relevant = platforms.filter(p => {
      if (src.id === 'Social Media') return SOCIAL_MEDIA_PLATFORMS.includes(p.medium);
      return p.medium === (src.medium ?? (src.id as Medium));
    });

    const comments = relevant.reduce((s, p) => s + p.comments, 0);
    const dms      = relevant.reduce((s, p) => s + p.dms, 0);
    const courses  = relevant.reduce((s, p) => s + p.courses, 0);

    const push = (target: string, count: number) => {
      if (count > 0 && targetBoxes.find(t => t.id === target)) {
        flows.push({ source: src.id, target, count });
      }
    };

    push('Comments',        comments);
    push('Direct Messages', dms);
    push('Courses',         courses);
  });

  return flows;
}

export function buildConversationToGoalFlows(
  sourceBoxes: PhaseBox[],
  targetBoxes: PhaseBox[]
): FlowData[] {
  if (targetBoxes.length === 0) return [];
  return sourceBoxes
    .filter(s => s.count > 0)
    .map(s => ({ source: s.id, target: targetBoxes[0].id, count: s.count }));
}

// ── Band geometry ─────────────────────────────────────────────────────────────

export function routeFlowBands(
  sourceBoxes: PhaseBox[],
  targetBoxes: PhaseBox[],
  flows: FlowData[]
): FlowBand[] {
  const bands: FlowBand[] = [];
  const sourceOffsets: Record<string, number> = {};
  const targetOffsets: Record<string, number> = {};

  flows.forEach(flow => {
    const src = sourceBoxes.find(b => b.id === flow.source);
    const tgt = targetBoxes.find(b => b.id === flow.target);
    if (!src || !tgt || flow.count === 0) return;

    const srcTotal = flows.filter(f => f.source === flow.source).reduce((s, f) => s + f.count, 0);
    const tgtTotal = flows.filter(f => f.target === flow.target).reduce((s, f) => s + f.count, 0);

    const srcHeight = srcTotal > 0 ? (flow.count / srcTotal) * src.height : 0;
    const tgtHeight = tgtTotal > 0 ? (flow.count / tgtTotal) * tgt.height : 0;

    const srcOff = sourceOffsets[src.id] ?? 0;
    const tgtOff = targetOffsets[tgt.id] ?? 0;

    bands.push({
      id: `${flow.source}->${flow.target}`,
      sourceId: src.id,
      targetId: tgt.id,
      sourceLabel: src.label,
      targetLabel: tgt.label,
      count: flow.count,
      percentage: src.count > 0 ? (flow.count / src.count) * 100 : 0,
      color: src.color,
      sourceY: src.y + srcOff + srcHeight / 2,
      targetY: tgt.y + tgtOff + tgtHeight / 2,
      sourceHeight: srcHeight,
      targetHeight: tgtHeight,
    });

    sourceOffsets[src.id] = srcOff + srcHeight;
    targetOffsets[tgt.id] = tgtOff + tgtHeight;
  });

  return bands;
}
