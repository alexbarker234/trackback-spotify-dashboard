import { formatDuration } from "@/lib/utils/timeUtils";

export interface ListeningMetricsData {
  totalListens: number;
  totalDuration: number;
  yearListens: number;
  yearDuration: number;
  monthListens: number;
  monthDuration: number;
  weekListens: number;
  weekDuration: number;
}

export default function ListeningMetricsGrid({ stats }: { stats: ListeningMetricsData }) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
      {/* Total Listens */}
      <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-pink-500/10 to-rose-500/10 p-6 backdrop-blur-sm transition-all">
        <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-pink-500/20 blur-2xl"></div>
        <div className="relative">
          <h3 className="mb-2 text-sm font-medium text-gray-400">Total Listens</h3>
          <p className="text-3xl font-bold text-pink-400">{stats.totalListens.toLocaleString()}</p>
          <p className="text-sm text-gray-500">{formatDuration(stats.totalDuration)} total time</p>
        </div>
      </div>

      {/* This Year */}
      <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 p-6 backdrop-blur-sm transition-all">
        <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-purple-500/20 blur-2xl"></div>
        <div className="relative">
          <h3 className="mb-2 text-sm font-medium text-gray-400">This Year</h3>
          <p className="text-3xl font-bold text-purple-400">{stats.yearListens.toLocaleString()}</p>
          <p className="text-sm text-gray-500">{formatDuration(stats.yearDuration)} total time</p>
        </div>
      </div>

      {/* This Month */}
      <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-yellow-500/10 to-orange-500/10 p-6 backdrop-blur-sm transition-all">
        <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-yellow-500/20 blur-2xl"></div>
        <div className="relative">
          <h3 className="mb-2 text-sm font-medium text-gray-400">This Month</h3>
          <p className="text-3xl font-bold text-yellow-400">{stats.monthListens.toLocaleString()}</p>
          <p className="text-sm text-gray-500">{formatDuration(stats.monthDuration)} total time</p>
        </div>
      </div>

      {/* This Week */}
      <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-500/10 to-pink-500/10 p-6 backdrop-blur-sm transition-all">
        <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-red-500/20 blur-2xl"></div>
        <div className="relative">
          <h3 className="mb-2 text-sm font-medium text-gray-400">This Week</h3>
          <p className="text-3xl font-bold text-red-400">{stats.weekListens.toLocaleString()}</p>
          <p className="text-sm text-gray-500">{formatDuration(stats.weekDuration)} total time</p>
        </div>
      </div>
    </div>
  );
}
