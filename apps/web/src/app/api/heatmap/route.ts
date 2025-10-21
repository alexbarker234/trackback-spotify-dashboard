import { auth } from "@/lib/auth";
import { getDailyStreamData } from "@workspace/core/queries/listens";
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
    const year = searchParams.get("year");
    const artistId = searchParams.get("artistId");
    const albumId = searchParams.get("albumId");
    const trackIsrc = searchParams.get("trackIsrc");

    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (year) {
      const yearNum = parseInt(year, 10);
      if (isNaN(yearNum) || yearNum < 1900 || yearNum > 2100) {
        return NextResponse.json({ error: "Invalid year" }, { status: 400 });
      }

      startDate = new Date(yearNum, 0, 1); // January 1st
      endDate = new Date(yearNum, 11, 31, 23, 59, 59, 999); // December 31st
    }

    const data = await getDailyStreamData({
      artistId: artistId || undefined,
      albumId: albumId || undefined,
      trackIsrc: trackIsrc || undefined,
      startDate,
      endDate
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("Heatmap API error:", error);
    return NextResponse.json({ error: "Failed to fetch heatmap data" }, { status: 500 });
  }
}
