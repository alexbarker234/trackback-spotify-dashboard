import { auth } from "@/lib/auth";
import { getTopTracksByPeakDayListens } from "@workspace/core/queries/tracks";
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
    const tzOffsetParam = searchParams.get("tzOffsetMinutes");
    const tzOffsetMinutes = tzOffsetParam ? Number(tzOffsetParam) : 0;

    const startDate = startDateParam ? new Date(startDateParam) : undefined;
    const endDate = endDateParam ? new Date(endDateParam) : undefined;

    if (startDateParam && Number.isNaN(startDate!.getTime())) {
      return NextResponse.json({ error: "Invalid startDate" }, { status: 400 });
    }

    if (endDateParam && Number.isNaN(endDate!.getTime())) {
      return NextResponse.json({ error: "Invalid endDate" }, { status: 400 });
    }

    if (!Number.isFinite(tzOffsetMinutes) || Math.abs(tzOffsetMinutes) > 16 * 60) {
      return NextResponse.json({ error: "Invalid tzOffsetMinutes" }, { status: 400 });
    }

    const tracks = await getTopTracksByPeakDayListens({
      startDate,
      endDate,
      limit: 20,
      tzOffsetMinutes
    });

    return NextResponse.json(tracks);
  } catch (error) {
    console.error("Error fetching peak day tracks:", error);
    return NextResponse.json({ error: "Failed to fetch peak day tracks" }, { status: 500 });
  }
}
