"use client";

import ChartTooltip from "@/components/charts/ChartTooltip";
import ExpandableChartContainer from "@/components/charts/ExpandableChartContainer";
import { formatDuration } from "@/lib/utils/timeUtils";
import { clampInBounds } from "@/lib/utils/tooltipUtils";
import { faChevronLeft, faChevronRight, faMusic } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Link from "next/link";
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";

const DAY_MS = 86_400_000;
/** Fixed canvas width so the day is not compressed; the viewport scrolls horizontally. */
const TIMELINE_WIDTH_PX = 3840;
const LANE_HEIGHT_PX = 52;
const MIN_SEGMENT_PX = 40;

type DayListenRow = {
  id: string;
  durationMS: number;
  playedAt: string;
  trackName: string | null;
  trackIsrc: string | null;
  imageUrl: string | null;
  trackDurationMS: number | null;
  artistNames: string[] | null;
  albumName: string | null;
};

function browserTzOffsetMinutes() {
  return -new Date().getTimezoneOffset();
}

/** Same local calendar day convention as `/api/listens/recent`. */
function localCalendarDateString(now: Date, tzOffsetMinutes: number) {
  const shifted = new Date(now.getTime() + tzOffsetMinutes * 60_000);
  return new Date(Date.UTC(shifted.getUTCFullYear(), shifted.getUTCMonth(), shifted.getUTCDate()))
    .toISOString()
    .slice(0, 10);
}

