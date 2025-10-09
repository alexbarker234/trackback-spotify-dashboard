"use client";

import ErrorPage from "@/components/ErrorPage";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const errorCode = searchParams.get("error");

  let errorDescription = "There was a problem signing you in.";
  if (errorCode === "unable_to_create_user") {
    errorDescription = "Sorry, only one user is allowed in this app.";
  }

  return <ErrorPage message={errorDescription} showTryAgain={false} />;
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthErrorContent />
    </Suspense>
  );
}
