import { getStandaloneCookieServer } from "@/lib/utils/serverCookies";
import HistoryPage from "./HistoryPage";

export default async function Page() {
  const isStandalone = await getStandaloneCookieServer();

  return <HistoryPage isStandalone={isStandalone} />;
}
