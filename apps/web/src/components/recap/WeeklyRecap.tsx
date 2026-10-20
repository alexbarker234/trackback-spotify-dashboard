"use client";

import BackNav from "@/components/BackNav";
import CompactRankListCard from "@/components/cards/CompactRankListCard";
import DayOfWeekStreamChart from "@/components/charts/dashboard/DayOfWeekStreamChart";
import HourlyListensRadialChart from "@/components/charts/dashboard/HourlyListensRadialChart";
import Loading from "@/components/Loading";
import MetricCard from "@/components/statsGrid/MetricCard";
import { useWeeklyRecap } from "@/hooks/useWeeklyRecap";
import { usePageTitle } from "@/lib/contexts/PageTitleContext";
import {
  addWeeks,
  formatWeekOf,
  formatWeekParam,
  formatWeekRange,
  getLatestCompletedWeekStart,
  getMonday,
  getWeekEnd,
  parseWeekParam
} from "@/lib/recap/week";
import { formatDuration } from "@/lib/utils/timeUtils";
import {
  faArrowLeft,
  faArrowRight,
  faCaretDown,
  faCaretUp
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { Ranked, WeeklyRecap as WeeklyRecapData } from "@workspace/core/queries/recap";
import type { TopAlbum, TopArtist, TopTrack } from "@workspace/core/types";
import Image from "next/image";
import Link from "next/link";
import { parseAsString, useQueryState } from "nuqs";
import { useEffect, useMemo, useState } from "react";
import PercentChange from "./PercentChange";

type RecapListItem = {
  id: string;
  name: string;
  imageUrl: string | null;
  subtitle?: string;
  streams: number;
  durationMs: number;
  href: string;
  previousRank: number | null;
  previousListenCount: number;
};

type WeeklyRecapProps = {
  userName: string;
  userImage: string | null;
  isStandalone?: boolean;
};

function topItemsHref(type: "artists" | "tracks" | "albums", start: Date, end: Date) {
  const params = new URLSearchParams({
    type,
    viewType: "list",
    dateRange: "custom",
    customStartDate: String(start.getTime()),
    customEndDate: String(end.getTime())
  });
  return `/dashboard/top?${params.toString()}`;
}

function statsHref(start: Date, end: Date) {
  const params = new URLSearchParams({
    dateRange: "custom",
    customStartDate: String(start.getTime()),
    customEndDate: String(end.getTime())
  });
  return `/dashboard/stats?${params.toString()}`;
}

function toArtistItems(artists: Ranked<TopArtist>[]): RecapListItem[] {
  return artists.map((artist) => ({
    id: artist.artistId,
    name: artist.artistName,
    imageUrl: artist.artistImageUrl,
    streams: artist.listenCount,
    durationMs: artist.totalDuration,
    href: `/dashboard/artist/${artist.artistId}`,
    previousRank: artist.previousRank,
    previousListenCount: artist.previousListenCount
  }));
}

function toTrackItems(tracks: Ranked<TopTrack>[]): RecapListItem[] {
  return tracks.map((track) => ({
    id: track.trackIsrc,
    name: track.trackName,
    imageUrl: track.imageUrl,
    subtitle: track.artists.map((artist) => artist.artistName).join(", "),
    streams: track.listenCount,
    durationMs: track.totalDuration,
    href: `/dashboard/track/${track.trackIsrc}`,
    previousRank: track.previousRank,
    previousListenCount: track.previousListenCount
  }));
}

function toAlbumItems(albums: Ranked<TopAlbum>[]): RecapListItem[] {
  return albums.map((album) => ({
    id: album.albumId,
    name: album.albumName,
    imageUrl: album.albumImageUrl,
    subtitle: album.artistNames?.join(", "),
    streams: album.listenCount,
    durationMs: album.totalDuration,
    href: `/dashboard/album/${album.albumId}`,
    previousRank: album.previousRank,
    previousListenCount: album.previousListenCount
  }));
}

export default function WeeklyRecap({
  userName,
  userImage,
  isStandalone = false
}: WeeklyRecapProps) {
  const [weekParam, setWeekParam] = useQueryState("week", parseAsString);
  const latestWeekStart = useMemo(() => getLatestCompletedWeekStart(), []);
  const weekStart = useMemo(() => parseWeekParam(weekParam), [weekParam]);
  const weekEnd = useMemo(() => getWeekEnd(weekStart), [weekStart]);
  const compareStart = useMemo(() => addWeeks(weekStart, -1), [weekStart]);
  const compareEnd = useMemo(() => getWeekEnd(compareStart), [compareStart]);
  const weekOfLabel = formatWeekOf(weekStart);
  const weekRangeLabel = formatWeekRange(weekStart);
  const { setTitle, setSubheader } = usePageTitle();

  const { data, isLoading, error } = useWeeklyRecap({
    startDate: weekStart,
    endDate: weekEnd,
    compareStartDate: compareStart,
    compareEndDate: compareEnd
  });

  useEffect(() => {
    setTitle("Weekly recap");
    setSubheader(weekRangeLabel);
  }, [setTitle, setSubheader, weekRangeLabel]);

  const [knownEarliestListen, setKnownEarliestListen] = useState<string | null>(null);

  useEffect(() => {
    if (data?.earliestListen) setKnownEarliestListen(data.earliestListen);
  }, [data?.earliestListen]);

  useEffect(() => {
    if (!weekParam) return;
    const resolved = formatWeekParam(weekStart);
    if (weekParam === resolved) return;
    void setWeekParam(weekStart.getTime() === latestWeekStart.getTime() ? null : resolved);
  }, [weekParam, weekStart, latestWeekStart, setWeekParam]);

  const earliestMonday = knownEarliestListen ? getMonday(new Date(knownEarliestListen)) : null;
  const canGoPrevious = earliestMonday != null && weekStart.getTime() > earliestMonday.getTime();
  const canGoNext = weekStart.getTime() < latestWeekStart.getTime();

  const goToWeek = (next: Date) => {
    if (next.getTime() === latestWeekStart.getTime()) {
      void setWeekParam(null);
      return;
    }
    void setWeekParam(formatWeekParam(next));
  };

  return (
    <div className="flex-1 px-2 py-4 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        {!isStandalone && (
          <>
            <BackNav />
            <div>
              <h1 className="text-4xl font-bold text-white">Weekly recap</h1>
              <p className="text-sm text-gray-400">{weekRangeLabel}</p>
            </div>
          </>
        )}

        {/* Week navigation */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            {userImage && (
              <Image
                src={userImage}
                alt={userName}
                width={64}
                height={64}
                className="h-16 w-16 rounded-full"
              />
            )}
            <div>
              <p className="text-xl font-bold text-white">{userName}</p>
              <p className="text-sm font-medium tracking-wide text-zinc-400 uppercase">
                {weekOfLabel}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => goToWeek(addWeeks(weekStart, -1))}
              disabled={!canGoPrevious}
              className="flex w-28 cursor-pointer items-center justify-center rounded-xl bg-white/5 px-3 py-2 text-sm font-medium text-gray-300 backdrop-blur-sm transition-all enabled:hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
              Previous
            </button>
            <button
              type="button"
              onClick={() => goToWeek(addWeeks(weekStart, 1))}
              disabled={!canGoNext}
              className="flex w-28 cursor-pointer items-center justify-center rounded-xl bg-white/5 px-3 py-2 text-sm font-medium text-gray-300 backdrop-blur-sm transition-all enabled:hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
              <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loading />
          </div>
        ) : error ? (
          <div className="flex h-64 items-center justify-center">
            <div className="text-red-400">Error loading recap. Please try again.</div>
          </div>
        ) : data ? (
          <RecapContent
            data={data}
            weekStart={weekStart}
            weekEnd={weekEnd}
            statsHref={statsHref(weekStart, weekEnd)}
          />
        ) : (
          <div className="flex h-64 items-center justify-center">
            <div className="text-gray-400">No recap available for this week</div>
          </div>
        )}
      </div>
    </div>
  );
}

