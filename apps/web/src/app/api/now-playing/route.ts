import { auth } from "@/lib/auth";
import { getUserAccessToken } from "@workspace/core/queries/user";
import { fetchCurrentlyPlayingTrack } from "@workspace/core/spotify/user";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accessToken = await getUserAccessToken(session.user.id);

    if (!accessToken) {
      return NextResponse.json({ error: "No valid Spotify access token" }, { status: 401 });
    }

    // Fetch currently playing track from Spotify
    const currentlyPlaying = await fetchCurrentlyPlayingTrack(accessToken);

    if (!currentlyPlaying) {
      return NextResponse.json({ error: "No currently playing track" }, { status: 404 });
    }

    return NextResponse.json(currentlyPlaying);
  } catch (error) {
    console.error("Error fetching currently playing track:", error);
    return NextResponse.json({ error: "Failed to fetch currently playing track" }, { status: 500 });
  }
}
