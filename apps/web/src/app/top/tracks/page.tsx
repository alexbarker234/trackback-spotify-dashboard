import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import TopTracksPage from "./TopTracksPage";

export default async function TopTracksPageServer() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) {
    redirect("/login");
  }

  return <TopTracksPage />;
}
