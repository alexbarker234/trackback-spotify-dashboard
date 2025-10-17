import { auth } from "@/lib/auth";
import { getStandaloneCookieServer } from "@/lib/utils/serverCookies";
import { headers } from "next/headers";
import Link from "next/link";
import LoginButton from "../LoginButton";
import LogoSvg from "../LogoSvg";
import UserProfile from "../UserProfile";
import StandaloneHeader from "./StandaloneHeader";

export default async function Header() {
  const session = await auth.api.getSession({
    headers: await headers()
  });

  const isStandalone = await getStandaloneCookieServer();

  if (isStandalone) {
    return <StandaloneHeader user={session?.user} />;
  }
  return (
    <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="group text-xl font-bold transition-opacity hover:opacity-50">
            <LogoSvg className="inline-block h-8 w-8 fill-white" /> Trackback
          </Link>
          {/* Auth Section */}
          <div className="flex items-center space-x-4">
            {session?.user ? (
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
