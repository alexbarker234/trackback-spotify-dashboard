import StatsPage from "@/components/stats/StatsPage";
import { getStandaloneCookieServer } from "@/lib/utils/serverCookies";

export default async function StatsRoutePage() {
  const isStandalone = await getStandaloneCookieServer();

  return <StatsPage isStandalone={isStandalone} />;
}
