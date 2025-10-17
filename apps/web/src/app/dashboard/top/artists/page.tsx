import { getStandaloneCookieServer } from "@/lib/utils/serverCookies";
import TopArtistsPage from "./TopArtistsPage";

export default async function TopArtistsPageServer() {
  const isStandalone = await getStandaloneCookieServer();
  return <TopArtistsPage isStandalone={isStandalone} />;
}
