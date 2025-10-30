"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import axios from "axios";

type RecentListen = {
  id: string;
  durationMS: number;
  playedAt: string;
  trackName: string;
  trackIsrc: string;
  imageUrl: string | null;
  trackDurationMS: number;
  artistNames: string[];
  albumName: string | null;
};

type DayGroup = { date: string; items: RecentListen[] };
type DayApiResponse = { days: DayGroup[]; nextCursor: string | null };

async function fetchRecentListensByDays({
  cursor,
  days = 7,
  artistId,
  albumId,
  trackIsrc
}: {
  cursor?: string | null;
  days?: number;
  artistId?: string;
  albumId?: string;
  trackIsrc?: string;
}) {
  const params = new URLSearchParams();
  params.set("days", String(days));
  params.set("tzOffsetMinutes", String(new Date().getTimezoneOffset() * -1));
  if (artistId) params.set("artistId", artistId);
  if (albumId) params.set("albumId", albumId);
  if (trackIsrc) params.set("trackIsrc", trackIsrc);
  if (cursor) params.set("cursor", cursor);
  try {
    const res = await axios.get<DayApiResponse>(`/api/listens/recent?${params.toString()}`, {
      headers: { "Cache-Control": "no-store" }
    });
    return res.data;
  } catch {
    throw new Error("Failed to fetch recent listens");
  }
}

export function useRecentListensInfinite(
  daysPerPage = 7,
  filters?: { artistId?: string; albumId?: string; trackIsrc?: string }
) {
  return useInfiniteQuery<DayApiResponse, Error>({
    queryKey: [
      "recent-listens-by-day",
      daysPerPage,
      filters?.artistId,
      filters?.albumId,
      filters?.trackIsrc
    ],
    queryFn: ({ pageParam }) =>
      fetchRecentListensByDays({
        cursor: pageParam as string | undefined,
        days: daysPerPage,
        ...filters
      }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined
  });
}
