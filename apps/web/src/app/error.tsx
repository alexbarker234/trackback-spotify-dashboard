"use client";

import ErrorPage from "@/components/ErrorPage";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ reset }: ErrorProps) {
  return <ErrorPage onReset={reset} />;
}
