import CompactRankListCard from "@/components/cards/CompactRankListCard";
import MetricCard from "@/components/statsGrid/MetricCard";
import { EvolutionStatsItem } from "@workspace/core/queries/artists";

export default function EvolutionStats({ data }: { data: EvolutionStatsItem[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-gray-500/10 to-gray-600/10 p-6 backdrop-blur-sm">
        <h3 className="mb-4 text-lg font-semibold text-white">Weeks at #1</h3>
        <p className="text-gray-400">No data available</p>
      </div>
    );
  }

  // Find the longest streak across all artists
  const longestStreakArtist = data.reduce(
    (longest, artist) => (artist.longestStreak > longest.longestStreak ? artist : longest),
    data[0]
  );
  const topArtist = data[0];

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Summary Stats */}
        <MetricCard
          title="Longest Streak"
          mainText={longestStreakArtist.longestStreak}
          secondaryText={`by ${longestStreakArtist.artistName}`}
          gradientFrom="from-pink-500/10"
          gradientTo="to-rose-500/10"
          blurColor="bg-pink-500/20"
          textColor="text-pink-400"
        />

        <MetricCard
          title="Most Total Weeks"
          mainText={topArtist.weeksAtNumberOne}
          secondaryText={`by ${topArtist.artistName}`}
          gradientFrom="from-purple-500/10"
          gradientTo="to-pink-500/10"
          blurColor="bg-purple-500/20"
          textColor="text-purple-400"
        />
      </div>
      {/* Top Artists List */}
      <h3 className="text-lg font-semibold text-white">Top Artists by Weeks at #1</h3>
      <div className="space-y-3">
        {data.slice(0, 10).map((artist, index) => (
          <CompactRankListCard
            key={artist.artistId}
            href={`/dashboard/artist/${artist.artistId}`}
            imageUrl={artist.artistImageUrl}
            name={artist.artistName}
            subtitle={`${artist.longestStreak} week streak • ${new Date(artist.firstWeekAtNumberOne).toLocaleDateString()} - ${new Date(artist.lastWeekAtNumberOne).toLocaleDateString()}`}
            rank={index + 1}
            primaryText={`${artist.weeksAtNumberOne} weeks`}
            secondaryText="at #1"
          />
        ))}
      </div>
    </div>
  );
}
