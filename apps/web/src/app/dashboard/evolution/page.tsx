import EvolutionChart from "@/components/charts/EvolutionChart/EvolutionChart";
import EvolutionStats from "@/components/statsGrid/EvolutionStats";
import {
  getTopArtistsByNumberOneWeeks,
  getWeeklyTopArtists
} from "@workspace/core/queries/artists";

export default async function EvolutionPage() {
  const weeklyTopArtists = await getWeeklyTopArtists({ limit: 10, movingAverageWeeks: 4 });
  const numberOneWeeksData = await getTopArtistsByNumberOneWeeks({
    limit: 25,
    movingAverageWeeks: 4
  });

  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-y-6">
        <h1 className="mb-8 text-3xl font-bold text-white">Top Artists Evolution Over Time</h1>

        {/* Evolution Chart */}
        <div>
          <h2 className="mb-4 text-2xl font-bold text-white">Weekly Rankings Evolution</h2>
          <EvolutionChart data={weeklyTopArtists} animationSpeed={1500} movingAverageWeeks={4} />
        </div>

        {/* Evolution Stats */}
        <div className="mb-8">
          <h2 className="mb-4 text-2xl font-bold text-white">Evolution Statistics</h2>
          <EvolutionStats data={numberOneWeeksData} />
        </div>
      </div>
    </div>
  );
}
