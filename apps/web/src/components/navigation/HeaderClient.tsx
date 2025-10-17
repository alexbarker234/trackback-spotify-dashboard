"use client";

import { useStandalone } from "@/hooks/useStandalone";
import Link from "next/link";
import LoginButton from "../LoginButton";
import LogoSvg from "../LogoSvg";
import UserProfile from "../UserProfile";
import StandaloneHeader from "./StandaloneHeader";

export default function HeaderClient({
  user,
  pageTitle
}: {
  user?: { name: string; image?: string };
  pageTitle: string;
}) {
  const { isStandalone } = useStandalone();

  if (isStandalone) {
    return <StandaloneHeader user={user} pageTitle={pageTitle} />;
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
            {user ? (
              <UserProfile
                userInfo={{
                  username: user.name,
                  avatarURL: user.image
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
