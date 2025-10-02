import UploadArea from "@/components/upload/UploadArea";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function ImportPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div>
      <UploadArea />
    </div>
  );
}
