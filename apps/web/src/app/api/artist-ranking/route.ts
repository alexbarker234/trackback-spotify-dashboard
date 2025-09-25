import { albumTrack, and, db, desc, eq, gte, listen, sql, track, trackArtist } from "@workspace/database";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "4weeks";
    const offset = parseInt(searchParams.get("offset") || "0");

    let startDate: Date;
    let endDate: Date;

    if (period === "lifetime") {
      // No date filtering for lifetime
      startDate = new Date(0);
      endDate = new Date();
    } else {
      const now = new Date();
      endDate = new Date(now);

      if (period === "4weeks") {
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 28 * (offset + 1));
        endDate.setDate(endDate.getDate() - 28 * offset);
      } else if (period === "6months") {
        startDate = new Date(now);
        startDate.setMonth(startDate.getMonth() - 6 * (offset + 1));
        endDate.setMonth(endDate.getMonth() - 6 * offset);
      } else {
        return NextResponse.json({ error: "Invalid period" }, { status: 400 });
      }
    }

    const artistRankings = await db
      .select({
        artistId: trackArtist.artistId,
        artistName: sql<string>`artist.name`,
        streamCount: sql<number>`count(*)`.as("streamCount"),
        totalDuration: sql<number>`sum(${listen.durationMS})`.as("totalDuration"),
        imageUrl: sql<string | null>`artist.image_url`
      })
      .from(listen)
      .leftJoin(albumTrack, eq(listen.trackId, albumTrack.trackId))
      .leftJoin(track, eq(albumTrack.trackIsrc, track.isrc))
      .leftJoin(trackArtist, eq(trackArtist.trackIsrc, track.isrc))
      .leftJoin(sql`artist`, eq(sql`artist.id`, trackArtist.artistId))
      .where(
        and(
          gte(listen.durationMS, 30000),
          period === "lifetime" ? sql`1=1` : gte(listen.playedAt, startDate),
          period === "lifetime" ? sql`1=1` : sql`${listen.playedAt} <= ${endDate}`
        )
      )
      .groupBy(trackArtist.artistId, sql`artist.name`, sql`artist.image_url`)
      .orderBy(desc(sql<number>`count(*)`))
      .limit(50);

    return NextResponse.json(artistRankings);
  } catch (error) {
    console.error("Error fetching artist ranking data:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
