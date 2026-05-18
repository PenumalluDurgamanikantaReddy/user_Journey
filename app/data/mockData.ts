export type Medium = 'facebook' | 'instagram' | 'twitter' | 'google-ads' | 'meta-ads' | 'youversion' | 'website' | 'ai' | 'courses';
export type Phase = 'evangelism' | 'discipleship' | 'leadership';
export type ConversationType = 'comments' | 'dm' | 'courses';
export type Goal = 'church';
export type Country = 'USA' | 'Brazil' | 'India' | 'UK' | 'Germany' | 'Spain' | 'China' | 'Japan' | 'Australia';

export interface User {
  id: string;
  name: string;
  email: string;
  medium: Medium;
  conversationType?: ConversationType;
  language: string;
  brand: string;
  country: Country;
  date: string;
  status: 'active' | 'inactive';
  phase: Phase;
  goal: Goal;
  engagementLevel: number; // 0-100
}

// Mock data simulating Excel sheets backend
export const mockUsers: User[] = [
  // Facebook users
  { id: '1', name: 'John Doe', email: 'john@example.com', medium: 'facebook', conversationType: 'comments', language: 'English', brand: 'Biblword', country: 'USA', date: '2024-01-15', status: 'active', phase: 'evangelism', goal: 'church', engagementLevel: 75 },
  { id: '2', name: 'Maria Garcia', email: 'maria@example.com', medium: 'facebook', conversationType: 'dm', language: 'Spanish', brand: 'Biblword', country: 'Spain', date: '2024-01-20', status: 'active', phase: 'evangelism', goal: 'church', engagementLevel: 90 },
  { id: '3', name: 'Ahmed Ali', email: 'ahmed@example.com', medium: 'facebook', conversationType: 'comments', language: 'Arabic', brand: 'AlKitab', country: 'USA', date: '2024-02-05', status: 'active', phase: 'discipleship', goal: 'church', engagementLevel: 65 },
  
  // Instagram users
  { id: '4', name: 'Sarah Smith', email: 'sarah@example.com', medium: 'instagram', conversationType: 'dm', language: 'English', brand: 'SheRises', country: 'UK', date: '2024-02-10', status: 'active', phase: 'discipleship', goal: 'church', engagementLevel: 80 },
  { id: '5', name: 'Lucas Silva', email: 'lucas@example.com', medium: 'instagram', conversationType: 'comments', language: 'Portuguese', brand: 'Biblword', country: 'Brazil', date: '2024-02-15', status: 'inactive', phase: 'evangelism', goal: 'church', engagementLevel: 45 },
  
  // Twitter users
  { id: '16', name: 'Tom Wilson', email: 'tom@example.com', medium: 'twitter', conversationType: 'comments', language: 'English', brand: 'Biblword', country: 'USA', date: '2024-02-18', status: 'active', phase: 'evangelism', goal: 'church', engagementLevel: 68 },
  { id: '17', name: 'Yuki Tanaka', email: 'yuki@example.com', medium: 'twitter', conversationType: 'dm', language: 'Japanese', brand: 'Search4Truth', country: 'Japan', date: '2024-03-12', status: 'active', phase: 'discipleship', goal: 'church', engagementLevel: 82 },
  
  // Google Ads
  { id: '6', name: 'Emma Wilson', email: 'emma@example.com', medium: 'google-ads', conversationType: 'comments', language: 'English', brand: 'Search4Truth', country: 'USA', date: '2024-02-20', status: 'active', phase: 'evangelism', goal: 'church', engagementLevel: 70 },
  { id: '18', name: 'Hans Schmidt', email: 'hans@example.com', medium: 'google-ads', conversationType: 'dm', language: 'German', brand: 'Biblword', country: 'Germany', date: '2024-03-08', status: 'active', phase: 'evangelism', goal: 'church', engagementLevel: 77 },
  
  // Meta Ads
  { id: '7', name: 'Carlos Rodriguez', email: 'carlos@example.com', medium: 'meta-ads', conversationType: 'comments', language: 'Spanish', brand: 'Biblword', country: 'Spain', date: '2024-03-01', status: 'active', phase: 'evangelism', goal: 'church', engagementLevel: 85 },
  { id: '19', name: 'Priya Patel', email: 'priya@example.com', medium: 'meta-ads', conversationType: 'dm', language: 'Hindi', brand: 'AlKitab', country: 'India', date: '2024-03-14', status: 'active', phase: 'discipleship', goal: 'church', engagementLevel: 79 },
  
  // YouVersion app
  { id: '8', name: 'Rachel Green', email: 'rachel@example.com', medium: 'youversion', conversationType: 'comments', language: 'English', brand: 'Biblword', country: 'USA', date: '2024-03-05', status: 'active', phase: 'discipleship', goal: 'church', engagementLevel: 88 },
  { id: '9', name: 'James Park', email: 'james@example.com', medium: 'youversion', conversationType: 'dm', language: 'Korean', brand: 'Search4Truth', country: 'USA', date: '2024-03-10', status: 'active', phase: 'leadership', goal: 'church', engagementLevel: 92 },
  
  // Website
  { id: '10', name: 'Lisa Chen', email: 'lisa@example.com', medium: 'website', conversationType: 'comments', language: 'Chinese', brand: 'Biblword', country: 'China', date: '2024-03-15', status: 'active', phase: 'evangelism', goal: 'church', engagementLevel: 60 },
  { id: '11', name: 'Michael Brown', email: 'michael@example.com', medium: 'website', conversationType: 'dm', language: 'English', brand: 'AlKitab', country: 'UK', date: '2024-03-20', status: 'inactive', phase: 'discipleship', goal: 'church', engagementLevel: 50 },
  
  // AI Chat
  { id: '12', name: 'Sofia Rossi', email: 'sofia@example.com', medium: 'ai', conversationType: 'comments', language: 'Italian', brand: 'Search4Truth', country: 'USA', date: '2024-03-25', status: 'active', phase: 'evangelism', goal: 'church', engagementLevel: 72 },
  { id: '13', name: 'David Kumar', email: 'david@example.com', medium: 'ai', conversationType: 'dm', language: 'Hindi', brand: 'Biblword', country: 'India', date: '2024-04-01', status: 'active', phase: 'leadership', goal: 'church', engagementLevel: 95 },
  
  // Courses
  { id: '14', name: 'Anna Mueller', email: 'anna@example.com', medium: 'courses', conversationType: 'courses', language: 'German', brand: 'SheRises', country: 'Germany', date: '2024-04-05', status: 'active', phase: 'discipleship', goal: 'church', engagementLevel: 91 },
  { id: '15', name: 'Paulo Santos', email: 'paulo@example.com', medium: 'courses', conversationType: 'courses', language: 'Portuguese', brand: 'Biblword', country: 'Brazil', date: '2024-04-10', status: 'active', phase: 'leadership', goal: 'church', engagementLevel: 93 },
  { id: '20', name: 'Kate Johnson', email: 'kate@example.com', medium: 'courses', conversationType: 'courses', language: 'English', brand: 'SheRises', country: 'Australia', date: '2024-04-12', status: 'active', phase: 'leadership', goal: 'church', engagementLevel: 89 },
];

