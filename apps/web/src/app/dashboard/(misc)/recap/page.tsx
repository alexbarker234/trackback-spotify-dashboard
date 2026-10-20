import WeeklyRecap from "@/components/recap/WeeklyRecap";
import { auth } from "@/lib/auth";
import { getStandaloneCookieServer } from "@/lib/utils/serverCookies";
import { headers } from "next/headers";

export default async function RecapPage() {
  const [session, isStandalone] = await Promise.all([
    auth.api.getSession({ headers: await headers() }),
    getStandaloneCookieServer()
  ]);

  return (
    <WeeklyRecap
      userName={session?.user.name || "You"}
      userImage={session?.user.image ?? null}
      isStandalone={isStandalone}
    />
  );
}
