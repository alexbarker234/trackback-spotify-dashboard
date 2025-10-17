import { auth } from "@/lib/auth";
import { getPageTitle } from "@/lib/utils/pageTitle";
import { headers } from "next/headers";
import HeaderClient from "./HeaderClient";

export default async function Header() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "/";

  const pageTitle = getPageTitle(pathname);

  return <HeaderClient user={session?.user} pageTitle={pageTitle} />;
}
