import { User, Medium, ConversationType, Goal } from '@/app/data/mockData';
import { COLOR_MAP } from '@/app/types/sankey';

interface BoxData {
  label: string;
  count: number;
  percentage: number;
  color: string;
  users: User[];
  isExpandable?: boolean;
  children?: string[];
}

// Define category groupings
const CATEGORY_GROUPS: Record<string, Medium[]> = {
  'social-media': ['facebook', 'instagram'],
  'website': ['website'],
  'ads': ['ads'],
  'youversion': ['youversion'],
  'ai': ['ai'],
  'courses': ['courses'],
};

export function groupUsersByMedium(users: User[], expandedCategory?: string | null): BoxData[] {
  // If a category is expanded, show its children
  if (expandedCategory && CATEGORY_GROUPS[expandedCategory]) {
    const mediums = CATEGORY_GROUPS[expandedCategory];
    const groups: Record<string, User[]> = {};
    
    mediums.forEach(medium => {
      const filtered = users.filter(u => u.medium === medium);
      if (filtered.length > 0) {
        groups[medium] = filtered;
      }
    });

    return Object.entries(groups).map(([label, items]) => ({
      label,
      count: items.length,
      percentage: (items.length / users.length) * 100,
      color: COLOR_MAP[label] || '#6b7280',
      users: items,
      isExpandable: false,
    }));
  }

  // Otherwise, show high-level categories
  const categoryData: BoxData[] = [];

  Object.entries(CATEGORY_GROUPS).forEach(([category, mediums]) => {
    const categoryUsers = users.filter(u => mediums.includes(u.medium));
    if (categoryUsers.length > 0) {
      categoryData.push({
        label: category,
        count: categoryUsers.length,
        percentage: (categoryUsers.length / users.length) * 100,
        color: COLOR_MAP[mediums[0]] || '#6b7280', // Use first medium's color
        users: categoryUsers,
        isExpandable: mediums.length > 1,
        children: mediums,
      });
    }
  });

  return categoryData;
}

export function groupUsersByConversationType(users: User[]): BoxData[] {
  const groups: Record<string, User[]> = {};
  
  users.forEach(user => {
    if (!user.conversationType) return;
    if (!groups[user.conversationType]) {
      groups[user.conversationType] = [];
    }
    groups[user.conversationType].push(user);
  });

  const totalWithConversation = Object.values(groups).reduce((sum, items) => sum + items.length, 0);

  return Object.entries(groups)
    .filter(([_, items]) => items.length > 0)
    .map(([label, items]) => ({
      label,
      count: items.length,
      percentage: totalWithConversation > 0 ? (items.length / totalWithConversation) * 100 : 0,
      color: COLOR_MAP[label] || '#6b7280',
      users: items,
    }));
}

export function groupUsersByGoal(users: User[]): BoxData[] {
  const groups: Record<string, User[]> = {
    conversation: users.filter(u => u.goal === 'conversation'),
    church: users.filter(u => u.goal === 'church'),
  };

  return Object.entries(groups)
    .filter(([_, items]) => items.length > 0)
    .map(([label, items]) => ({
      label,
      count: items.length,
      percentage: (items.length / users.length) * 100,
      color: COLOR_MAP[label] || '#6b7280',
      users: items,
    }));
}

interface FlowData {
  source: string;
  target: string;
  count: number;
  users: User[];
}

export function calculateFlowsBetweenPhases(
  sourceBoxes: BoxData[],
  targetBoxes: BoxData[],
  getTargetKey: (user: User) => string | undefined
): FlowData[] {
  const flows: Record<string, FlowData> = {};

  sourceBoxes.forEach(sourceBox => {
    sourceBox.users.forEach(user => {
      const targetKey = getTargetKey(user);
      if (!targetKey) return;

      const flowKey = `${sourceBox.label}->${targetKey}`;
      if (!flows[flowKey]) {
        flows[flowKey] = {
          source: sourceBox.label,
          target: targetKey,
          count: 0,
          users: [],
        };
      }
      flows[flowKey].count++;
      flows[flowKey].users.push(user);
    });
  });

  return Object.values(flows).filter(flow => flow.count > 0);
}
