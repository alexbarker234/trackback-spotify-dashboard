"use client";

import { getPageTitle } from "@/lib/utils/pageTitle";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function StandaloneHeader({ user }: { user?: { name: string; image?: string } }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const pageTitle = getPageTitle(pathname, searchParams);
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <header className="relative h-12 border-b border-white/10 bg-black/20 backdrop-blur-sm">
      <button onClick={handleBack} className="absolute top-1/2 left-4 -translate-y-1/2 cursor-pointer">
        <FontAwesomeIcon icon={faArrowLeft} className="text-white" />
      </button>
      <h1 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-lg font-semibold text-white">
        {pageTitle}
      </h1>
      <Link href="/dashboard/profile" className="absolute top-1/2 right-4 -translate-y-1/2">
        <img src={user?.image} alt={user?.name} className="h-8 w-8 rounded-full" />
      </Link>
    </header>
  );
}
