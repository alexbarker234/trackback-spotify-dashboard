import Link from "next/link";

export default function StandaloneHeader({
  user,
  pageTitle
}: {
  user?: { name: string; image?: string };
  pageTitle: string;
}) {
  return (
    <header className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2 sm:px-6 lg:px-8">
        <h1 className={`opacity-100} text-lg font-semibold text-white transition-opacity duration-500 ease-in-out`}>
          {pageTitle}
        </h1>
        <Link href="/dashboard/profile">
          <img src={user?.image} alt={user?.name} className="h-8 w-8 rounded-full" />
        </Link>
      </div>
    </header>
  );
}
