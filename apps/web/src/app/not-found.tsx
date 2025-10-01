"use client";
import Button from "@/components/Button";
import { faArrowLeft, faHome, faQuestion } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";

export default function NotFound() {
  const [hasBackButton, setHasBackButton] = useState(true);

  useEffect(() => {
    setHasBackButton(window.history.length > 1);
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-md text-center">
        {/* 404 Icon */}
        <div className="mb-8">
          <div className="bg-spotify-green mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full">
            <FontAwesomeIcon icon={faQuestion} className="text-white" />
          </div>
          <h1 className="mb-2 text-6xl font-bold text-zinc-100">404</h1>
          <h2 className="mb-4 text-2xl font-semibold text-zinc-300">Page Not Found</h2>
        </div>

        {/* Error Message */}
        <p className="mb-8 leading-relaxed text-zinc-400">
          Oops! The page you&apos;re looking for seems to have gone missing. It might have been moved, deleted, or you
          entered the wrong URL.
        </p>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Button label="Go Home" variant="primary" className="w-full py-3 font-medium" icon={faHome} href="/" />
          {hasBackButton && (
            <Button
              label="Go Back"
              className="w-full bg-zinc-800 py-3 font-medium text-zinc-200 hover:bg-zinc-700"
              icon={faArrowLeft}
              onClick={() => window.history.back()}
            />
          )}
        </div>
      </div>
    </div>
  );
}
