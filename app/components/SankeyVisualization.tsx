'use client';

import { useState } from 'react';
import { PhaseBox, FlowBand, LABEL_MAP, AggregatedData } from '@/app/types/sankey';
import {
  groupPlatformsByContent,
  groupByConversationType,
  groupByGoal,
  buildContentToConversationFlows,
  buildConversationToGoalFlows,
  routeFlowBands,
} from '@/app/utils/dataAggregator';
import { positionPhaseBoxes } from '@/app/utils/layoutEngine';

interface Props {
  data: AggregatedData;
}

function fmt(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000)     return (n / 1_000).toFixed(1) + 'K';
  return n.toLocaleString();
}

export default function SankeyVisualization({ data }: Props) {
  const [hoveredBand, setHoveredBand]   = useState<string | null>(null);
  const [tooltipData, setTooltipData]   = useState<{ x: number; y: number; band: FlowBand } | null>(null);
  const [expandedCategory, setExpanded] = useState<string | null>(null);
  const [transitioning, setTransitioning] = useState(false);

  const { platforms, grandTotal, activeFilters } = data;

  // Are any non-content filters active?
  const hasActiveFilters = !!(activeFilters.language || activeFilters.countries || activeFilters.brand);

  if (platforms.length === 0) {
    return (
      <div className="bg-[#1a1f2e] rounded-xl shadow-lg p-12 text-center">
        <p className="text-gray-500 text-lg">No data available for the selected filters</p>
      </div>
    );
  }

  // ── Phase boxes ────────────────────────────────────────────────────────────
  const phase1Data = groupPlatformsByContent(platforms, expandedCategory, activeFilters);
  const phase2Data = groupByConversationType(platforms);
  const phase3Data = groupByGoal(platforms);

  const layout = positionPhaseBoxes(phase1Data, phase2Data, phase3Data);
  const { phase1Boxes, phase2Boxes, phase3Boxes, totalHeight, totalWidth } = layout;

  // ── Flow bands ─────────────────────────────────────────────────────────────
  const c2cFlows  = buildContentToConversationFlows(phase1Boxes, phase2Boxes, platforms);
  const c2gFlows  = buildConversationToGoalFlows(phase2Boxes, phase3Boxes);
  const bands1to2 = routeFlowBands(phase1Boxes, phase2Boxes, c2cFlows);
  const bands2to3 = routeFlowBands(phase2Boxes, phase3Boxes, c2gFlows);
  const allBands  = [...bands1to2, ...bands2to3];

  // ── Event handlers ─────────────────────────────────────────────────────────
  const handleBoxClick = (box: PhaseBox) => {
    if (!box.isExpandable || transitioning) return;
    setTransitioning(true);
    setExpanded(expandedCategory === box.label ? null : box.label);
    setTimeout(() => setTransitioning(false), 500);
  };

  const handleBandHover = (band: FlowBand, e: React.MouseEvent) => {
    setHoveredBand(band.id);
    setTooltipData({ x: e.clientX, y: e.clientY, band });
  };
  const handleBandLeave = () => { setHoveredBand(null); setTooltipData(null); };

  // ── Renderers ──────────────────────────────────────────────────────────────
  const renderBox = (box: PhaseBox) => {
    const displayLabel = LABEL_MAP[box.label] || box.label;
    const isPlaceholder = box.id === 'Church' && box.count === 0;
    const unfiltered = hasActiveFilters && box.unappliedFilters && box.unappliedFilters.length > 0;
    const unfilteredLabel = unfiltered ? `⚠ ${box.unappliedFilters!.join(', ')} not applied` : null;

    // Badge dimensions
    const badgeW = 120;
    const badgeH = 16;
    const badgeX = box.x + box.width / 2 - badgeW / 2;
    const badgeY = box.y - badgeH - 4;

    return (
      <g key={box.id} onClick={() => handleBoxClick(box)} className={box.isExpandable ? 'cursor-pointer' : ''}>
        <defs>
          <clipPath id={`clip-${box.id}`}>
            <rect x={box.x} y={box.y} width={box.width} height={box.height} rx={8} />
          </clipPath>
        </defs>

        {/* Unfiltered badge — shown above the box */}
        {unfilteredLabel && (
          <g>
            <rect x={badgeX} y={badgeY} width={badgeW} height={badgeH} rx={4}
              fill="#78350f" opacity={0.9} />
            <text x={box.x + box.width / 2} y={badgeY + badgeH - 4}
              textAnchor="middle" fill="#fbbf24" fontSize="9" fontWeight="600">
              {unfilteredLabel}
            </text>
          </g>
        )}

        <rect x={box.x} y={box.y} width={box.width} height={box.height}
          fill={isPlaceholder ? 'none' : box.color}
          stroke={isPlaceholder ? '#34d399' : unfiltered ? '#fbbf24' : 'none'}
          strokeWidth={isPlaceholder || unfiltered ? 1.5 : 0}
          strokeDasharray={isPlaceholder ? '6 4' : unfiltered ? '4 3' : 'none'}
          rx={8}
          opacity={isPlaceholder ? 0.5 : unfiltered ? 0.75 : 1}
          className="transition-all duration-300 hover:opacity-90" />

        <g clipPath={`url(#clip-${box.id})`}>
          {isPlaceholder ? (
            <>
              <text x={box.x + box.width / 2} y={box.y + box.height / 2 - 8}
                textAnchor="middle" fill="#34d399" fontSize="11" fontWeight="600">
                {displayLabel}
              </text>
              <text x={box.x + box.width / 2} y={box.y + box.height / 2 + 8}
                textAnchor="middle" fill="#6b7280" fontSize="10">
                Coming Soon
              </text>
            </>
          ) : (
            <>
              <text x={box.x + box.width / 2} y={box.y + box.height / 2 - 15}
                textAnchor="middle" fill="white" fontSize="13" fontWeight="bold">
                {fmt(box.count)}
              </text>
              <text x={box.x + box.width / 2} y={box.y + box.height / 2 + 2}
                textAnchor="middle" fill="white" fontSize="13" fontWeight="600">
                {displayLabel}
              </text>
              <text x={box.x + box.width / 2} y={box.y + box.height / 2 + 18}
                textAnchor="middle" fill="white" fontSize="12">
                {box.percentage.toFixed(1)}%
              </text>
            </>
          )}
        </g>

        {box.isExpandable && (
          <text x={box.x + box.width - 15} y={box.y + 22}
            textAnchor="middle" fill="white" fontSize="20" fontWeight="bold">
            {expandedCategory === box.label ? '−' : '+'}
          </text>
        )}
      </g>
    );
  };

  const renderBand = (band: FlowBand) => {
    const allBoxes = [...phase1Boxes, ...phase2Boxes, ...phase3Boxes];
    const src = allBoxes.find(b => b.id === band.sourceId);
    const tgt = allBoxes.find(b => b.id === band.targetId);
    if (!src || !tgt) return null;

    const srcX = src.x + src.width;
    const tgtX = tgt.x;
    const cp   = (tgtX - srcX) / 2;
    const path = `M ${srcX} ${band.sourceY} C ${srcX + cp} ${band.sourceY}, ${tgtX - cp} ${band.targetY}, ${tgtX} ${band.targetY}`;
    const isHovered = hoveredBand === band.id;
    const midX = (srcX + tgtX) / 2;
    const midY = (band.sourceY + band.targetY) / 2;

    return (
      <g key={band.id}>
        <path d={path} stroke={band.color}
          strokeWidth={Math.max(2, Math.min(30, band.sourceHeight))}
          fill="none" strokeLinecap="round" strokeDasharray="16 12"
          opacity={isHovered ? 0.85 : 0.45}
          style={{ animation: `${isHovered ? 'flow-fast' : 'flow'} 1s linear infinite` }}
          className="transition-all duration-300 cursor-pointer"
          onMouseEnter={e => handleBandHover(band, e)}
          onMouseLeave={handleBandLeave}
          onMouseMove={e => handleBandHover(band, e)}
        />
        {isHovered && (
          <text x={midX} y={midY} textAnchor="middle" fill="#f3f4f6"
            fontSize="13" fontWeight="bold" className="pointer-events-none">
            {fmt(band.count)}
          </text>
        )}
      </g>
    );
  };

  // ── Totals for bottom stats ────────────────────────────────────────────────
  const totalCourses  = platforms.reduce((s, p) => s + p.courses, 0);
  const totalComments = platforms.reduce((s, p) => s + p.comments, 0);
  const totalDMs      = platforms.reduce((s, p) => s + p.dms, 0);
  const convTotal     = totalCourses + totalComments + totalDMs;

  return (
    <div className="bg-[#1a1f2e] light:bg-white rounded-xl shadow-lg p-8 mb-8 transition-colors duration-300">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-gray-100 light:text-gray-900 text-center flex-1">
          User Journey Flow
        </h2>
        {expandedCategory && (
          <button
            onClick={() => { if (!transitioning) { setTransitioning(true); setExpanded(null); setTimeout(() => setTransitioning(false), 500); } }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <span>←</span><span>Collapse</span>
          </button>
        )}
      </div>

      {!expandedCategory && (
        <p className="text-center text-gray-400 mb-4 text-sm">
          💡 Click on boxes with <span className="font-bold">+</span> to expand
        </p>
      )}

      {/* Legend for unfiltered indicator */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 justify-center mb-4 text-xs text-amber-400">
          <span className="inline-block w-3 h-3 border border-amber-400 border-dashed rounded-sm opacity-75" />
          <span>Dashed border = this filter has no effect on this platform's data</span>
        </div>
      )}

      <div className="relative overflow-x-auto">
        {/* Extra top padding so badges above boxes don't get clipped */}
        <svg width={totalWidth} height={totalHeight + 30} className="mx-auto transition-all duration-500"
          style={{ paddingTop: 24 }}>
          {/* Column headers — shifted down to leave room for badges */}
          <text x={phase1Boxes[0]?.x + 90} y={44} textAnchor="middle" fontSize="18" fontWeight="bold" fill="#9ca3af">
            📱 Content
          </text>
          <text x={phase2Boxes[0]?.x + 90} y={44} textAnchor="middle" fontSize="18" fontWeight="bold" fill="#9ca3af">
            💬 Conversation
          </text>
          <text x={phase3Boxes[0]?.x + 90} y={44} textAnchor="middle" fontSize="18" fontWeight="bold" fill="#9ca3af">
            ⛪ Goal
          </text>

          <g transform="translate(0, 24)">
            <g opacity={transitioning ? 0.3 : 1} className="transition-opacity duration-500">
              {allBands.map(renderBand)}
            </g>
            <g className="transition-all duration-500">
              {phase1Boxes.map(renderBox)}
              {phase2Boxes.map(renderBox)}
              {phase3Boxes.map(renderBox)}
            </g>
          </g>
        </svg>
      </div>

      {/* Tooltip */}
      {tooltipData && (
        <div className="fixed z-50 px-4 py-3 bg-gray-900 text-white text-sm rounded-lg shadow-xl pointer-events-none"
          style={{ left: tooltipData.x + 10, top: tooltipData.y + 10 }}>
          <div className="font-bold">
            {LABEL_MAP[tooltipData.band.sourceLabel] || tooltipData.band.sourceLabel}
            {' → '}
            {LABEL_MAP[tooltipData.band.targetLabel] || tooltipData.band.targetLabel}
          </div>
          <div className="mt-1">{fmt(tooltipData.band.count)} ({tooltipData.band.percentage.toFixed(1)}%)</div>
        </div>
      )}

      {/* Summary stats */}
      <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-blue-500/10 rounded-lg p-6 text-center border border-blue-500/20">
          <p className="text-2xl font-bold text-blue-400">{fmt(grandTotal)}</p>
          <p className="text-gray-300 mt-1">Total Users</p>
        </div>
        <div className="bg-purple-500/10 rounded-lg p-6 text-center border border-purple-500/20">
          <p className="text-2xl font-bold text-purple-400">{fmt(convTotal)}</p>
          <p className="text-gray-300 mt-1">Conversions</p>
        </div>
        <div className="bg-green-500/10 rounded-lg p-6 text-center border border-green-500/20">
          <p className="text-2xl font-bold text-green-400">—</p>
          <p className="text-gray-300 mt-1">Church (Coming Soon)</p>
        </div>
      </div>
    </div>
  );
}
