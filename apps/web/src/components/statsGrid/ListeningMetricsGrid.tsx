import { formatDuration } from "@/lib/utils/timeUtils";
import MetricCard from "./MetricCard";

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

function getCurrentMonthRangeParams() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  return `dateRange=custom&customStartDate=${start.getTime()}&customEndDate=${end.getTime()}`;
}

function getCurrentWeekRangeParams() {
  const end = new Date();
  const start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
  return `dateRange=custom&customStartDate=${start.getTime()}&customEndDate=${end.getTime()}`;
}

export default function ListeningMetricsGrid({
  stats,
  linkToStats = false
}: {
  stats: ListeningMetricsData;
  linkToStats?: boolean;
}) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
      <MetricCard
        title="Total Listens"
        mainText={stats.totalListens}
        secondaryText={`${formatDuration(stats.totalDuration)} total time`}
        gradientFrom="from-pink-500/10"
        gradientTo="to-rose-500/10"
        blurColor="bg-pink-500/20"
        textColor="text-pink-400"
        href={linkToStats ? "/dashboard/stats?dateRange=lifetime" : undefined}
      />

      <MetricCard
        title="This Year"
        mainText={stats.yearListens}
        secondaryText={`${formatDuration(stats.yearDuration)} total time`}
        gradientFrom="from-purple-500/10"
        gradientTo="to-pink-500/10"
        blurColor="bg-purple-500/20"
        textColor="text-purple-400"
        href={linkToStats ? "/dashboard/stats?dateRange=year" : undefined}
      />

      <MetricCard
        title="This Month"
        mainText={stats.monthListens}
        secondaryText={`${formatDuration(stats.monthDuration)} total time`}
        gradientFrom="from-yellow-500/10"
        gradientTo="to-orange-500/10"
        blurColor="bg-yellow-500/20"
        textColor="text-yellow-400"
        href={linkToStats ? `/dashboard/stats?${getCurrentMonthRangeParams()}` : undefined}
      />

      <MetricCard
        title="This Week"
        mainText={stats.weekListens}
        secondaryText={`${formatDuration(stats.weekDuration)} total time`}
        gradientFrom="from-red-500/10"
        gradientTo="to-pink-500/10"
        blurColor="bg-red-500/20"
        textColor="text-red-400"
        href={linkToStats ? `/dashboard/stats?${getCurrentWeekRangeParams()}` : undefined}
      />
    </div>
  );
}
