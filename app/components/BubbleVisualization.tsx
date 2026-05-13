'use client';

import { User, getMediumLabel } from '@/app/data/mockData';

interface BoxData {
  label: string;
  count: number;
  percentage: number;
  color: string;
  users: User[];
}

interface Column {
  title: string;
  boxes: BoxData[];
}

interface BubbleVisualizationProps {
  users: User[];
}

export default function BubbleVisualization({ users }: BubbleVisualizationProps) {
  if (users.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-12 text-center">
        <p className="text-gray-500 text-lg">No data available for the selected filters</p>
      </div>
    );
  }

  // Group by medium (Content column)
  const contentBoxes: Record<string, User[]> = {};
  const mediums = ['facebook', 'instagram', 'ads', 'youversion', 'website', 'ai', 'courses'];
  mediums.forEach(medium => {
    const filtered = users.filter(u => u.medium === medium);
    if (filtered.length > 0) {
      contentBoxes[medium] = filtered;
    }
  });

  // Group by conversation type (Conversation column)
  const conversationGroups: Record<string, User[]> = {};
  users.forEach(user => {
    if (!user.conversationType) return;
    conversationGroups[user.conversationType] ||= [];
    conversationGroups[user.conversationType].push(user);
  });

  const conversationBoxes = Object.fromEntries(
    Object.entries(conversationGroups).filter(([_, items]) => items.length > 0)
  );

  // Group by goal (Church column)
  const churchBoxes: Record<string, User[]> = {
    conversation: users.filter(u => u.goal === 'conversation'),
    church: users.filter(u => u.goal === 'church'),
  };

  const createBoxes = (groups: Record<string, User[]>, totalCount: number): BoxData[] => {
    return Object.entries(groups)
      .filter(([_, items]) => items.length > 0)
      .map(([label, items]) => ({
        label,
        count: items.length,
        percentage: Math.round((items.length / totalCount) * 100 * 100) / 100,
        color: getColor(label),
        users: items,
      }));
  };

  const getColor = (label: string): string => {
    const colors: Record<string, string> = {
      facebook: 'from-blue-500 to-blue-600',
      instagram: 'from-pink-500 to-rose-600',
      ads: 'from-yellow-500 to-amber-600',
      youversion: 'from-purple-500 to-indigo-600',
      website: 'from-green-500 to-emerald-600',
      ai: 'from-cyan-500 to-blue-600',
      courses: 'from-red-500 to-rose-600',
      comments: 'from-blue-400 to-blue-500',
      dm: 'from-purple-400 to-purple-500',
      chat: 'from-cyan-400 to-cyan-500',
      conversation: 'from-orange-400 to-orange-500',
      church: 'from-green-400 to-green-500',
    };
    return colors[label] || 'from-gray-500 to-gray-600';
  };

  const conversationTotal = Object.values(conversationBoxes).reduce((sum, items) => sum + items.length, 0);
  const contentBoxesArray = createBoxes(contentBoxes, users.length);
  const conversationBoxesArray = createBoxes(conversationBoxes, conversationTotal || users.length);
  const churchBoxesArray = createBoxes(churchBoxes, users.length);

  const calculateBoxSize = (percentage: number): string => {
    if (percentage >= 40) return 'w-40 h-40';
    if (percentage >= 25) return 'w-32 h-32';
    if (percentage >= 15) return 'w-28 h-28';
    if (percentage >= 8) return 'w-24 h-24';
    return 'w-20 h-20';
  };

  const renderColumn = (boxes: BoxData[], title: string) => (
    <div className="flex flex-col items-center justify-start min-h-96">
      <h3 className="text-xl font-bold text-gray-900 mb-8">{title}</h3>
      <div className="flex flex-wrap gap-6 justify-center items-center">
        {boxes.map((box, idx) => (
          <div key={idx} className="relative group">
            <div
              className={`${calculateBoxSize(box.percentage)} bg-linear-to-br ${box.color} rounded-lg flex flex-col items-center justify-center text-white shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer relative overflow-hidden`}
            >
              {/* Shine effect */}
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-5 transition-opacity rounded-lg" />
              
              <div className="text-center z-10">
                <p className="font-bold text-sm sm:text-base">{box.count}</p>
                <p className="text-xs sm:text-sm opacity-90 capitalize whitespace-nowrap">
                  {box.label.replace(/_/g, ' ')}
                </p>
                <p className="text-lg sm:text-xl font-bold mt-1">{box.percentage.toFixed(1)}%</p>
              </div>
            </div>

            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
              {box.count} users ({box.percentage.toFixed(1)}%)
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="bg-linear-to-b from-gray-50 to-white rounded-xl shadow-lg p-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">User Journey Flow</h2>
      
      <div className="relative">
        {/* Content Column */}
        <div className="lg:w-1/3">
          {renderColumn(contentBoxesArray, '📱 Content')}
        </div>
        
        {/* Conversation Column */}
        <div className="lg:w-1/3">
          {renderColumn(conversationBoxesArray, '💬 Conversation')}
        </div>
        
        {/* Goal Column */}
        <div className="lg:w-1/3">
          {renderColumn(churchBoxesArray, '⛪ Goal')}
        </div>
        
        {/* Flow arrows between columns */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Arrow from Content to Conversation */}
          <div className="flex items-center justify-between lg:w-[66.66%] lg:left-[16.66%] mt-[calc(50%-12px)]">
            <div className="w-10 h-0.5 bg-gray-300"></div>
            <div className="w-4 h-4 border-t-2 border-r-2 border-gray-300 transform rotate-45"></div>
          </div>
          
          {/* Arrow from Conversation to Goal */}
          <div className="flex items-center justify-between lg:w-[66.66%] lg:left-[16.66%] mt-[calc(50%-12px)]">
            <div className="w-10 h-0.5 bg-gray-300"></div>
            <div className="w-4 h-4 border-t-2 border-r-2 border-gray-300 transform rotate-45"></div>
          </div>
        </div>
      </div>

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
