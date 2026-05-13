'use client';

import { User } from '@/app/data/mockData';
import { PhaseBox, FlowBand, LABEL_MAP } from '@/app/types/sankey';
import { groupUsersByMedium, groupUsersByConversationType, groupUsersByGoal, calculateFlowsBetweenPhases } from '@/app/utils/dataAggregator';
import { positionPhaseBoxes, routeFlowBands } from '@/app/utils/layoutEngine';
import { useState } from 'react';

interface SankeyVisualizationProps {
  users: User[];
}

export default function SankeyVisualization({ users }: SankeyVisualizationProps) {
  const [hoveredBand, setHoveredBand] = useState<string | null>(null);
  const [tooltipData, setTooltipData] = useState<{ x: number; y: number; band: FlowBand } | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  if (users.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-12 text-center">
        <p className="text-gray-500 text-lg">No data available for the selected filters</p>
      </div>
    );
  }

  // Aggregate data with expansion support
  const phase1Data = groupUsersByMedium(users, null); // Always show all categories in Phase 1
  const expandedData = expandedCategory ? groupUsersByMedium(users, expandedCategory) : [];
  const phase2Data = groupUsersByConversationType(users);
  const phase3Data = groupUsersByGoal(users);

  // Calculate flows
  let phase1to2Flows: any[] = [];
  let phase2to3Flows: any[] = [];
  
  if (expandedCategory) {
    // When expanded: Only the clicked category → Expanded items → Conversation
    const categoryBox = phase1Data.find(b => b.label === expandedCategory);
    if (categoryBox) {
      phase1to2Flows = calculateFlowsBetweenPhases(
        [categoryBox],
        expandedData,
        (user) => user.medium
      );
    }
    
    phase2to3Flows = calculateFlowsBetweenPhases(
      expandedData,
      phase2Data,
      (user) => user.conversationType
    );
  } else {
    // When collapsed: All categories → Conversation
    phase1to2Flows = calculateFlowsBetweenPhases(
      phase1Data,
      phase2Data,
      (user) => user.conversationType
    );
    
    phase2to3Flows = calculateFlowsBetweenPhases(
      phase2Data,
      phase3Data,
      (user) => user.goal
    );
  }

  // Position boxes
  let phase1Boxes, phase2Boxes, phase3Boxes, totalHeight, totalWidth;
  let phase4Boxes: PhaseBox[] = [];
  
  if (expandedCategory) {
    // 4-column layout: Categories | Expanded | Conversation | Goal
    const layout = positionPhaseBoxes(phase1Data, expandedData, phase2Data, phase3Data);
    phase1Boxes = layout.phase1Boxes;
    phase2Boxes = layout.phase2Boxes; // Expanded items
    phase3Boxes = layout.phase3Boxes; // Conversation
    phase4Boxes = layout.phase4Boxes; // Goal
    totalHeight = layout.totalHeight;
    totalWidth = layout.totalWidth;
  } else {
    // 3-column layout: Categories | Conversation | Goal
    const layout = positionPhaseBoxes(phase1Data, phase2Data, phase3Data);
    phase1Boxes = layout.phase1Boxes;
    phase2Boxes = layout.phase2Boxes; // Conversation
    phase3Boxes = layout.phase3Boxes; // Goal
    totalHeight = layout.totalHeight;
    totalWidth = layout.totalWidth;
  }

  // Route bands
  let phase1to2Bands, phase2to3Bands;
  
  if (expandedCategory) {
    phase1to2Bands = routeFlowBands(phase1Boxes, phase2Boxes, phase1to2Flows);
    phase2to3Bands = routeFlowBands(phase2Boxes, phase3Boxes, phase2to3Flows);
  } else {
    phase1to2Bands = routeFlowBands(phase1Boxes, phase2Boxes, phase1to2Flows);
    phase2to3Bands = routeFlowBands(phase2Boxes, phase3Boxes, phase2to3Flows);
  }

  const allBands = [...phase1to2Bands, ...phase2to3Bands];

  const handleBandHover = (band: FlowBand, event: React.MouseEvent) => {
    setHoveredBand(band.id);
    setTooltipData({
      x: event.clientX,
      y: event.clientY,
      band,
    });
  };

  const handleBandLeave = () => {
    setHoveredBand(null);
    setTooltipData(null);
  };

  const createBandPath = (band: FlowBand, sourceBox: PhaseBox, targetBox: PhaseBox) => {
    const sourceX = sourceBox.x + sourceBox.width;
    const sourceY = band.sourceY;
    const targetX = targetBox.x;
    const targetY = band.targetY;

    const controlPointOffset = (targetX - sourceX) / 2;

    return `M ${sourceX} ${sourceY} C ${sourceX + controlPointOffset} ${sourceY}, ${targetX - controlPointOffset} ${targetY}, ${targetX} ${targetY}`;
  };

  const handleBoxClick = (box: PhaseBox) => {
    if (box.isExpandable && !isTransitioning) {
      setIsTransitioning(true);
      setExpandedCategory(expandedCategory === box.label ? null : box.label);
      
      // Reset transition state after animation completes
      setTimeout(() => {
        setIsTransitioning(false);
      }, 500);
    }
  };

  const renderBox = (box: PhaseBox) => {
    const displayLabel = LABEL_MAP[box.label] || box.label;
    
    return (
      <g 
        key={box.id}
        onClick={() => handleBoxClick(box)}
        className={box.isExpandable ? 'cursor-pointer' : ''}
      >
        {/* Clip path to prevent text overflow */}
        <defs>
          <clipPath id={`clip-${box.id}`}>
            <rect
              x={box.x}
              y={box.y}
              width={box.width}
              height={box.height}
              rx={8}
            />
          </clipPath>
        </defs>
        
        <rect
          x={box.x}
          y={box.y}
          width={box.width}
          height={box.height}
          fill={box.color}
          rx={8}
          className="transition-all duration-300 hover:opacity-90 hover:filter hover:drop-shadow-lg"
        />
        
        <g clipPath={`url(#clip-${box.id})`}>
          {/* Count */}
          <text
            x={box.x + box.width / 2}
            y={box.y + box.height / 2 - 15}
            textAnchor="middle"
            fill="white"
            fontSize="14"
            fontWeight="bold"
          >
            {box.count}
          </text>
          
          {/* Label - no squeezing, just clip if too long */}
          <text
            x={box.x + box.width / 2}
            y={box.y + box.height / 2 + 2}
            textAnchor="middle"
            fill="white"
            fontSize="15"
            fontWeight="600"
          >
            {displayLabel}
          </text>
          
          {/* Percentage */}
          <text
            x={box.x + box.width / 2}
            y={box.y + box.height / 2 + 20}
            textAnchor="middle"
            fill="white"
            fontSize="15"
            fontWeight="bold"
          >
            {box.percentage.toFixed(1)}%
          </text>
        </g>
        
        {/* Expand/Collapse icon - outside clip path */}
        {box.isExpandable && (
          <text
            x={box.x + box.width - 15}
            y={box.y + 22}
            textAnchor="middle"
            fill="white"
            fontSize="20"
            fontWeight="bold"
          >
            {expandedCategory === box.label ? '−' : '+'}
          </text>
        )}
      </g>
    );
  };

  const renderBand = (band: FlowBand) => {
    const allBoxes = expandedCategory 
      ? [...phase1Boxes, ...phase2Boxes, ...phase3Boxes, ...phase4Boxes]
      : [...phase1Boxes, ...phase2Boxes, ...phase3Boxes];
    
    const sourceBox = allBoxes.find(b => b.id === band.sourceId);
    const targetBox = allBoxes.find(b => b.id === band.targetId);

    if (!sourceBox || !targetBox) return null;

    const path = createBandPath(band, sourceBox, targetBox);
    const isHovered = hoveredBand === band.id;

    const midX = (sourceBox.x + sourceBox.width + targetBox.x) / 2;
    const midY = (band.sourceY + band.targetY) / 2;

    return (
      <g key={band.id}>
        <path
          d={path}
          stroke={band.color}
          strokeWidth={Math.max(2, band.count * 3)}
          fill="none"
          opacity={isHovered ? 0.8 : 0.4}
          className="transition-all duration-300 cursor-pointer"
          onMouseEnter={(e) => handleBandHover(band, e)}
          onMouseLeave={handleBandLeave}
          onMouseMove={(e) => handleBandHover(band, e)}
        />
        {isHovered && (
          <text
            x={midX}
            y={midY}
            textAnchor="middle"
            fill="#1f2937"
            fontSize="14"
            fontWeight="bold"
            className="pointer-events-none"
          >
            {band.count}
          </text>
        )}
      </g>
    );
  };

  return (
    <div className="bg-linear-to-b from-gray-50 to-white rounded-xl shadow-lg p-8">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-gray-900 text-center flex-1">User Journey Flow</h2>
        {expandedCategory && (
          <button
            onClick={() => setExpandedCategory(null)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <span>←</span>
            <span>Back to Categories</span>
          </button>
        )}
      </div>

      {!expandedCategory && (
        <p className="text-center text-gray-600 mb-4 text-sm">
          💡 Click on boxes with <span className="font-bold">+</span> to expand and see details
        </p>
      )}

      <div className="relative overflow-x-auto">
        <svg width={totalWidth} height={totalHeight} className="mx-auto transition-all duration-500 ease-in-out">
          {/* Phase labels */}
          <text x={phase1Boxes[0]?.x + 80} y={20} textAnchor="middle" fontSize="20" fontWeight="bold" fill="#374151">
            📱 Content
          </text>
          {expandedCategory ? (
            <>
              <text 
                x={phase2Boxes[0]?.x + 80} 
                y={20} 
                textAnchor="middle" 
                fontSize="20" 
                fontWeight="bold" 
                fill="#374151"
                className="transition-opacity duration-500"
                opacity={isTransitioning ? 0 : 1}
              >
                {LABEL_MAP[expandedCategory] || expandedCategory}
              </text>
              <text 
                x={phase3Boxes[0]?.x + 80} 
                y={20} 
                textAnchor="middle" 
                fontSize="20" 
                fontWeight="bold" 
                fill="#374151"
                className="transition-opacity duration-500"
                opacity={isTransitioning ? 0 : 1}
              >
                💬 Conversation
              </text>
              <text 
                x={phase4Boxes[0]?.x + 80} 
                y={20} 
                textAnchor="middle" 
                fontSize="20" 
                fontWeight="bold" 
                fill="#374151"
                className="transition-opacity duration-500"
                opacity={isTransitioning ? 0 : 1}
              >
                ⛪ Goal
              </text>
            </>
          ) : (
            <>
              <text 
                x={phase2Boxes[0]?.x + 80} 
                y={20} 
                textAnchor="middle" 
                fontSize="20" 
                fontWeight="bold" 
                fill="#374151"
                className="transition-opacity duration-500"
                opacity={isTransitioning ? 0 : 1}
              >
                💬 Conversation
              </text>
              <text 
                x={phase3Boxes[0]?.x + 80} 
                y={20} 
                textAnchor="middle" 
                fontSize="20" 
                fontWeight="bold" 
                fill="#374151"
                className="transition-opacity duration-500"
                opacity={isTransitioning ? 0 : 1}
              >
                ⛪ Goal
              </text>
            </>
          )}

          {/* Render bands first (behind boxes) with transition */}
          <g className="transition-opacity duration-500" opacity={isTransitioning ? 0.3 : 1}>
            {allBands.map(renderBand)}
          </g>

          {/* Render boxes with transition */}
          <g className="transition-all duration-500">
            {phase1Boxes.map(renderBox)}
            {phase2Boxes.map(renderBox)}
            {phase3Boxes.map(renderBox)}
            {phase4Boxes.length > 0 && phase4Boxes.map(renderBox)}
          </g>
        </svg>
      </div>

      {/* Tooltip */}
      {tooltipData && (
        <div
          className="fixed z-50 px-4 py-3 bg-gray-900 text-white text-sm rounded-lg shadow-xl pointer-events-none"
          style={{
            left: tooltipData.x + 10,
            top: tooltipData.y + 10,
          }}
        >
          <div className="font-bold">
            {LABEL_MAP[tooltipData.band.sourceLabel] || tooltipData.band.sourceLabel} → {LABEL_MAP[tooltipData.band.targetLabel] || tooltipData.band.targetLabel}
          </div>
          <div className="mt-1">{tooltipData.band.count} users ({tooltipData.band.percentage.toFixed(1)}%)</div>
        </div>
      )}

      {/* Stats Summary */}
      <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-blue-50 rounded-lg p-6 text-center">
          <p className="text-2xl font-bold text-blue-600">{users.length}</p>
          <p className="text-gray-700 mt-1">Total Users</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-6 text-center">
          <p className="text-2xl font-bold text-purple-600">
            {Math.round((users.filter(u => u.status === 'active').length / users.length) * 100)}%
          </p>
          <p className="text-gray-700 mt-1">Active Users</p>
        </div>
        <div className="bg-green-50 rounded-lg p-6 text-center">
          <p className="text-2xl font-bold text-green-600">
            {Math.round((users.filter(u => u.goal === 'church').length / users.length) * 100)}%
          </p>
          <p className="text-gray-700 mt-1">Reached Goal</p>
        </div>
      </div>
    </div>
  );
}
