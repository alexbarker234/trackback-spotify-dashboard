import { cookies } from "next/headers";

export async function getStandaloneCookieServer(): Promise<boolean> {
  const cookieStore = await cookies();
  const standaloneCookie = cookieStore.get("trackback-standalone");
  return standaloneCookie?.value === "true";
}
