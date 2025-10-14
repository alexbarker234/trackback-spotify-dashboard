import { auth } from "@/lib/auth";
import { getTopAlbums } from "@workspace/core/queries/albums";
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

    const albums = await getTopAlbums({
      startDate,
      endDate,
      limit
    });

    return Response.json(albums);
  } catch (error) {
    console.error("Error fetching top albums:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
