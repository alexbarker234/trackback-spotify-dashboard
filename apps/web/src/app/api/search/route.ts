import { auth } from "@/lib/auth";
import { SearchAlbum, SearchArtist, SearchResults, SearchTrack } from "@/types";
import { getUserAccessToken } from "@workspace/core/queries/user";
import { searchSpotify } from "@workspace/core/spotify/search";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const searchQuerySchema = z.object({
  q: z.string().min(1, "Query parameter 'q' is required").max(100, "Query too long"),
  type: z.enum(["album", "track", "artist"]).default("artist"),
  limit: z.coerce
    .number()
    .int("Limit must be an integer")
    .min(1, "Limit must be at least 1")
    .max(50, "Limit cannot exceed 50")
    .default(50)
});

export async function GET(
  request: NextRequest
): Promise<NextResponse<SearchResults | { error: string }>> {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const rawQuery = {
      q: searchParams.get("q"),
      type: searchParams.get("type"),
      limit: searchParams.get("limit")
    };

    const validationResult = searchQuerySchema.safeParse(rawQuery);

    if (!validationResult.success) {
      const errorMessage = validationResult.error.issues
        .map((err) => `${err.path.join(".")}: ${err.message}`)
        .join(", ");
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    const { q: query, type, limit } = validationResult.data;

    const accessToken = await getUserAccessToken(session.user.id);

    if (!accessToken) {
      return NextResponse.json({ error: "No valid Spotify access token" }, { status: 401 });
    }

    const searchResults = await searchSpotify(query, accessToken, [type], limit);

    if (!searchResults) {
      return NextResponse.json({ error: "Search failed" }, { status: 500 });
    }

    // Transform results to a cleaner format
    const albums: SearchAlbum[] =
      searchResults.albums?.items.map((album) => ({
        id: album.id,
        name: album.name,
        imageUrl: album.images[0]?.url || null,
        artists: album.artists.map((artist) => artist.name)
      })) || [];

    const tracks: SearchTrack[] =
      searchResults.tracks?.items.map((track) => ({
        id: track.id,
        isrc: track.external_ids?.isrc,
        name: track.name,
        imageUrl: track.album.images[0]?.url || null,
        artists: track.artists.map((artist) => artist.name)
      })) || [];

    const artists: SearchArtist[] =
      searchResults.artists?.items.map((artist) => ({
        id: artist.id,
        name: artist.name,
        imageUrl: artist.images[0]?.url || null,
        followers: artist.followers.total
      })) || [];

    return NextResponse.json({
      albums,
      tracks,
      artists
    });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
