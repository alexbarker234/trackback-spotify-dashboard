import { getStandaloneCookieServer } from "@/lib/utils/serverCookies";
import PeakDaysPage from "./PeakDaysPage";

export default async function PeakDaysRoutePage() {
  const isStandalone = await getStandaloneCookieServer();

  return <PeakDaysPage isStandalone={isStandalone} />;
}
