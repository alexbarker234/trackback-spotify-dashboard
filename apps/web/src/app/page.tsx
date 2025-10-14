import LoginButton from "@/components/LoginButton";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  if (session?.user?.id) {
    redirect("/dashboard");
  }
  return (
    <div className="flex h-full grow items-center justify-center">
      <LoginButton />
    </div>
  );
}
