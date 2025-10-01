import UploadDropzone from "@/components/UploadDropzone";
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
      <UploadDropzone />
    </div>
  );
}
