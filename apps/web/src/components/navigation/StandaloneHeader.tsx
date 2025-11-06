"use client";

import { usePageTitle } from "@/lib/contexts/PageTitleContext";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function StandaloneHeader({ user }: { user?: { name: string; image?: string } }) {
  const { title, subheader } = usePageTitle();
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <header className="relative h-12 border-b border-white/10 bg-black/20 backdrop-blur-sm">
      <button
        onClick={handleBack}
        className="absolute top-1/2 left-4 -translate-y-1/2 cursor-pointer"
      >
        <FontAwesomeIcon icon={faArrowLeft} className="text-white" />
      </button>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
        <h1 className="text-lg font-semibold text-white">{title}</h1>
        {subheader && <p className="text-xs text-gray-400">{subheader}</p>}
      </div>
      <Link href="/dashboard/profile" className="absolute top-1/2 right-4 -translate-y-1/2">
        <img src={user?.image} alt={user?.name} className="h-8 w-8 rounded-full" />
      </Link>
    </header>
  );
}
