import { User, Medium, ConversationType, Goal, getMediumLabel, getConversationLabel } from '@/app/data/mockData';
import { COLOR_MAP } from '@/app/types/sankey';

interface BoxData {
  label: string;
  count: number;
  percentage: number;
  color: string;
  users: User[];
  isExpandable?: boolean;
  children?: Medium[];
  mediumType?: Medium;
}

// Social media platforms that can be expanded
const SOCIAL_MEDIA_PLATFORMS: Medium[] = ['facebook', 'instagram', 'twitter'];
const ADS_PLATFORMS: Medium[] = ['google-ads', 'meta-ads'];

export function groupUsersByMedium(users: User[], expandedCategory?: string | null): BoxData[] {
  // Normalize the expanded category for comparison
  const normalizedExpanded = expandedCategory?.toLowerCase().replace(/\s+/g, '-');
  
  // If "Social Media" is expanded, show individual platforms
  if (normalizedExpanded === 'social-media') {
    return SOCIAL_MEDIA_PLATFORMS.map(medium => {
      const mediumUsers = users.filter(u => u.medium === medium);
      return {
        label: getMediumLabel(medium),
        count: mediumUsers.length,
        percentage: users.length > 0 ? (mediumUsers.length / users.length) * 100 : 0,
        color: COLOR_MAP[medium] || '#6b7280',
        users: mediumUsers,
        isExpandable: false,
        mediumType: medium,
      };
    }).filter(box => box.count > 0);
  }

  // If "Ads" is expanded, show Google Ads and Meta Ads
  if (normalizedExpanded === 'ads') {
    return ADS_PLATFORMS.map(medium => {
      const mediumUsers = users.filter(u => u.medium === medium);
      return {
        label: getMediumLabel(medium),
        count: mediumUsers.length,
        percentage: users.length > 0 ? (mediumUsers.length / users.length) * 100 : 0,
        color: COLOR_MAP[medium] || '#6b7280',
        users: mediumUsers,
        isExpandable: false,
        mediumType: medium,
      };
    }).filter(box => box.count > 0);
  }

  // Otherwise, show high-level categories
  const boxes: BoxData[] = [];

  // Social Media (grouped)
  const socialMediaUsers = users.filter(u => SOCIAL_MEDIA_PLATFORMS.includes(u.medium));
  if (socialMediaUsers.length > 0) {
    boxes.push({
      label: 'Social Media',
      count: socialMediaUsers.length,
      percentage: (socialMediaUsers.length / users.length) * 100,
      color: COLOR_MAP['facebook'] || '#3b5998',
      users: socialMediaUsers,
      isExpandable: true,
      children: SOCIAL_MEDIA_PLATFORMS,
    });
  }

  // Ads (grouped)
  const adsUsers = users.filter(u => ADS_PLATFORMS.includes(u.medium));
  if (adsUsers.length > 0) {
    boxes.push({
      label: 'Ads',
      count: adsUsers.length,
      percentage: (adsUsers.length / users.length) * 100,
      color: COLOR_MAP['google-ads'] || '#4285f4',
      users: adsUsers,
      isExpandable: true,
      children: ADS_PLATFORMS,
    });
  }

  // Individual platforms (not grouped)
  const individualMediums: Medium[] = ['youversion', 'website', 'ai', 'courses'];
  individualMediums.forEach(medium => {
    const mediumUsers = users.filter(u => u.medium === medium);
    if (mediumUsers.length > 0) {
      boxes.push({
        label: getMediumLabel(medium),
        count: mediumUsers.length,
        percentage: (mediumUsers.length / users.length) * 100,
        color: COLOR_MAP[medium] || '#6b7280',
        users: mediumUsers,
        isExpandable: false,
        mediumType: medium,
      });
    }
  });

  return boxes;
}

export function groupUsersByConversationType(users: User[]): BoxData[] {
  const groups: Record<ConversationType, User[]> = {
    comments: [],
    dm: [],
    courses: [],
  };
  
  users.forEach(user => {
    if (user.conversationType && groups[user.conversationType]) {
      groups[user.conversationType].push(user);
    }
  });

  const totalWithConversation = Object.values(groups).reduce((sum, items) => sum + items.length, 0);

  return Object.entries(groups)
    .filter(([_, items]) => items.length > 0)
    .map(([type, items]) => ({
      label: getConversationLabel(type as ConversationType),
      count: items.length,
      percentage: totalWithConversation > 0 ? (items.length / totalWithConversation) * 100 : 0,
      color: COLOR_MAP[type] || '#6b7280',
      users: items,
    }));
}

export function groupUsersByGoal(users: User[]): BoxData[] {
  // Only "Church" goal now
  const churchUsers = users.filter(u => u.goal === 'church');
  
  if (churchUsers.length === 0) return [];

  return [{
    label: 'Church',
    count: churchUsers.length,
    percentage: 100, // All users with goals go to church
    color: COLOR_MAP['church'] || '#10b981',
    users: churchUsers,
  }];
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
