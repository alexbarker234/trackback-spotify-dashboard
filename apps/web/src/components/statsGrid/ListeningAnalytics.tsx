import { formatDate, formatDuration } from "@/lib/utils/timeUtils";
import { LongestSessionData, LongestStreakData } from "@workspace/core/queries/analytics";
import MetricCard from "./MetricCard";

export interface ListeningAnalyticsData {
  longestStreak: LongestStreakData;
  longestSession: LongestSessionData;
}

export default function ListeningAnalytics({ stats }: { stats: ListeningAnalyticsData }) {
  const streakInfo =
    stats.longestStreak.streakStartDate && stats.longestStreak.streakEndDate
      ? `${formatDate(new Date(stats.longestStreak.streakStartDate).getTime())} to ${formatDate(new Date(stats.longestStreak.streakEndDate).getTime())}`
      : "No date range available";

  const sessionInfo = stats.longestSession.sessionStartTime
    ? `${stats.longestSession.trackCount} tracks on ${stats.longestSession.sessionStartTime.toLocaleDateString()}`
    : `${stats.longestSession.trackCount} tracks`;

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <MetricCard
        title="Longest Listening Streak"
        mainText={`${stats.longestStreak.longestStreak} days`}
        secondaryText={streakInfo}
        gradientFrom="from-emerald-500/10"
        gradientTo="to-teal-500/10"
        blurColor="bg-emerald-500/20"
        textColor="text-emerald-400"
      />

      <MetricCard
        title="Listening Session"
        mainText={formatDuration(stats.longestSession.longestSessionDuration)}
        secondaryText={sessionInfo}
        gradientFrom="from-indigo-500/10"
        gradientTo="to-blue-500/10"
        blurColor="bg-indigo-500/20"
        textColor="text-indigo-400"
      />
    </div>
  );
}
