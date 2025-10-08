import { faWifi } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Offline - Trackback"
};

export default function OfflinePage() {
  return (
    <div className="flex h-full flex-grow items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-md text-center">
        {/* Offline Icon */}
        <div className="mb-8">
          <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-orange-900/20">
            <FontAwesomeIcon icon={faWifi} className="text-4xl text-orange-400" />
          </div>
          <h1 className="mb-2 text-3xl font-bold text-zinc-100">You&apos;re offline</h1>
          <h2 className="mb-4 text-xl font-semibold text-zinc-300">No internet connection</h2>
        </div>

        {/* Offline Message */}
        <div className="mb-8">
          <p className="mb-4 leading-relaxed text-zinc-400">
            It looks like you&apos;ve lost your internet connection. Check your network settings and try again.
          </p>
        </div>
      </div>
    </div>
  );
}
