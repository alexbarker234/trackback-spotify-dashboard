import { getStandaloneCookieServer } from "@/lib/utils/serverCookies";
import BackNav from "../BackNav";

export default async function ItemPageSkeleton({ children }: { children: React.ReactNode }) {
  const isStandalone = await getStandaloneCookieServer();
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-5 px-2 py-4 lg:px-8">
      {!isStandalone && <BackNav />}
      {children}
    </div>
  );
}
