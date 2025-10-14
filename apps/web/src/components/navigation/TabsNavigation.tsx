import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import TabsNavigationClient from "./TabsNavigationClient";

export default async function TabsNavigation() {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  if (!session?.user?.id) {
    return null;
  }
  return <TabsNavigationClient />;
}
