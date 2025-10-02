import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import TopAlbumsPage from "./TopAlbumsPage";

export default async function TopAlbumsPageServer() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) {
    redirect("/login");
  }

  return <TopAlbumsPage />;
}
