import YearSharePieChart from "@/components/charts/dashboard/YearSharePieChart";
import YearlyStreamBarChart from "@/components/charts/dashboard/YearlyStreamBarChart";
import MetricCard from "@/components/statsGrid/MetricCard";
import {
  getMostListenedTracksByReleaseYear,
  getYearlyReleaseYearStreamData
} from "@workspace/core";
import Link from "next/link";

export default async function ReleaseYearsAnalysisPage() {
  const [yearlyReleaseYearStreamData, mostListenedByYear] = await Promise.all([
    getYearlyReleaseYearStreamData(),
    getMostListenedTracksByReleaseYear()
  ]);

  const totalListens = yearlyReleaseYearStreamData.reduce((sum, y) => sum + y.streamCount, 0);

  const topYearByStreams = yearlyReleaseYearStreamData.reduce(
    (best, y) => (y.streamCount > best.streamCount ? y : best),
    yearlyReleaseYearStreamData[0] ?? { year: "", streamCount: 0, totalDuration: 0 }
  );

  const topYearByDuration = yearlyReleaseYearStreamData.reduce(
    (best, y) => (y.totalDuration > best.totalDuration ? y : best),
    yearlyReleaseYearStreamData[0] ?? { year: "", streamCount: 0, totalDuration: 0 }
  );

  const topTrackByStreams = mostListenedByYear.find((t) => t.year === topYearByStreams.year);
  const topTrackByDuration = mostListenedByYear.find((t) => t.year === topYearByDuration.year);

  const yearsByShare = yearlyReleaseYearStreamData
    .map((y) => ({
      ...y,
      sharePct: totalListens > 0 ? (y.streamCount / totalListens) * 100 : 0
    }))
    .sort((a, b) => b.sharePct - a.sharePct)
    .slice(0, 6);

  return (
    <div className="flex-1 px-2 py-4 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-6 text-4xl font-bold text-white">Release year analysis</h1>
        <div className="mb-6 flex flex-col gap-3">
          <p className="text-sm text-gray-400">
            These charts group your listening by the track&apos;s release year (from the album&apos;s Spotify release date).
          </p>
          <Link
            href="/dashboard/years/list"
            className="w-fit cursor-pointer rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-100 transition-colors hover:bg-white/10"
          >
            View list
          </Link>
        </div>

        {yearlyReleaseYearStreamData.length === 0 ? (
          <div className="text-gray-400">No data found yet.</div>
        ) : (
          <>
            <div className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
              <MetricCard
                title="Top year (streams)"
                mainText={topYearByStreams.year || "—"}
                secondaryText={
                  topTrackByStreams
                    ? `#1: ${topTrackByStreams.trackName}`
                    : "—"
                }
                href={topYearByStreams.year ? `/dashboard/years/${topYearByStreams.year}` : undefined}
                gradientFrom="from-amber-500/10"
                gradientTo="to-orange-500/10"
                blurColor="bg-amber-500/20"
                textColor="text-amber-400"
              />
              <MetricCard
                title="Top year (duration)"
                mainText={topYearByDuration.year || "—"}
                secondaryText={
                  topTrackByDuration
                    ? `#1: ${topTrackByDuration.trackName}`
                    : "—"
                }
                href={topYearByDuration.year ? `/dashboard/years/${topYearByDuration.year}` : undefined}
                gradientFrom="from-red-500/10"
                gradientTo="to-pink-500/10"
                blurColor="bg-red-500/20"
                textColor="text-red-400"
              />
            </div>

            <div className="flex flex-col gap-6">
              <YearlyStreamBarChart data={yearlyReleaseYearStreamData} title="Streams by release year" />
              <YearSharePieChart data={yearsByShare} topTracksByYear={mostListenedByYear} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

