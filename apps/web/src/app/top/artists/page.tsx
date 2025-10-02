import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import TopArtistsPage from "./TopArtistsPage";

export default async function TopArtistsPageServer() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) {
    redirect("/login");
  }

  return <TopArtistsPage />;
}
