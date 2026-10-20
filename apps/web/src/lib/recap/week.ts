import { MONTH_NAMES_SHORT } from "@/lib/constants";
import { formatDateShort } from "@/lib/utils/timeUtils";

const WEEK_PARAM = /^\d{4}-\d{2}-\d{2}$/;

export function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function getMonday(date: Date): Date {
  const start = startOfLocalDay(date);
  const day = start.getDay();
  const delta = day === 0 ? -6 : 1 - day;
  start.setDate(start.getDate() + delta);
  return start;
}

/** Monday of the most recent Monday–Sunday week that has fully ended. */
export function getLatestCompletedWeekStart(now = new Date()): Date {
  const thisMonday = getMonday(now);
  const latest = new Date(thisMonday);
  latest.setDate(latest.getDate() - 7);
  return latest;
}

export function getWeekEnd(weekStart: Date): Date {
  const end = new Date(weekStart);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
}

export function addWeeks(weekStart: Date, weeks: number): Date {
  const next = new Date(weekStart);
  next.setDate(next.getDate() + weeks * 7);
  return next;
}

export function formatWeekParam(weekStart: Date): string {
  const year = weekStart.getFullYear();
  const month = String(weekStart.getMonth() + 1).padStart(2, "0");
  const day = String(weekStart.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseWeekParam(value: string | null, now = new Date()): Date {
  const latest = getLatestCompletedWeekStart(now);
  if (!value || !WEEK_PARAM.test(value)) return latest;

  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(year!, month! - 1, day!);
  if (Number.isNaN(parsed.getTime())) return latest;

  const monday = getMonday(parsed);
  if (monday.getTime() > latest.getTime()) return latest;
  return monday;
}

export function formatWeekOf(weekStart: Date): string {
  const month = MONTH_NAMES_SHORT[weekStart.getMonth()];
  return `Week of ${month} ${weekStart.getDate()}`;
}

export function formatWeekRange(weekStart: Date): string {
  const end = getWeekEnd(weekStart);
  return `${formatDateShort(weekStart.getTime())} – ${formatDateShort(end.getTime())}`;
}
