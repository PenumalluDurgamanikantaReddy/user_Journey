'use client';

import { AggregatedData } from '@/app/types/sankey';
import { Medium } from '@/app/data/mockData';

interface StatsProps {
  data: AggregatedData;
}

const MEDIUM_LABELS: Record<Medium, string> = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  twitter: 'Twitter',
  'google-ads': 'Google Ads',
  'meta-ads': 'Meta Ads',
  youversion: 'YouVersion',
  website: 'Website',
  ai: 'AI Chat',
  'daily-devotionals': 'Daily Devotionals',
};

function fmt(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000)     return (n / 1_000).toFixed(1) + 'K';
  return n.toLocaleString();
}

export default function DetailedStats({ data }: StatsProps) {
  const { platforms, grandTotal } = data;
  if (platforms.length === 0) return null;

  const totalComments = platforms.reduce((s, p) => s + p.comments, 0);
  const totalDMs      = platforms.reduce((s, p) => s + p.dms,      0);
  const totalCourses  = platforms.reduce((s, p) => s + p.courses,  0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
      {/* Platform Breakdown */}
      <div className="bg-[#1a1f2e] rounded-xl shadow-lg p-6 border border-[#2d3548]">
        <h3 className="text-xl font-bold text-gray-100 mb-6">Platform Breakdown</h3>
        <div className="space-y-4">
          {platforms.map(p => (
            <div key={p.medium} className="border-l-4 border-blue-500 pl-4">
              <div className="flex justify-between items-center mb-1">
                <p className="font-semibold text-gray-300">{MEDIUM_LABELS[p.medium] || p.medium}</p>
                <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm font-bold border border-blue-500/30">
                  {fmt(p.total)}
                </span>
              </div>
              <div className="flex gap-4 text-xs text-gray-400 mb-2">
                {p.comments > 0 && <span>💬 {fmt(p.comments)} comments</span>}
                {p.dms > 0      && <span>✉️ {fmt(p.dms)} DMs</span>}
                {p.courses > 0  && <span>📚 {fmt(p.courses)} courses</span>}
              </div>
              <div className="w-full bg-[#0f1419] rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${grandTotal > 0 ? (p.total / grandTotal) * 100 : 0}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Conversation Breakdown */}
      <div className="bg-[#1a1f2e] rounded-xl shadow-lg p-6 border border-[#2d3548]">
        <h3 className="text-xl font-bold text-gray-100 mb-6">Conversation Breakdown</h3>
        <div className="space-y-4">
          {[
            { label: 'Comments',        count: totalComments, color: 'text-blue-400',   bar: 'bg-blue-500'   },
            { label: 'Direct Messages', count: totalDMs,      color: 'text-purple-400', bar: 'bg-purple-500' },
            { label: 'Courses',         count: totalCourses,  color: 'text-red-400',    bar: 'bg-red-500'    },
          ].map(({ label, count, color, bar }) => {
            const conv = totalComments + totalDMs + totalCourses;
            return (
              <div key={label} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-[140px]">
                  <div className={`w-3 h-3 rounded-full ${bar}`} />
                  <span className="font-semibold text-gray-300">{label}</span>
                </div>
                <div className="flex-1">
                  <div className="w-full bg-[#0f1419] rounded-full h-2">
                    <div className={`${bar} h-2 rounded-full`}
                      style={{ width: `${conv > 0 ? (count / conv) * 100 : 0}%` }} />
                  </div>
                </div>
                <span className={`text-lg font-bold ${color} min-w-[60px] text-right`}>{fmt(count)}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="bg-[#1a1f2e] rounded-xl shadow-lg p-6 border border-[#2d3548] lg:col-span-2">
        <h3 className="text-xl font-bold text-gray-100 mb-6">Key Metrics</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex justify-between items-center p-4 bg-green-500/10 rounded-lg border border-green-500/20">
            <span className="text-gray-400">Church Goal</span>
            <span className="text-2xl font-bold text-green-400">Coming Soon</span>
          </div>
          <div className="flex justify-between items-center p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <span className="text-gray-400">Total Conversations</span>
            <span className="text-2xl font-bold text-blue-400">
              {fmt(totalComments + totalDMs + totalCourses)}
            </span>
          </div>
          <div className="flex justify-between items-center p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
            <span className="text-gray-400">Platforms Active</span>
            <span className="text-2xl font-bold text-purple-400">{platforms.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
