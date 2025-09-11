import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import Link from "next/link";
import { FaHome } from "react-icons/fa";
import LoginButton from "./LoginButton";
import UserProfile from "./UserProfile";

export default async function Header() {
  const session = await auth.api.getSession({
    headers: await headers()
  });
  return (
    <header className="bg-zinc-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="transition-colors hover:text-zinc-400">
            <FaHome size={40} />
          </Link>

          {/* Auth Section */}
          <div className="flex items-center space-x-4">
            {session?.user?.id ? (
              <UserProfile
                userInfo={{
                  username: session.user.name,
                  avatarURL: session.user.image
                }}
              />
            ) : (
              <div className="flex items-center space-x-3">
                <LoginButton />
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
