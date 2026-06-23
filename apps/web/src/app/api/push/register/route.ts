import { auth } from "@/lib/auth";
import { db, pushToken } from "@workspace/database";
import { headers } from "next/headers";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    });

    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const token = typeof body.token === "string" ? body.token.trim() : "";
    const platform = typeof body.platform === "string" ? body.platform.trim() : "";

    if (!token || !platform) {
      return Response.json({ error: "token and platform are required" }, { status: 400 });
    }

    const now = new Date();

    await db
      .insert(pushToken)
      .values({
        id: crypto.randomUUID(),
        userId: session.user.id,
        token,
        platform,
        createdAt: now,
        updatedAt: now
      })
      .onConflictDoUpdate({
        target: pushToken.token,
        set: {
          userId: session.user.id,
          platform,
          updatedAt: now
        }
      });

    return Response.json({ ok: true });
  } catch (error) {
    console.error("Error registering push token:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
