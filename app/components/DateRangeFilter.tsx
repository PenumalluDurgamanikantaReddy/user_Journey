'use client';

interface DateRangeFilterProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
}

export default function DateRangeFilter({ 
  startDate, 
  endDate, 
  onStartDateChange, 
  onEndDateChange 
}: DateRangeFilterProps) {
  return (
    <div className="fixed top-6 right-20 z-40 flex flex-col gap-2 bg-gradient-to-br from-[#1a1f2e] to-[#1e2433] light:from-white light:to-gray-50 rounded-2xl shadow-2xl border-2 border-[#2d3548]/50 light:border-gray-300 px-5 py-4 transition-all duration-300 hover:shadow-blue-500/20 hover:border-blue-500/30">
      <label className="text-xs font-bold text-gray-400 light:text-gray-600 uppercase tracking-wider">Date Range</label>
      <div className="flex items-center gap-3">
        <input
          type="date"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          className="px-3 py-2 text-xs border-2 border-[#2d3548] light:border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-[#0f1419] light:bg-white text-gray-300 light:text-gray-900 transition-all duration-200 cursor-pointer hover:border-blue-500/50 font-medium shadow-lg"
        />
        <span className="text-gray-500 text-sm font-bold">→</span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          className="px-3 py-2 text-xs border-2 border-[#2d3548] light:border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-[#0f1419] light:bg-white text-gray-300 light:text-gray-900 transition-all duration-200 cursor-pointer hover:border-blue-500/50 font-medium shadow-lg"
        />
      </div>
    </div>
  );
}