function addCalendarDaysYmd(ymd: string, delta: number): string {
  const [y, m, d] = ymd.split("-").map(Number);
  const t = Date.UTC(y!, m! - 1, d! + delta);
  const dt = new Date(t);
  const yy = dt.getUTCFullYear();
  const mm = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(dt.getUTCDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

function getDayUtcBoundsMs(dateStr: string, tzOffsetMinutes: number) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dayStartUtcMs = Date.UTC(y!, m! - 1, d!, 0, 0, 0, 0);
  const dayEndUtcMs = Date.UTC(y!, m! - 1, d! + 1, 0, 0, 0, 0);
  const offsetMs = tzOffsetMinutes * 60_000;
  return {
    startMs: dayStartUtcMs - offsetMs,
    endMs: dayEndUtcMs - offsetMs
  };
}

function assignLanes(
  listens: DayListenRow[],
  dayStartMs: number,
  dayEndMs: number,
  timelineWidthPx: number
): {
  listen: DayListenRow;
  lane: number;
  startMs: number;
  endMs: number;
  leftPx: number;
  widthPx: number;
}[] {
  const sorted = [...listens].sort((a, b) => new Date(a.playedAt).getTime() - new Date(b.playedAt).getTime());
  const laneEnds: number[] = [];

  return sorted.map((listen) => {
    const playedAtMs = new Date(listen.playedAt).getTime();
    const rawEnd = playedAtMs + listen.durationMS;
    const startMs = Math.max(playedAtMs, dayStartMs);
    const endMs = Math.min(rawEnd, dayEndMs);
    const safeEnd = Math.max(endMs, startMs + 1);

    let lane = 0;
    while (lane < laneEnds.length && laneEnds[lane]! > startMs) {
      lane++;
    }
    if (lane === laneEnds.length) {
      laneEnds.push(safeEnd);
    } else {
      laneEnds[lane] = safeEnd;
    }

    const leftPx = ((startMs - dayStartMs) / DAY_MS) * timelineWidthPx;
    const widthPx = Math.max(((safeEnd - startMs) / DAY_MS) * timelineWidthPx, MIN_SEGMENT_PX);

    return { listen, lane, startMs, endMs: safeEnd, leftPx, widthPx };
  });
}

function formatPlayedAtAmPm(isoPlayedAt: string) {
  const d = new Date(isoPlayedAt);
  const hour = d.getHours();
  const minute = d.getMinutes();
  const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  const ampm = hour < 12 ? "AM" : "PM";
  return `${h12}:${minute.toString().padStart(2, "0")} ${ampm}`;
}

function joinArtistNames(listen: DayListenRow) {
  return listen.artistNames?.filter(Boolean).join(", ") ?? "";
}

async function fetchDayListens(date: string, tzOffsetMinutes: number) {
  const params = new URLSearchParams({ date, tzOffsetMinutes: String(tzOffsetMinutes) });
  const res = await axios.get<{ listens: DayListenRow[] }>(`/api/listens/day?${params.toString()}`, {
    headers: { "Cache-Control": "no-store" }
  });
  return res.data.listens;
}

export default function ListeningDayTimeline() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const tzOffsetMinutes = useMemo(() => browserTzOffsetMinutes(), []);
  const todayYmd = useMemo(() => localCalendarDateString(new Date(), tzOffsetMinutes), [tzOffsetMinutes]);

  const [selectedDate, setSelectedDate] = useState(todayYmd);
  const [hoveredListen, setHoveredListen] = useState<DayListenRow | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const lastPointerClientRef = useRef({ x: 0, y: 0 });

  const { data: listens = [], isFetching } = useQuery({
    queryKey: ["listens-calendar-day", selectedDate, tzOffsetMinutes],
    queryFn: () => fetchDayListens(selectedDate, tzOffsetMinutes)
  });

  const { startMs: dayStartMs, endMs: dayEndMs } = useMemo(
    () => getDayUtcBoundsMs(selectedDate, tzOffsetMinutes),
    [selectedDate, tzOffsetMinutes]
  );

  const segments = useMemo(
    () => assignLanes(listens, dayStartMs, dayEndMs, TIMELINE_WIDTH_PX),
    [listens, dayStartMs, dayEndMs]
  );

  const laneCount = useMemo(() => segments.reduce((max, s) => Math.max(max, s.lane + 1), 0), [segments]);

  const formattedHeadingDate = useMemo(() => {
    const [y, m, d] = selectedDate.split("-").map(Number);
    const dt = new Date(y!, (m ?? 1) - 1, d);
    return dt.toLocaleDateString(undefined, {
      weekday: "long",
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  }, [selectedDate]);

  const isFutureDay = selectedDate > todayYmd;

  const hourMarks = useMemo(() => {
    return Array.from({ length: 24 }, (_, hour) => {
      const tickMs = dayStartMs + hour * 60 * 60 * 1000;
      const label = new Date(tickMs).toLocaleTimeString(undefined, {
        hour: "numeric",
        minute: undefined
      });
      return { hour, leftPx: (hour / 24) * TIMELINE_WIDTH_PX, label };
    });
  }, [dayStartMs]);

  const updateTooltipPosition = useCallback((clientX: number, clientY: number) => {
    lastPointerClientRef.current = { x: clientX, y: clientY };
    const outer = scrollRef.current;
    const tip = tooltipRef.current;
    if (!outer || !tip) return;

    const outerRect = outer.getBoundingClientRect();
    const tooltipRect = tip.getBoundingClientRect();

    const x = clientX - outerRect.left + 12;
    const y = clientY - outerRect.top + 12;

    const clamped = clampInBounds(x, y, tooltipRect, outerRect);
    setTooltipPosition(clamped);
  }, []);

  useLayoutEffect(() => {
    if (!hoveredListen) return;
    const { x, y } = lastPointerClientRef.current;
    updateTooltipPosition(x, y);
  }, [hoveredListen, updateTooltipPosition]);

  const handleTimelineLeave = () => {
    setHoveredListen(null);
  };

  return (
    <ExpandableChartContainer title="Day timeline" chartHeight="min-h-[340px]">
      <div className={`flex h-full min-h-[300px] flex-col gap-4 ${isFetching ? "opacity-70" : ""}`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-gray-400">{formattedHeadingDate}</p>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedDate((d) => addCalendarDaysYmd(d, -1))}
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg bg-white/10 text-white transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Previous day"
            >
              <FontAwesomeIcon icon={faChevronLeft} className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setSelectedDate((d) => addCalendarDaysYmd(d, 1))}
              disabled={isFutureDay}
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg bg-white/10 text-white transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Next day"
            >
              <FontAwesomeIcon icon={faChevronRight} className="h-4 w-4" />
            </button>
            <label className="flex items-center gap-2 text-sm text-gray-300">
              <span className="hidden sm:inline">Go to</span>
              <input
                type="date"
                value={selectedDate}
                max={todayYmd}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v) setSelectedDate(v);
                }}
                className="cursor-pointer rounded-lg border border-white/10 bg-black/30 px-2 py-1.5 text-white outline-none focus:border-purple-400/60 disabled:cursor-not-allowed"
              />
            </label>
            <button
              type="button"
              onClick={() => setSelectedDate(todayYmd)}
              className="cursor-pointer rounded-lg bg-purple-600/80 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-40"
              disabled={selectedDate === todayYmd}
            >
              Today
            </button>
          </div>
        </div>

        <div className="relative flex min-h-[240px] min-w-0 flex-col rounded-xl border border-white/10 bg-black/20">
          <div
            ref={scrollRef}
            className="relative min-h-[220px] min-w-0 overflow-x-auto overflow-y-hidden pb-2 pt-1"
            onMouseLeave={handleTimelineLeave}
          >
            <div className="relative shrink-0 px-3" style={{ width: TIMELINE_WIDTH_PX }}>
              <div className="relative h-9 border-b border-white/10">
                {hourMarks.map(({ hour, leftPx, label }) => (
                  <div
                    key={hour}
                    className="absolute top-0 flex -translate-x-1/2 flex-col items-center text-[11px] text-gray-400"
                    style={{ left: leftPx }}
                  >
                    <span className="mb-1 h-2 w-px bg-white/20" />
                    {hour % 3 === 0 ? <span className="text-nowrap">{label}</span> : null}
                  </div>
                ))}
              </div>

              <div
                className="relative mt-3"
                style={{ height: Math.max(laneCount, 1) * LANE_HEIGHT_PX + 8 }}
              >
                {segments.map(({ listen, lane, leftPx, widthPx }) => {
                  const href =
                    listen.trackIsrc != null ? `/dashboard/track/${listen.trackIsrc}` : `/dashboard/search`;

                  return (
                    <Link
                      key={listen.id}
                      href={href}
                      className="absolute cursor-pointer overflow-hidden rounded-md border border-purple-500/45 shadow-sm backdrop-blur-sm transition-colors hover:border-purple-300/70 hover:ring-2 hover:ring-purple-400/40"
                      style={{
                        left: leftPx,
                        width: widthPx,
                        top: lane * LANE_HEIGHT_PX + 4,
                        height: LANE_HEIGHT_PX - 8
                      }}
                      onMouseEnter={(e) => {
                        setHoveredListen(listen);
                        updateTooltipPosition(e.clientX, e.clientY);
                      }}
                      onMouseMove={(e) => {
                        setHoveredListen(listen);
                        updateTooltipPosition(e.clientX, e.clientY);
                      }}
                    >
                      <div className="relative size-full bg-purple-950/40">
                        {listen.imageUrl ? (
                          <img
                            src={listen.imageUrl}
                            alt=""
                            className="size-full object-cover"
                            draggable={false}
                          />
                        ) : (
                          <div className="flex size-full items-center justify-center bg-white/10 text-purple-200/90">
                            <FontAwesomeIcon icon={faMusic} className="h-5 w-5" />
                          </div>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {hoveredListen ? (
              <div
                ref={tooltipRef}
                className="pointer-events-none absolute z-50"
                style={{ left: tooltipPosition.x, top: tooltipPosition.y }}
              >
                <ChartTooltip>
                  <p className="text-sm font-medium text-gray-300">{formatPlayedAtAmPm(hoveredListen.playedAt)}</p>
                  <p className="text-white">
                    <span className="text-gray-400">Track: </span>
                    {hoveredListen.trackName ?? "Unknown track"}
                  </p>
                  {joinArtistNames(hoveredListen) ? (
                    <p className="text-white">
                      <span className="text-gray-400">Artist: </span>
                      {joinArtistNames(hoveredListen)}
                    </p>
                  ) : null}
                  {hoveredListen.albumName ? (
                    <p className="text-white">
                      <span className="text-gray-400">Album: </span>
                      {hoveredListen.albumName}
                    </p>
                  ) : null}
                  <p className="text-white">
                    <span className="text-gray-400">Listens: </span>1
                  </p>
                  <p className="text-white">
                    <span className="text-gray-400">Duration: </span>
                    {formatDuration(hoveredListen.durationMS)}
                  </p>
                </ChartTooltip>
              </div>
            ) : null}
          </div>

          {listens.length === 0 && !isFetching ? (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-4 text-center text-sm text-gray-500">
              No listens recorded for this day.
            </div>
          ) : null}
        </div>
      </div>
    </ExpandableChartContainer>
  );
}
