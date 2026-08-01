import { auth } from "@/lib/auth";
import { getStandaloneCookieServer } from "@/lib/utils/serverCookies";
import { headers } from "next/headers";
import TabsNavigationClient from "./TabsNavigationClient";

export default async function TabsNavigation() {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  if (!session?.user?.id) {
    return null;
  }

  const isStandalone = await getStandaloneCookieServer();
  if (!isStandalone) {
    return null;
  }

  return <TabsNavigationClient />;
}
