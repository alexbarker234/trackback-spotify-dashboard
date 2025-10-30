import { getPaginatedListens } from "@workspace/core/queries/listens";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get("cursor");
  const daysParam = searchParams.get("days");
  const days = daysParam ? Math.min(Math.max(parseInt(daysParam, 10) || 0, 1), 31) : 7;
  const tzOffsetParam = searchParams.get("tzOffsetMinutes");
  const tzOffsetMinutes = tzOffsetParam ? Number(tzOffsetParam) : 0; // minutes to add to UTC to get local
  const artistId = searchParams.get("artistId") || undefined;
  const albumId = searchParams.get("albumId") || undefined;
  const trackIsrc = searchParams.get("trackIsrc") || undefined;

  const batchLimit = 2000; // ensures we can cover up to 7 days (hope)
  const { items } = await getPaginatedListens({
    limit: batchLimit,
    cursor,
    artistId,
    albumId,
    trackIsrc
  });

  // Group by LOCAL date string (YYYY-MM-DD) using tzOffsetMinutes
  const byDay = new Map<string, typeof items>();
  for (const it of items) {
    const d = new Date(it.playedAt);
    const shifted = new Date(d.getTime() + tzOffsetMinutes * 60_000);
    const key = new Date(
      Date.UTC(shifted.getUTCFullYear(), shifted.getUTCMonth(), shifted.getUTCDate())
    )
      .toISOString()
      .slice(0, 10);
    const arr = byDay.get(key) || [];
    arr.push(it);
    byDay.set(key, arr);
  }

  // Keep latest N days
  const sortedKeys = Array.from(byDay.keys()).sort((a, b) => (a > b ? -1 : 1));
  const keptKeys = sortedKeys.slice(0, days);
  const daysPayload = keptKeys.map((k) => ({ date: k, items: byDay.get(k)! }));

  // Compute nextCursor: strictly before the earliest kept LOCAL day
  let nextCursor: string | null = null;
  if (keptKeys.length > 0) {
    const earliestDay = keptKeys[keptKeys.length - 1]!; // oldest included
    // earliestDay is YYYY-MM-DD in LOCAL calendar. Convert local start-of-day to UTC instant, then page to records strictly older than that instant
    const [y, m, d] = earliestDay.split("-").map((n) => parseInt(n, 10));
    const localStart = new Date(y!, (m! - 1)!, d!, 0, 0, 0, 0);
    const utcInstant = new Date(localStart.getTime() - tzOffsetMinutes * 60_000);
    nextCursor = utcInstant.toISOString();
  }

  return NextResponse.json({ days: daysPayload, nextCursor });
}
