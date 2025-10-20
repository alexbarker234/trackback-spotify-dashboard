import TopItemsPage from "@/components/top/TopItemsPage";
import { getStandaloneCookieServer } from "@/lib/utils/serverCookies";

export default async function TopPage() {
  const isStandalone = await getStandaloneCookieServer();

  return <TopItemsPage isStandalone={isStandalone} />;
}