export interface FilterState {
  countries: Country[];
  languages: string[];
  brands: string[];
  phases: Phase[];
  conversationTypes: ConversationType[];
  dateRange: { start: string; end: string };
}

export const BRANDS = ['Biblword', 'SheRises', 'AlKitab', 'Search4Truth'];
export const LANGUAGES = ['English', 'Spanish', 'Arabic', 'Portuguese', 'Korean', 'Chinese', 'Italian', 'Hindi', 'German', 'Japanese'];
export const PHASES: Phase[] = ['evangelism', 'discipleship', 'leadership'];
export const CONVERSATION_TYPES: ConversationType[] = ['comments', 'dm', 'courses'];
export const COUNTRIES: Country[] = ['USA', 'Brazil', 'India', 'UK', 'Germany', 'Spain', 'China', 'Japan', 'Australia'];

export const getMediumLabel = (medium: Medium): string => {
  const labels: Record<Medium, string> = {
    facebook: 'Facebook',
    instagram: 'Instagram',
    twitter: 'Twitter',
    'google-ads': 'Google Ads',
    'meta-ads': 'Meta Ads',
    youversion: 'YouVersion',
    website: 'Website',
    ai: 'AI Chat',
    courses: 'Courses'
  };
  return labels[medium];
};

export const getConversationLabel = (type: ConversationType): string => {
  const labels: Record<ConversationType, string> = {
    comments: 'Comments',
    dm: 'Direct Messages',
    courses: 'Courses'
  };
  return labels[type];
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
    const countryMatch = filters.countries.length === 0 || filters.countries.includes(user.country);
    const languageMatch = filters.languages.length === 0 || filters.languages.includes(user.language);
    const brandMatch = filters.brands.length === 0 || filters.brands.includes(user.brand);
    const phaseMatch = filters.phases.length === 0 || filters.phases.includes(user.phase);
    const conversationMatch = filters.conversationTypes.length === 0 || (user.conversationType && filters.conversationTypes.includes(user.conversationType));
    const dateMatch = new Date(user.date) >= new Date(filters.dateRange.start) && new Date(user.date) <= new Date(filters.dateRange.end);
    
    return countryMatch && languageMatch && brandMatch && phaseMatch && conversationMatch && dateMatch;
  });
};
