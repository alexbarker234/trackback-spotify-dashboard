import { auth } from "@/lib/auth";
import { getTopTracks } from "@workspace/core/queries/tracks";
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
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");
    const limit = parseInt(searchParams.get("limit") || "250");

    const startDate = startDateParam ? new Date(startDateParam) : undefined;
    const endDate = endDateParam ? new Date(endDateParam) : undefined;

    const tracks = await getTopTracks({
      startDate,
      endDate,
      limit
    });

    return Response.json(tracks);
  } catch (error) {
    console.error("Error fetching top tracks:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
