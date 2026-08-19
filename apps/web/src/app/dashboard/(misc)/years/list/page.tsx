import TrackCard from "@/components/cards/TrackCard";
import Loading from "@/components/Loading";
import { getMostListenedTracksByReleaseYear } from "@workspace/core";
import Link from "next/link";
import type { ReactNode } from "react";

export const dynamic = "force-dynamic";

function NoTopTrackForYear({ year }: { year: number }) {
  return (
    <Link
      href={`/dashboard/years/${year}`}
      className="block rounded-2xl bg-white/5 p-4 backdrop-blur-sm transition-all hover:bg-white/10"
    >
      <div className="flex items-center gap-4">
        <span className="w-16 text-2xl font-bold text-gray-400">{year}</span>
        <div>
          <p className="text-white">No top track for this year</p>
          <p className="text-sm text-gray-400">You didn&apos;t listen to tracks released in {year}.</p>
        </div>
      </div>
    </Link>
  );
}

export default async function ReleaseYearsMostListenedPage() {
  const data = await getMostListenedTracksByReleaseYear();

  return (
    <div className="flex-1 px-2 py-4 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-6 text-4xl font-bold text-white">Most listened by release year</h1>
        <div className="mb-6 flex flex-col gap-3">
          <p className="text-sm text-gray-400">
            For each release year, this shows your most-played track.
            If you didn’t listen to anything from a given year, that year is shown with no top track.
          </p>
          <Link
            href="/dashboard/years/analysis"
            className="w-fit cursor-pointer rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-100 transition-colors hover:bg-white/10"
          >
            View analysis
          </Link>
        </div>

        {data.length === 0 ? (
          <div className="flex h-64 items-center justify-center">
            <Loading />
          </div>
        ) : (
          <div className="space-y-4">
            {(() => {
              const years = data
                .map((row) => Number(row.year))
                .filter((y) => Number.isFinite(y));
              if (years.length === 0) return null;

              const minYear = Math.min(...years);
              const maxYear = Math.max(...years);
              const rowsByYear = new Map(data.map((row) => [row.year, row]));

              // Create every year between min/max, even if there's no track for it.
              const allYearsDescending = new Array(maxYear - minYear + 1)
                .fill(null)
                .map((_, idx) => maxYear - idx);

              let lastDecade: number | null = null;

              return allYearsDescending.reduce<ReactNode[]>((acc, year) => {
                const decade = Math.floor(year / 10) * 10;

                if (lastDecade !== decade) {
                  lastDecade = decade;
                  acc.push(
                    <div
                      key={`decade-${decade}`}
                      data-decade={decade}
                      className="mt-6 mb-2 text-sm font-semibold tracking-wide text-gray-300"
                    >
                      {decade}s
                    </div>
                  );
                }

                const row = rowsByYear.get(String(year));
                if (row) {
                  acc.push(
                    <TrackCard
                      key={row.trackIsrc}
                      track={row}
                      rankLabel={String(year)}
                      href={`/dashboard/years/${year}`}
                    />
                  );
                  return acc;
                }

                // Placeholder when you didn't listen to any music released in this year.
                acc.push(
                  <div key={year}>
                    <NoTopTrackForYear year={year} />
                  </div>
                );

                return acc;
              }, []);
            })()}
          </div>
        )}
      </div>
    </div>
  );
}

