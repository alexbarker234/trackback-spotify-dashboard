import { auth } from "@/lib/auth";
import { getWidgetLifetimeStats } from "@workspace/core/queries/widget-stats";
import { headers } from "next/headers";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const stats = await getWidgetLifetimeStats();
    return Response.json(stats);
  } catch (error) {
    console.error("Error fetching widget lifetime stats:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
