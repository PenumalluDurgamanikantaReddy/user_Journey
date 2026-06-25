import { Medium } from '@/app/data/mockData';
import { PhaseBox, FlowBand, COLOR_MAP, PlatformCounts } from '@/app/types/sankey';

// Social media platforms that can be expanded
const SOCIAL_MEDIA_PLATFORMS: Medium[] = ['facebook', 'instagram', 'twitter'];
const ADS_PLATFORMS: Medium[] = ['google-ads', 'meta-ads'];

// ── helpers ──────────────────────────────────────────────────────────────────

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

// ── Phase 1: Content (grouped by category or individual) ─────────────────────

export function groupPlatformsByContent(
  platforms: PlatformCounts[],
  expandedCategory: string | null
): PhaseBox[] {
  const total = platforms.reduce((s, p) => s + p.total, 0);
  if (total === 0) return [];

  const normalised = expandedCategory?.toLowerCase().replace(/\s+/g, '-');

  // Expanded: show individual sub-platforms
  if (normalised === 'social-media') {
    return SOCIAL_MEDIA_PLATFORMS.flatMap(medium => {
      const p = platforms.find(pl => pl.medium === medium);
      if (!p || p.total === 0) return [];
      return [{
        id: medium,
        label: mediumLabel(medium),
        count: p.total,
        percentage: (p.total / total) * 100,
        color: COLOR_MAP[medium] || '#6b7280',
        x: 0, y: 0, width: 0, height: 0,
        isExpandable: false,
        medium,
      }];
    });
  }

  if (normalised === 'ads') {
    return ADS_PLATFORMS.flatMap(medium => {
      const p = platforms.find(pl => pl.medium === medium);
      if (!p || p.total === 0) return [];
      return [{
        id: medium,
        label: mediumLabel(medium),
        count: p.total,
        percentage: (p.total / total) * 100,
        color: COLOR_MAP[medium] || '#6b7280',
        x: 0, y: 0, width: 0, height: 0,
        isExpandable: false,
        medium,
      }];
    });
  }

  // Default: grouped view
  const boxes: PhaseBox[] = [];

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
    });
  }

  const adsTotal = platforms
    .filter(p => ADS_PLATFORMS.includes(p.medium))
    .reduce((s, p) => s + p.total, 0);
  if (adsTotal > 0) {
    boxes.push({
      id: 'Ads',
      label: 'Ads',
      count: adsTotal,
      percentage: (adsTotal / total) * 100,
      color: COLOR_MAP['google-ads'],
      x: 0, y: 0, width: 0, height: 0,
      isExpandable: true,
    });
  }

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
    });
  });

  return boxes;
}

// ── Phase 2: Conversation type ────────────────────────────────────────────────

export function groupByConversationType(
  platforms: PlatformCounts[],
  contentFilter?: string[] // IDs of content boxes to include (undefined = all)
): PhaseBox[] {
  // Which platforms to consider
  const relevant = contentFilter
    ? platforms.filter(p => {
        // Match by medium id or by group (Social Media / Ads)
        return contentFilter.some(f => {
          if (f === 'Social Media') return SOCIAL_MEDIA_PLATFORMS.includes(p.medium);
          if (f === 'Ads')          return ADS_PLATFORMS.includes(p.medium);
          return p.medium === f;
        });
      })
    : platforms;

  const comments = relevant.reduce((s, p) => s + p.comments, 0);
  const dms      = relevant.reduce((s, p) => s + p.dms, 0);
  const courses  = relevant.reduce((s, p) => s + p.courses, 0);
  const total    = comments + dms + courses;

  if (total === 0) return [];

  const result: PhaseBox[] = [];
  if (comments > 0) result.push({ id: 'Comments',        label: 'Comments',        count: comments, percentage: (comments / total) * 100, color: COLOR_MAP['comments'], x:0,y:0,width:0,height:0 });
  if (dms > 0)      result.push({ id: 'Direct Messages', label: 'Direct Messages', count: dms,      percentage: (dms      / total) * 100, color: COLOR_MAP['dm'],       x:0,y:0,width:0,height:0 });
  if (courses > 0)  result.push({ id: 'Courses',         label: 'Courses',         count: courses,  percentage: (courses  / total) * 100, color: COLOR_MAP['Courses'],  x:0,y:0,width:0,height:0 });
  return result;
}

