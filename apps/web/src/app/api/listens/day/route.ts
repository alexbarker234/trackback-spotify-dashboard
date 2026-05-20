import { getListensForCalendarDay } from "@workspace/core/queries/listens";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date")?.trim() ?? "";
  const tzOffsetParam = searchParams.get("tzOffsetMinutes");
  const tzOffsetMinutes = tzOffsetParam !== null ? Number(tzOffsetParam) : -new Date().getTimezoneOffset();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Invalid date (expected YYYY-MM-DD)" }, { status: 400 });
  }

  const listens = await getListensForCalendarDay({
    date,
    tzOffsetMinutes: Number.isFinite(tzOffsetMinutes) ? tzOffsetMinutes : 0
  });

  return NextResponse.json({
    listens: listens.map((row) => ({
      ...row,
      playedAt: row.playedAt.toISOString()
    }))
  });
}
