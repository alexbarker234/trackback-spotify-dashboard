import { authClient } from "./auth-client";
import { AUTH_URL } from "./config";

export async function verifyServerSession(): Promise<boolean> {
  const cookies = authClient.getCookie();
  if (!cookies) {
    return false;
  }

  const response = await fetch(`${AUTH_URL}/get-session`, {
    headers: { Cookie: cookies },
    credentials: "omit",
  });

  if (!response.ok) {
    return false;
  }

  const session = (await response.json()) as { user?: unknown } | null;
  return !!session?.user;
}
