import { getTopArtists } from "@workspace/core/queries/artists";
import { NextRequest, NextResponse } from "next/server";

const VALID_PERIODS = ["4weeks", "6months", "year", "lifetime"] as const;
type Period = (typeof VALID_PERIODS)[number];

function periodToDateRange(period: Period): { startDate?: Date; endDate?: Date } {
  const now = new Date();

  switch (period) {
    case "4weeks": {
      const startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 28);
      return { startDate, endDate: now };
    }
    case "6months": {
      const startDate = new Date(now);
      startDate.setMonth(startDate.getMonth() - 6);
      return { startDate, endDate: now };
    }
    case "year": {
      const startDate = new Date(now.getFullYear(), 0, 1);
      const endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
      return { startDate, endDate };
    }
    case "lifetime":
      return {};
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get("limit") ?? searchParams.get("top");
    const periodParam = searchParams.get("period") ?? "4weeks";

    const limit = Math.min(Math.max(parseInt(limitParam || "10", 10) || 10, 1), 250);

    if (!VALID_PERIODS.includes(periodParam as Period)) {
      return NextResponse.json(
        { error: `Invalid period. Must be one of: ${VALID_PERIODS.join(", ")}` },
        { status: 400 }
      );
    }

    const { startDate, endDate } = periodToDateRange(periodParam as Period);
    const artists = await getTopArtists({ startDate, endDate, limit });

    return NextResponse.json({
      period: periodParam,
      limit,
      artists
    });
  } catch (error) {
    console.error("Error fetching public top artists:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
