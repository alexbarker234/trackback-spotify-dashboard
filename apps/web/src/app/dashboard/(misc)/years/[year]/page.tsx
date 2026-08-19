import TrackCard from "@/components/cards/TrackCard";
import Loading from "@/components/Loading";
import { cn } from "@/lib/utils/cn";
import { faArrowLeft, faArrowRight, IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getTopTracksByReleaseYear } from "@workspace/core";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

function parseYear(yearParam: string, maxYear: number): number | null {
  if (!/^\d{4}$/.test(yearParam)) return null;
  const year = Number(yearParam);
  if (!Number.isInteger(year) || year < 1000 || year > maxYear) return null;
  return year;
}

function YearNavButton({
  href,
  disabled,
  icon,
  iconPosition,
  text
}: {
  href: string;
  disabled: boolean;
  icon: IconDefinition;
  iconPosition: "left" | "right";
  text: string;
}) {
  const className =
    "flex w-28 items-center justify-center rounded-xl bg-white/5 px-3 py-2 text-sm font-medium text-gray-300 backdrop-blur-sm transition-all";

  const content = (
    <>
      {iconPosition === "right" && <span>{text}</span>}
      <FontAwesomeIcon icon={icon} className={cn(iconPosition === "left" ? "mr-2" : "ml-2")} />
      {iconPosition === "left" && <span>{text}</span>}
    </>
  );

  if (disabled) {
    return (
      <span className={`${className} cursor-not-allowed opacity-50`}>{content}</span>
    );
  }

  return (
    <Link href={href} className={`${className} cursor-pointer hover:bg-white/10`}>
      {content}
    </Link>
  );
}

function YearNavigation({ year, maxYear }: { year: number; maxYear: number }) {
  const previousYear = year - 1;
  const nextYear = year + 1;
  const canGoPrevious = previousYear >= 1000;
  const canGoNext = nextYear <= maxYear;

  return (
    <div className="flex items-center gap-2">
      <YearNavButton
        href={`/dashboard/years/${previousYear}`}
        disabled={!canGoPrevious}
        icon={faArrowLeft}
        iconPosition="left"
        text="Previous"
      />
      <span className="mx-2 text-sm text-gray-400">{year}</span>
      <YearNavButton
        href={`/dashboard/years/${nextYear}`}
        disabled={!canGoNext}
        icon={faArrowRight}
        iconPosition="right"
        text="Next"
      />
    </div>
  );
}

async function YearTracksSection({ year }: { year: number }) {
  const tracks = await getTopTracksByReleaseYear(year, 100);
  const totalListens = tracks.reduce((sum, track) => sum + Number(track.listenCount), 0);

  if (tracks.length === 0) {
    return <div className="text-gray-400">No tracks found for {year}.</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-gray-400">
        {tracks.length.toLocaleString()} tracks • {totalListens.toLocaleString()} streams
      </p>
      <div className="space-y-2">
        {tracks.map((track, index) => (
          <TrackCard key={track.trackIsrc} track={track} rank={index + 1} />
        ))}
      </div>
    </div>
  );
}

export default async function ReleaseYearPage({
  params
}: {
  params: Promise<{ year: string }>;
}) {
  const { year: yearParam } = await params;
  const currentYear = new Date().getFullYear();
  const year = parseYear(yearParam, currentYear);
  if (year === null) notFound();

  return (
    <div className="flex-1 px-2 py-4 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-6 text-4xl font-bold text-white">Top tracks released in {year}</h1>
        <div className="mb-6 flex flex-col gap-3">
          <p className="text-sm text-gray-400">
            Your most-played tracks released in {year}.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              <Link
                href="/dashboard/years/list"
                className="w-fit cursor-pointer rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-100 transition-colors hover:bg-white/10"
              >
                All years
              </Link>
              <Link
                href="/dashboard/years/analysis"
                className="w-fit cursor-pointer rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-100 transition-colors hover:bg-white/10"
              >
                View analysis
              </Link>
            </div>
            <YearNavigation year={year} maxYear={currentYear} />
          </div>
        </div>

        <Suspense
          key={year}
          fallback={
            <div className="flex h-64 items-center justify-center">
              <Loading />
            </div>
          }
        >
          <YearTracksSection year={year} />
        </Suspense>
      </div>
    </div>
  );
}
