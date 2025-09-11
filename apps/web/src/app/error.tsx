"use client";

import ErrorPage from "@/components/ErrorPage";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps) {
  return <ErrorPage reset={reset} />;
}
