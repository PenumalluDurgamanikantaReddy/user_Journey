import { PhaseBox } from '@/app/types/sankey';

const BOX_WIDTH = 180;
const MIN_BOX_HEIGHT = 80;
const MIN_VERTICAL_SPACING = 15;
const PHASE_HORIZONTAL_SPACING = 250;
const CANVAS_PADDING = 40;

function calculateHeight(count: number, maxCount: number): number {
  return Math.max(MIN_BOX_HEIGHT, (count / maxCount) * 300);
}

function positionColumn(data: PhaseBox[], xPosition: number, maxCount: number): PhaseBox[] {
  const boxes: PhaseBox[] = [];
  let currentY = CANVAS_PADDING;
  data.forEach(item => {
    const height = calculateHeight(item.count, maxCount);
    boxes.push({ ...item, x: xPosition, y: currentY, width: BOX_WIDTH, height });
    currentY += height + MIN_VERTICAL_SPACING;
  });
  return boxes;
}

export function positionPhaseBoxes(
  phase1Data: PhaseBox[],
  phase2Data: PhaseBox[],
  phase3Data: PhaseBox[],
  phase4Data?: PhaseBox[]
): {
  phase1Boxes: PhaseBox[];
  phase2Boxes: PhaseBox[];
  phase3Boxes: PhaseBox[];
  phase4Boxes: PhaseBox[];
  totalHeight: number;
  totalWidth: number;
} {
  const allCounts = [
    ...phase1Data, ...phase2Data, ...phase3Data, ...(phase4Data ?? [])
  ].map(b => b.count);
  const maxCount = Math.max(...allCounts, 1);

  const phase1Boxes = positionColumn(phase1Data, CANVAS_PADDING, maxCount);
  const phase2Boxes = positionColumn(phase2Data, CANVAS_PADDING + BOX_WIDTH + PHASE_HORIZONTAL_SPACING, maxCount);
  const phase3Boxes = positionColumn(phase3Data, CANVAS_PADDING + 2 * (BOX_WIDTH + PHASE_HORIZONTAL_SPACING), maxCount);
  const phase4Boxes = phase4Data
    ? positionColumn(phase4Data, CANVAS_PADDING + 3 * (BOX_WIDTH + PHASE_HORIZONTAL_SPACING), maxCount)
    : [];

  const maxY = Math.max(
    ...phase1Boxes.map(b => b.y + b.height),
    ...phase2Boxes.map(b => b.y + b.height),
    ...phase3Boxes.map(b => b.y + b.height),
    ...(phase4Boxes.length > 0 ? phase4Boxes.map(b => b.y + b.height) : [0]),
    0
  );

  const numColumns = phase4Data ? 4 : 3;

  return {
    phase1Boxes,
    phase2Boxes,
    phase3Boxes,
    phase4Boxes,
    totalHeight: maxY + CANVAS_PADDING,
    totalWidth:
      CANVAS_PADDING +
      numColumns * BOX_WIDTH +
      (numColumns - 1) * PHASE_HORIZONTAL_SPACING +
      CANVAS_PADDING,
  };
}