// ── Phase 3: Goal ─────────────────────────────────────────────────────────────

/**
 * We don't have real church-attendance data yet.
 * Return a single placeholder box so the column renders with a "Coming Soon" label.
 */
export function groupByGoal(_platforms: PlatformCounts[]): PhaseBox[] {
  return [{
    id: 'Church',
    label: 'Church',
    count: 0,           // no real data
    percentage: 0,
    color: COLOR_MAP['church'],
    x: 0, y: 0,
    width: 0,
    // Give it a fixed visible height since count=0 would collapse it
    height: 80,
    isExpandable: false,
  }];
}

// ── Flows between phases ──────────────────────────────────────────────────────

export interface FlowData {
  source: string;
  target: string;
  count: number;
}

/**
 * Build content→conversation flows from raw platform counts.
 * For each source box (Social Media / Ads / individual platform) we
 * distribute its comments/dms/courses proportionally across conversation boxes.
 */
export function buildContentToConversationFlows(
  sourceBoxes: PhaseBox[],
  targetBoxes: PhaseBox[],
  platforms: PlatformCounts[]
): FlowData[] {
  const flows: FlowData[] = [];

  sourceBoxes.forEach(src => {
    // Which platforms feed this source box?
    const relevant = platforms.filter(p => {
      if (src.label === 'Social Media') return SOCIAL_MEDIA_PLATFORMS.includes(p.medium);
      if (src.label === 'Ads')          return ADS_PLATFORMS.includes(p.medium);
      return p.medium === (src.medium ?? src.id as Medium);
    });

    const comments = relevant.reduce((s, p) => s + p.comments, 0);
    const dms      = relevant.reduce((s, p) => s + p.dms, 0);
    const courses  = relevant.reduce((s, p) => s + p.courses, 0);

    const pushFlow = (target: string, count: number) => {
      if (count > 0 && targetBoxes.find(t => t.id === target)) {
        flows.push({ source: src.id, target, count });
      }
    };

    pushFlow('Comments',        comments);
    pushFlow('Direct Messages', dms);
    pushFlow('Courses',         courses);
  });

  return flows;
}

/**
 * Build conversation→goal flows.
 * All conversation types flow into "Church" (the only goal).
 */
export function buildConversationToGoalFlows(
  sourceBoxes: PhaseBox[],
  targetBoxes: PhaseBox[]
): FlowData[] {
  if (targetBoxes.length === 0) return [];
  return sourceBoxes
    .filter(s => s.count > 0)
    .map(s => ({ source: s.id, target: targetBoxes[0].id, count: s.count }));
}

// ── Route bands (geometry only — no User[]) ───────────────────────────────────

export function routeFlowBands(
  sourceBoxes: PhaseBox[],
  targetBoxes: PhaseBox[],
  flows: FlowData[]
): FlowBand[] {
  const bands: FlowBand[] = [];

  // Track how much of each box's height has been consumed
  const sourceOffsets: Record<string, number> = {};
  const targetOffsets: Record<string, number> = {};

  flows.forEach(flow => {
    const src = sourceBoxes.find(b => b.id === flow.source);
    const tgt = targetBoxes.find(b => b.id === flow.target);
    if (!src || !tgt || flow.count === 0) return;

    const srcTotal  = flows.filter(f => f.source === flow.source).reduce((s, f) => s + f.count, 0);
    const tgtTotal  = flows.filter(f => f.target === flow.target).reduce((s, f) => s + f.count, 0);

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
