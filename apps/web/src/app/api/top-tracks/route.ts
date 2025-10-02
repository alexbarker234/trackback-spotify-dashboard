import { auth } from "@/lib/auth";
import { getTopTracksByDateRange } from "@workspace/core/queries/tracks";
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

    const tracks = await getTopTracksByDateRange({
      dateRange: dateRange || "4weeks",
      offset,
      limit
    });

    return Response.json(tracks);
  } catch (error) {
    console.error("Error fetching top tracks:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