function RecapContent({
  data,
  weekStart,
  weekEnd,
  statsHref
}: {
  data: WeeklyRecapData;
  weekStart: Date;
  weekEnd: Date;
  statsHref: string;
}) {
  const hasListening = data.minutes > 0 || data.uniqueTracks > 0 || data.uniqueArtists > 0;
  const hasDayChart = data.dayOfWeek.some((day) => day.streamCount > 0);
  const hasHourlyChart = data.hourly.some((hour) => hour.listenCount > 0);

  return (
    <div className="flex flex-col gap-8">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-1.5 sm:gap-4 lg:gap-6">
        <MetricCard
          title="Minutes"
          mainText={data.minutes}
          secondaryText="listened"
          gradientFrom="from-pink-500/10"
          gradientTo="to-rose-500/10"
          blurColor="bg-pink-500/20"
          textColor="text-pink-400"
          href={statsHref}
          compact
        />
        <MetricCard
          title="Artists"
          mainText={data.uniqueArtists}
          secondaryText="different artists"
          gradientFrom="from-yellow-500/10"
          gradientTo="to-orange-500/10"
          blurColor="bg-yellow-500/20"
          textColor="text-yellow-400"
          href={statsHref}
          compact
        />
        <MetricCard
          title="Tracks"
          mainText={data.uniqueTracks}
          secondaryText="different tracks"
          gradientFrom="from-purple-500/10"
          gradientTo="to-pink-500/10"
          blurColor="bg-purple-500/20"
          textColor="text-purple-400"
          href={statsHref}
          compact
        />
      </div>

      {!hasListening && <p className="text-gray-400">No listening this week.</p>}

      <RankedSection
        title="Top artists"
        href={topItemsHref("artists", weekStart, weekEnd)}
        items={toArtistItems(data.topArtists)}
        emptyLabel="No artists this week."
      />
      <RankedSection
        title="Top tracks"
        href={topItemsHref("tracks", weekStart, weekEnd)}
        items={toTrackItems(data.topTracks)}
        emptyLabel="No tracks this week."
      />
      <RankedSection
        title="Top albums"
        href={topItemsHref("albums", weekStart, weekEnd)}
        items={toAlbumItems(data.topAlbums)}
        emptyLabel="No albums this week."
      />

      {(hasDayChart || hasHourlyChart) && (
        <div
          className={
            hasDayChart && hasHourlyChart
              ? "grid grid-cols-1 gap-6 lg:grid-cols-2"
              : "grid grid-cols-1"
          }
        >
          {hasDayChart && (
            <DayOfWeekStreamChart data={data.dayOfWeek} title="Your week" chartHeight="h-80" />
          )}
          {hasHourlyChart && (
            <HourlyListensRadialChart data={data.hourly} title="Hour by hour" chartHeight="h-80" />
          )}
        </div>
      )}

      <VsLastWeek
        minutes={data.minutes}
        artists={data.uniqueArtists}
        tracks={data.uniqueTracks}
        compareMinutes={data.compareMinutes}
        compareArtists={data.compareUniqueArtists}
        compareTracks={data.compareUniqueTracks}
      />
    </div>
  );
}

