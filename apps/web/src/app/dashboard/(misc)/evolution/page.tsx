import EvolutionChart from "@/components/charts/EvolutionChart/EvolutionChart";
import EvolutionStats from "@/components/statsGrid/EvolutionStats";
import {
  getTopArtistsByNumberOneWeeks,
  getWeeklyTopArtists
} from "@workspace/core/queries/evolution";

import Loading from "@/components/Loading";
import { getStandaloneCookieServer } from "@/lib/utils/serverCookies";
import { Suspense } from "react";

async function EvolutionPageContent() {
  const isStandalone = await getStandaloneCookieServer();
  const weeklyTopArtists = await getWeeklyTopArtists({ limit: 10, movingAverageWeeks: 4 });
  const numberOneWeeksData = await getTopArtistsByNumberOneWeeks({
    limit: 25,
    movingAverageWeeks: 4
  });

  return (
    <div className="flex flex-col gap-4 p-4">
      {!isStandalone && (
        <h1 className="mb-8 text-3xl font-bold text-white">Top Artists Evolution Over Time</h1>
      )}

      {/* Evolution Chart */}
      <div>
        <h2 className="mb-4 text-2xl font-bold text-white">Weekly Rankings of Artists</h2>
        <EvolutionChart data={weeklyTopArtists} animationSpeed={1500} movingAverageWeeks={4} />
      </div>

      {/* Evolution Stats */}
      <div className="mb-8">
        <h2 className="mb-4 text-2xl font-bold text-white">Evolution Statistics</h2>
        <EvolutionStats data={numberOneWeeksData} itemType="artists" />
      </div>
    </div>
  );
}

export default function EvolutionPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-64 items-center justify-center">
          <Loading />
        </div>
      }
    >
      <EvolutionPageContent />
    </Suspense>
  );
}
