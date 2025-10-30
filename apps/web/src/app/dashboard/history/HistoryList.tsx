"use client";

import { useEffect, useRef } from "react";
import { DayDisclosure } from "./DayDisclosure";

type Listen = {
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

type DayGroup = { date: string; items: Listen[] };

export function HistoryList({
  pages,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage
}: {
  pages: Array<{ days: DayGroup[]; nextCursor: string | null }> | undefined;
  fetchNextPage: () => void;
  hasNextPage: boolean | undefined;
  isFetchingNextPage: boolean;
}) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!hasNextPage) return;
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      const first = entries[0];
      if (first && first.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    });
    io.observe(el);
    return () => io.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  return (
    <div className="flex flex-col gap-4">
      {pages
        ?.flatMap((p) => p.days)
        .map((g) => <DayDisclosure key={g.date} date={new Date(g.date)} listens={g.items} />)}
      <div ref={sentinelRef} className="h-10 w-full" />
    </div>
  );
}
