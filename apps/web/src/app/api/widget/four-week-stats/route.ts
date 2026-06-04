import { auth } from "@/lib/auth";
import { getWidgetFourWeekStats } from "@workspace/core/queries/widget-stats";
import { headers } from "next/headers";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const stats = await getWidgetFourWeekStats();
    return Response.json(stats);
  } catch (error) {
    console.error("Error fetching widget four-week stats:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
