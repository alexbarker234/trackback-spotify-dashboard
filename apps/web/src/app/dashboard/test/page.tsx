import RaceBarChart from "@/components/charts/RaceBarChart";
import { getWeeklyTopArtists } from "@workspace/core/queries/artists";

export default async function TestPage() {
  const weeklyTopArtists = await getWeeklyTopArtists({ limit: 10, movingAverageWeeks: 4 });

  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-y-6">
        <h1 className="mb-8 text-3xl font-bold text-white">Chart Testing</h1>
        <RaceBarChart data={weeklyTopArtists} animationSpeed={1500} movingAverageWeeks={4} />
      </div>
    </div>
  );
}
