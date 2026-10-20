import { auth } from "@/lib/auth";
import { getWeeklyRecap } from "@workspace/core/queries/recap";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

function parseDate(value: string | null): Date | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const startDate = parseDate(searchParams.get("startDate"));
    const endDate = parseDate(searchParams.get("endDate"));
    const compareStartDate = parseDate(searchParams.get("compareStartDate"));
    const compareEndDate = parseDate(searchParams.get("compareEndDate"));
    const tzOffsetParam = searchParams.get("tzOffsetMinutes");
    const tzOffsetMinutes = tzOffsetParam ? Number(tzOffsetParam) : 0;

    if (!startDate || !endDate || !compareStartDate || !compareEndDate) {
      return NextResponse.json({ error: "Invalid date range" }, { status: 400 });
    }

    if (!Number.isFinite(tzOffsetMinutes) || Math.abs(tzOffsetMinutes) > 16 * 60) {
      return NextResponse.json({ error: "Invalid tzOffsetMinutes" }, { status: 400 });
    }

    const recap = await getWeeklyRecap({
      startDate,
      endDate,
      compareStartDate,
      compareEndDate,
      tzOffsetMinutes
    });

    return NextResponse.json(recap);
  } catch (error) {
    console.error("Recap API error:", error);
    return NextResponse.json({ error: "Failed to fetch recap" }, { status: 500 });
  }
}
