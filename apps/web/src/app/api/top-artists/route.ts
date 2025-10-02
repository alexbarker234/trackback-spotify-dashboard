import { auth } from "@/lib/auth";
import { getTopArtistsByDateRange } from "@workspace/core/queries/artists";
import { headers } from "next/headers";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const dateRange = searchParams.get("dateRange") as "4weeks" | "6months" | "lifetime" | null;
    const offset = parseInt(searchParams.get("offset") || "0");
    const limit = parseInt(searchParams.get("limit") || "250");

    const artists = await getTopArtistsByDateRange({
      dateRange: dateRange || "4weeks",
      offset,
      limit
    });

    return Response.json(artists);
  } catch (error) {
    console.error("Error fetching top artists:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
