import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import ArtistRankingPage from "./ArtistRankingPage";

export default async function MiscPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) {
    redirect("/login");
  }

  return <ArtistRankingPage />;
}
