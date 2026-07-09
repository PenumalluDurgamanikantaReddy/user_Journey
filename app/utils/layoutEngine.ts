import { PhaseBox, FlowBand, COLOR_MAP } from '@/app/types/sankey';

const BOX_WIDTH = 180;
const CHILD_BOX_WIDTH = 140;
const MIN_BOX_HEIGHT = 80;
const MIN_VERTICAL_SPACING = 15;
const PHASE_HORIZONTAL_SPACING = 250;
const CANVAS_PADDING = 40;

function calculateHeight(count: number, maxCount: number): number {
  return Math.max(MIN_BOX_HEIGHT, (count / maxCount) * 300);
}

export interface LayoutResult {
  phase1Boxes: PhaseBox[];
  phase2Boxes: PhaseBox[];
  phase3Boxes: PhaseBox[];
  phase4Boxes: PhaseBox[];
  /** Flow bands from overlay children to their parent box */
  childToParentBands: FlowBand[];
  totalHeight: number;
  totalWidth: number;
}

function positionColumn(
  data: PhaseBox[],
  xPosition: number,
  maxCount: number,
  childColumnX?: number
): { boxes: PhaseBox[]; childToParentFlows: { childId: string; parentId: string; childY: number; childHeight: number; parentY: number; parentHeight: number; count: number; color: string }[] } {
  const boxes: PhaseBox[] = [];
  const childToParentFlows: { childId: string; parentId: string; childY: number; childHeight: number; parentY: number; parentHeight: number; count: number; color: string }[] = [];
  let currentY = CANVAS_PADDING;

  const groups: Record<string, { parent?: PhaseBox; children: PhaseBox[] }> = {};
  data.forEach(item => {
    if (item.overlayGroup) {
      groups[item.overlayGroup] = groups[item.overlayGroup] || { children: [] };
      groups[item.overlayGroup].children.push(item);
    }
    if (groups[item.id]) {
      groups[item.id].parent = item;
    }
  });

  const processedGroups = new Set<string>();

  data.forEach(item => {
    if (item.overlayGroup) {
      if (processedGroups.has(item.overlayGroup)) return;
      const group = groups[item.overlayGroup];
      if (group?.parent) return;
    }

    const group = groups[item.id];
    if (group?.parent === item && !processedGroups.has(item.id)) {
      const children = group.children.slice().sort((a, b) => (a.overlayIndex ?? 0) - (b.overlayIndex ?? 0));
      const parentHeight = calculateHeight(item.count, maxCount);

      const childGap = 10;
      const childHeights = children.map(child => calculateHeight(child.count, maxCount));
      const totalChildHeight = childHeights.reduce((sum, h) => sum + h, 0) + childGap * Math.max(0, children.length - 1);
      const reservedHeight = Math.max(parentHeight, totalChildHeight + 16);
      const parentY = currentY + (reservedHeight - parentHeight) / 2;
      const startY = currentY + (reservedHeight - totalChildHeight) / 2;

      let childY = startY;
      children.forEach((child, idx) => {
        const childHeight = childHeights[idx];
        const childCenterY = childY + childHeight / 2;
        const childBox = {
          ...child,
          x: childColumnX ?? CANVAS_PADDING,
          y: childY,
          width: CHILD_BOX_WIDTH,
          height: childHeight,
        };
        boxes.push(childBox);

        // Connect from child's right-center to a proportional position on parent's left edge
        const proportion = totalChildHeight > 0
          ? (childCenterY - startY) / totalChildHeight
          : (idx + 0.5) / children.length;

        childToParentFlows.push({
          childId: child.id,
          parentId: item.id,
          childY: childCenterY,
          childHeight,
          parentY: parentY + proportion * parentHeight,
          parentHeight,
          count: child.count,
          color: child.color || COLOR_MAP[child.id] || '#6b7280',
        });

        childY += childHeight + childGap;
      });

      boxes.push({
        ...item,
        x: xPosition,
        y: parentY,
        width: BOX_WIDTH,
        height: parentHeight,
      });
      currentY += reservedHeight + MIN_VERTICAL_SPACING;
      processedGroups.add(item.id);
      return;
    }

    if (item.overlayGroup) {
      if (group?.parent) return;
    }

    const height = calculateHeight(item.count, maxCount);
    boxes.push({ ...item, x: xPosition, y: currentY, width: BOX_WIDTH, height });
    currentY += height + MIN_VERTICAL_SPACING;
  });

  return { boxes, childToParentFlows };
}

export function positionPhaseBoxes(
  phase1Data: PhaseBox[],
  phase2Data: PhaseBox[],
  phase3Data: PhaseBox[],
  phase4Data?: PhaseBox[]
): LayoutResult {
  const allCounts = [
    ...phase1Data, ...phase2Data, ...phase3Data, ...(phase4Data ?? [])
  ].map(b => b.count);
  const maxCount = Math.max(...allCounts, 1);

  const hasChildColumn = phase1Data.some(b => b.overlayGroup);

  // Compute column X positions
  let phase1X: number;
  let childX: number;

  if (hasChildColumn) {
    // Children on the left, Phase 1 (content) shifted right to make room
    childX = CANVAS_PADDING;
    phase1X = CANVAS_PADDING + CHILD_BOX_WIDTH + 80;
  } else {
    childX = CANVAS_PADDING;
    phase1X = CANVAS_PADDING;
  }

  const positioned = positionColumn(phase1Data, phase1X, maxCount, childX);
  const phase1Boxes = positioned.boxes;
  const childFlows = positioned.childToParentFlows;

  // Build FlowBand entries for child → parent connections
  const childToParentBands: FlowBand[] = childFlows.map(f => ({
    id: `${f.childId}->${f.parentId}`,
    sourceId: f.childId,
    targetId: f.parentId,
    sourceLabel: f.childId,
    targetLabel: f.parentId,
    count: f.count,
    percentage: 0,
    color: f.color,
    sourceY: f.childY,
    targetY: f.parentY,
    sourceHeight: f.childHeight,
    targetHeight: f.parentHeight,
  }));

  const phase2X = phase1X + BOX_WIDTH + PHASE_HORIZONTAL_SPACING;
  const phase3X = phase1X + 2 * (BOX_WIDTH + PHASE_HORIZONTAL_SPACING);

  const phase2Boxes = positionColumn(phase2Data, phase2X, maxCount).boxes;
  const phase3Boxes = positionColumn(phase3Data, phase3X, maxCount).boxes;
  const phase4Boxes = phase4Data
    ? positionColumn(phase4Data, phase1X + 3 * (BOX_WIDTH + PHASE_HORIZONTAL_SPACING), maxCount).boxes
    : [];

  const maxY = Math.max(
    ...phase1Boxes.map(b => b.y + b.height),
    ...phase2Boxes.map(b => b.y + b.height),
    ...phase3Boxes.map(b => b.y + b.height),
    ...(phase4Boxes.length > 0 ? phase4Boxes.map(b => b.y + b.height) : [0]),
    0
  );

  const rightEdge = phase3X + BOX_WIDTH;
  const leftEdge = hasChildColumn ? childX : phase1X;
  const totalWidth = (rightEdge - leftEdge) + CANVAS_PADDING * 2;

  return {
    phase1Boxes,
    phase2Boxes,
    phase3Boxes,
    phase4Boxes,
    childToParentBands,
    totalHeight: maxY + CANVAS_PADDING,
    totalWidth,
  };
}
