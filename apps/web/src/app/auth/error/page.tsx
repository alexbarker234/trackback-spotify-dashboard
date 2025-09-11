"use client";

import ErrorPage from "@/components/ErrorPage";
import { useSearchParams } from "next/navigation";

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const errorCode = searchParams.get("error");

  let errorDescription = "There was a problem signing you in.";
  if (errorCode === "unable_to_create_user") {
    errorDescription = "Sorry, only one user is allowed in this app.";
  }

  return <ErrorPage errorMessage={errorDescription} reset={() => {}} allowTryAgain={false} />;
}
