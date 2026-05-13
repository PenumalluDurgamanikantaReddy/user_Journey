import { PhaseBox, FlowBand } from '@/app/types/sankey';
import { User } from '@/app/data/mockData';

interface BoxData {
  label: string;
  count: number;
  percentage: number;
  color: string;
  users: User[];
  isExpandable?: boolean;
  children?: string[];
}

interface FlowData {
  source: string;
  target: string;
  count: number;
  users: User[];
}

const BOX_WIDTH = 180;
const MIN_BOX_HEIGHT = 80;
const MIN_VERTICAL_SPACING = 15;
const PHASE_HORIZONTAL_SPACING = 250;
const CANVAS_PADDING = 40;

export function positionPhaseBoxes(
  phase1Data: BoxData[],
  phase2Data: BoxData[],
  phase3Data: BoxData[],
  phase4Data?: BoxData[]
): {
  phase1Boxes: PhaseBox[];
  phase2Boxes: PhaseBox[];
  phase3Boxes: PhaseBox[];
  phase4Boxes: PhaseBox[];
  totalHeight: number;
  totalWidth: number;
} {
  const maxCount = Math.max(
    ...phase1Data.map(b => b.count),
    ...phase2Data.map(b => b.count),
    ...phase3Data.map(b => b.count),
    ...(phase4Data || []).map(b => b.count)
  );

  const calculateHeight = (count: number) => {
    return Math.max(MIN_BOX_HEIGHT, (count / maxCount) * 300);
  };

  const positionColumn = (data: BoxData[], xPosition: number): PhaseBox[] => {
    const boxes: PhaseBox[] = [];
    let currentY = CANVAS_PADDING;

    data.forEach((item, index) => {
      const height = calculateHeight(item.count);
      boxes.push({
        id: `${xPosition}-${item.label}`,
        label: item.label,
        count: item.count,
        percentage: item.percentage,
        color: item.color,
        users: item.users,
        x: xPosition,
        y: currentY,
        width: BOX_WIDTH,
        height,
        isExpandable: item.isExpandable,
        children: item.children,
      });
      currentY += height + MIN_VERTICAL_SPACING;
    });

    return boxes;
  };

  const phase1Boxes = positionColumn(phase1Data, CANVAS_PADDING);
  const phase2Boxes = positionColumn(phase2Data, CANVAS_PADDING + BOX_WIDTH + PHASE_HORIZONTAL_SPACING);
  const phase3Boxes = positionColumn(phase3Data, CANVAS_PADDING + 2 * (BOX_WIDTH + PHASE_HORIZONTAL_SPACING));
  const phase4Boxes = phase4Data 
    ? positionColumn(phase4Data, CANVAS_PADDING + 3 * (BOX_WIDTH + PHASE_HORIZONTAL_SPACING))
    : [];

  const maxY = Math.max(
    ...phase1Boxes.map(b => b.y + b.height),
    ...phase2Boxes.map(b => b.y + b.height),
    ...phase3Boxes.map(b => b.y + b.height),
    ...(phase4Boxes.length > 0 ? phase4Boxes.map(b => b.y + b.height) : [0])
  );

  const numColumns = phase4Data ? 4 : 3;

  return {
    phase1Boxes,
    phase2Boxes,
    phase3Boxes,
    phase4Boxes,
    totalHeight: maxY + CANVAS_PADDING,
    totalWidth: CANVAS_PADDING + numColumns * BOX_WIDTH + (numColumns - 1) * PHASE_HORIZONTAL_SPACING + CANVAS_PADDING,
  };
}

export function routeFlowBands(
  sourceBoxes: PhaseBox[],
  targetBoxes: PhaseBox[],
  flowsData: FlowData[]
): FlowBand[] {
  const bands: FlowBand[] = [];

  flowsData.forEach(flow => {
    const sourceBox = sourceBoxes.find(b => b.label === flow.source);
    const targetBox = targetBoxes.find(b => b.label === flow.target);

    if (!sourceBox || !targetBox) return;

    const totalSourceFlow = flowsData
      .filter(f => f.source === flow.source)
      .reduce((sum, f) => sum + f.count, 0);

    const flowHeight = (flow.count / totalSourceFlow) * sourceBox.height;

    bands.push({
      id: `${flow.source}-${flow.target}`,
      sourceId: sourceBox.id,
      targetId: targetBox.id,
      sourceLabel: flow.source,
      targetLabel: flow.target,
      count: flow.count,
      percentage: (flow.count / sourceBox.count) * 100,
      color: sourceBox.color,
      users: flow.users,
      sourceY: sourceBox.y + sourceBox.height / 2,
      targetY: targetBox.y + targetBox.height / 2,
      sourceHeight: flowHeight,
      targetHeight: flowHeight,
    });
  });

  return bands;
}
