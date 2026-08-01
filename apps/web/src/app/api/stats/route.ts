import { auth } from "@/lib/auth";
import {
  getCumulativeStreamData,
  getDailyStreamData,
  getDayOfWeekStreamData,
  getHourlyListenData,
  getMonthlyStreamData,
  getPeriodListenStats
} from "@workspace/core/queries/listens";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");

    const startDate = startDateParam ? new Date(startDateParam) : undefined;
    const endDate = endDateParam ? new Date(endDateParam) : undefined;

    if (startDateParam && Number.isNaN(startDate!.getTime())) {
      return NextResponse.json({ error: "Invalid startDate" }, { status: 400 });
    }

    if (endDateParam && Number.isNaN(endDate!.getTime())) {
      return NextResponse.json({ error: "Invalid endDate" }, { status: 400 });
    }

    const dateOptions = { startDate, endDate };

    const [summary, daily, cumulative, monthly, dayOfWeek, hourly] = await Promise.all([
      getPeriodListenStats(dateOptions),
      getDailyStreamData(dateOptions),
      getCumulativeStreamData(dateOptions),
      getMonthlyStreamData(dateOptions),
      getDayOfWeekStreamData(dateOptions),
      getHourlyListenData(dateOptions)
    ]);

    return NextResponse.json({
      summary,
      daily,
      cumulative,
      monthly,
      dayOfWeek,
      hourly
    });
  } catch (error) {
    console.error("Stats API error:", error);
    return NextResponse.json({ error: "Failed to fetch stats data" }, { status: 500 });
  }
}
