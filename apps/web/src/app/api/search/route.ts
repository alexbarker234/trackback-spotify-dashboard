import { auth } from "@/lib/auth";
import { SearchAlbum, SearchArtist, SearchResults, SearchTrack } from "@/types";
import { getUserAccessToken } from "@workspace/core/queries/user";
import { searchSpotify } from "@workspace/core/spotify/search";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest): Promise<NextResponse<SearchResults | { error: string }>> {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json({ error: "Query parameter 'q' is required" }, { status: 400 });
    }

    const accessToken = await getUserAccessToken(session.user.id);

    if (!accessToken) {
      return NextResponse.json({ error: "No valid Spotify access token" }, { status: 401 });
    }

    const searchResults = await searchSpotify(query, accessToken, ["album", "track", "artist"], 10);

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
