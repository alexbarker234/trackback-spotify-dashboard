"use client";
import Link from "next/link";
import { FaExclamationTriangle, FaHome, FaSyncAlt } from "react-icons/fa";

export default function ErrorPage({
  errorMessage,
  reset,
  allowTryAgain = true
}: {
  errorMessage?: string;
  reset: () => void;
  allowTryAgain?: boolean;
}) {
  return (
    <div className="flex h-full flex-grow items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-md text-center">
        {/* Error Icon */}
        <div className="mb-8">
          <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-red-900/20">
            <FaExclamationTriangle className="h-12 w-12 text-red-400" />
          </div>
          <h1 className="mb-2 text-3xl font-bold text-zinc-100">Something went wrong!</h1>
          <h2 className="mb-4 text-xl font-semibold text-zinc-300">An error occurred</h2>
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <p className="mb-4 leading-relaxed text-zinc-400">
            {errorMessage || "We're sorry, but something unexpected happened. Try refresh the page."}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          {allowTryAgain && (
            <button
              onClick={reset}
              className="inline-flex w-full cursor-pointer items-center justify-center rounded-lg bg-purple-600 px-6 py-3 font-medium text-white transition-colors duration-200 hover:bg-purple-700"
            >
              <FaSyncAlt className="mr-2 h-4 w-4" />
              Try Again
            </button>
          )}

          <Link
            href="/"
            className="inline-flex w-full items-center justify-center rounded-lg bg-zinc-800 px-6 py-3 font-medium text-zinc-200 transition-colors duration-200 hover:bg-zinc-700"
          >
            <FaHome className="mr-2 h-4 w-4" />
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
