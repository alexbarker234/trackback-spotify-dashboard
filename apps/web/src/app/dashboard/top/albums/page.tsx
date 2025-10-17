import { getStandaloneCookieServer } from "@/lib/utils/serverCookies";
import TopAlbumsPage from "./TopAlbumsPage";

export default async function TopAlbumsPageServer() {
  const isStandalone = await getStandaloneCookieServer();
  return <TopAlbumsPage isStandalone={isStandalone} />;
}
