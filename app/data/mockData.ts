export type Medium = 'facebook' | 'instagram' | 'ads' | 'youversion' | 'website' | 'ai' | 'courses';
export type Phase = 'evangelism' | 'discipleship' | 'leadership';
export type ConversationType = 'comments' | 'dm' | 'courses' | 'chat';
export type Goal = 'conversation' | 'church';

export interface User {
  id: string;
  name: string;
  email: string;
  medium: Medium;
  conversationType?: ConversationType;
  language: string;
  brand: string;
  date: string;
  status: 'active' | 'inactive';
  phase: Phase;
  goal: Goal;
  engagementLevel: number; // 0-100
}

// Mock data simulating Excel sheets backend
export const mockUsers: User[] = [
  // Facebook users
  { id: '1', name: 'John Doe', email: 'john@example.com', medium: 'facebook', conversationType: 'comments', language: 'English', brand: 'Biblword', date: '2024-01-15', status: 'active', phase: 'evangelism', goal: 'conversation', engagementLevel: 75 },
  { id: '2', name: 'Maria Garcia', email: 'maria@example.com', medium: 'facebook', conversationType: 'dm', language: 'Spanish', brand: 'Biblword', date: '2024-01-20', status: 'active', phase: 'evangelism', goal: 'church', engagementLevel: 90 },
  { id: '3', name: 'Ahmed Ali', email: 'ahmed@example.com', medium: 'facebook', conversationType: 'comments', language: 'Arabic', brand: 'AlKitab', date: '2024-02-05', status: 'active', phase: 'discipleship', goal: 'conversation', engagementLevel: 65 },
  
  // Instagram users
  { id: '4', name: 'Sarah Smith', email: 'sarah@example.com', medium: 'instagram', language: 'English', brand: 'SheRises', date: '2024-02-10', status: 'active', phase: 'discipleship', goal: 'conversation', engagementLevel: 80 },
  { id: '5', name: 'Lucas Silva', email: 'lucas@example.com', medium: 'instagram', language: 'Portuguese', brand: 'Biblword', date: '2024-02-15', status: 'inactive', phase: 'evangelism', goal: 'conversation', engagementLevel: 45 },
  
  // Ads
  { id: '6', name: 'Emma Wilson', email: 'emma@example.com', medium: 'ads', language: 'English', brand: 'Search4Truth', date: '2024-02-20', status: 'active', phase: 'evangelism', goal: 'conversation', engagementLevel: 70 },
  { id: '7', name: 'Carlos Rodriguez', email: 'carlos@example.com', medium: 'ads', language: 'Spanish', brand: 'Biblword', date: '2024-03-01', status: 'active', phase: 'evangelism', goal: 'church', engagementLevel: 85 },
  
  // YouVersion app
  { id: '8', name: 'Rachel Green', email: 'rachel@example.com', medium: 'youversion', language: 'English', brand: 'Biblword', date: '2024-03-05', status: 'active', phase: 'discipleship', goal: 'conversation', engagementLevel: 88 },
  { id: '9', name: 'James Park', email: 'james@example.com', medium: 'youversion', language: 'Korean', brand: 'Search4Truth', date: '2024-03-10', status: 'active', phase: 'leadership', goal: 'conversation', engagementLevel: 92 },
  
  // Website
  { id: '10', name: 'Lisa Chen', email: 'lisa@example.com', medium: 'website', language: 'Chinese', brand: 'Biblword', date: '2024-03-15', status: 'active', phase: 'evangelism', goal: 'conversation', engagementLevel: 60 },
  { id: '11', name: 'Michael Brown', email: 'michael@example.com', medium: 'website', language: 'English', brand: 'AlKitab', date: '2024-03-20', status: 'inactive', phase: 'discipleship', goal: 'conversation', engagementLevel: 50 },
  
  // AI Chat
  { id: '12', name: 'Sofia Rossi', email: 'sofia@example.com', medium: 'ai', conversationType: 'chat', language: 'Italian', brand: 'Search4Truth', date: '2024-03-25', status: 'active', phase: 'evangelism', goal: 'conversation', engagementLevel: 72 },
  { id: '13', name: 'David Kumar', email: 'david@example.com', medium: 'ai', conversationType: 'chat', language: 'Hindi', brand: 'Biblword', date: '2024-04-01', status: 'active', phase: 'leadership', goal: 'church', engagementLevel: 95 },
  
  // Courses
  { id: '14', name: 'Anna Mueller', email: 'anna@example.com', medium: 'courses', conversationType: 'courses', language: 'German', brand: 'SheRises', date: '2024-04-05', status: 'active', phase: 'discipleship', goal: 'church', engagementLevel: 91 },
  { id: '15', name: 'Paulo Santos', email: 'paulo@example.com', medium: 'courses', conversationType: 'courses', language: 'Portuguese', brand: 'Biblword', date: '2024-04-10', status: 'active', phase: 'leadership', goal: 'church', engagementLevel: 93 },
];

export interface FilterState {
  content: Medium[];
  languages: string[];
  phases: Phase[];
  statuses: ('active' | 'inactive')[];
  dateRange: { start: string; end: string };
}

export const BRANDS = ['Biblword', 'SheRises', 'AlKitab', 'Search4Truth'];
export const LANGUAGES = ['English', 'Spanish', 'Arabic', 'Portuguese', 'Korean', 'Chinese', 'Italian', 'Hindi', 'German'];
export const PHASES: Phase[] = ['evangelism', 'discipleship', 'leadership'];
export const MEDIUMS = ['facebook', 'instagram', 'ads', 'youversion', 'website', 'ai', 'courses'];
export const CONTENT_SOURCES = ['social-media', 'website', 'ads', 'youversion', 'ai', 'courses'] as const;

export const getContentLabel = (content: string): string => {
  const labels: Record<string, string> = {
    'social-media': 'Social Media',
    'website': 'Website',
    'ads': 'Ads',
    'youversion': 'YouVersion',
    'ai': 'AI',
    'courses': 'Courses',
  };
  return labels[content] || content;
};

export const getMediumLabel = (medium: Medium): string => {
  const labels: Record<Medium, string> = {
    facebook: 'Facebook',
    instagram: 'Instagram',
    ads: 'Ads',
    youversion: 'YouVersion',
    website: 'Website',
    ai: 'AI Chat',
    courses: 'Courses'
  };
  return labels[medium];
};

export const getPhaseLabel = (phase: Phase): string => {
  const labels: Record<Phase, string> = {
    evangelism: 'Evangelism',
    discipleship: 'Discipleship',
    leadership: 'Leadership'
  };
  return labels[phase];
};

export const filterUsers = (users: User[], filters: FilterState): User[] => {
  return users.filter(user => {
    // Content filter - map content sources to mediums
    let contentMatch = true;
    if (filters.content.length > 0) {
      const selectedContent = filters.content[0];
      if (selectedContent === 'social-media') {
        contentMatch = user.medium === 'facebook' || user.medium === 'instagram';
      } else {
        contentMatch = filters.content.includes(user.medium);
      }
    }
    
    const languageMatch = filters.languages.length === 0 || filters.languages.includes(user.language);
    const phaseMatch = filters.phases.length === 0 || filters.phases.includes(user.phase);
    const statusMatch = filters.statuses.length === 0 || filters.statuses.includes(user.status);
    const dateMatch = new Date(user.date) >= new Date(filters.dateRange.start) && new Date(user.date) <= new Date(filters.dateRange.end);
    
    return contentMatch && languageMatch && phaseMatch && statusMatch && dateMatch;
  });
};