function RankMovement({
  currentRank,
  previousRank
}: {
  currentRank: number;
  previousRank: number | null;
}) {
  if (previousRank == null) {
    return <span className="text-[11px] font-semibold text-emerald-400">New</span>;
  }

  const places = previousRank - currentRank;
  if (places === 0) {
    return <span className="text-[11px] font-semibold text-zinc-500">–</span>;
  }

  const movedUp = places > 0;
  return (
    <span
      className={`inline-flex items-center text-[11px] font-semibold ${
        movedUp ? "text-emerald-400" : "text-red-400"
      }`}
    >
      <FontAwesomeIcon icon={movedUp ? faCaretUp : faCaretDown} className="h-3 w-3" />
      {Math.abs(places)}
    </span>
  );
}

function RankedSection({
  title,
  href,
  items,
  emptyLabel
}: {
  title: string;
  href: string;
  items: RecapListItem[];
  emptyLabel: string;
}) {
  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        {items.length > 0 && (
          <Link href={href} className="text-sm text-zinc-400 transition-colors hover:text-zinc-300">
            View more
          </Link>
        )}
      </div>
      {items.length === 0 ? (
        <p className="text-gray-400">{emptyLabel}</p>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((item, index) => (
            <CompactRankListCard
              key={item.id}
              href={item.href}
              imageUrl={item.imageUrl}
              name={item.name}
              subtitle={item.subtitle}
              rank={index + 1}
              primaryText={`${item.streams.toLocaleString()} streams`}
              secondaryText={formatDuration(item.durationMs)}
              rankAccessory={
                <RankMovement currentRank={index + 1} previousRank={item.previousRank} />
              }
              statsAccessory={
                <PercentChange current={item.streams} previous={item.previousListenCount} />
              }
            />
          ))}
        </div>
      )}
    </section>
  );
}

function VsLastWeek({
  minutes,
  artists,
  tracks,
  compareMinutes,
  compareArtists,
  compareTracks
}: {
  minutes: number;
  artists: number;
  tracks: number;
  compareMinutes: number;
  compareArtists: number;
  compareTracks: number;
}) {
  const rows = [
    { label: "Minutes", current: minutes, previous: compareMinutes },
    { label: "Artists", current: artists, previous: compareArtists },
    { label: "Tracks", current: tracks, previous: compareTracks }
  ];

  return (
    <section className="rounded-2xl bg-white/5 p-6 backdrop-blur-sm">
      <h2 className="mb-4 text-lg font-semibold text-white">Vs last week</h2>
      <div className="flex flex-col gap-4">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between gap-4 border-b border-white/10 pb-4 last:border-b-0 last:pb-0"
          >
            <div>
              <p className="text-sm text-zinc-400">{row.label}</p>
              <p className="text-2xl font-bold text-white">{row.current.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <PercentChange current={row.current} previous={row.previous} />
              <p className="text-xs text-zinc-500">was {row.previous.toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
