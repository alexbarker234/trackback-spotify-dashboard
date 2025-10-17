import { getStandaloneCookieServer } from "@/lib/utils/serverCookies";
import TopTracksPage from "./TopTracksPage";

export default async function TopTracksPageServer() {
  const isStandalone = await getStandaloneCookieServer();
  return <TopTracksPage isStandalone={isStandalone} />;
}
