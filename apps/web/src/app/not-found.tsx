"use client";
import ErrorPage from "@/components/ErrorPage";
import { faQuestion } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";

export default function NotFound() {
  const [hasBackButton, setHasBackButton] = useState(false);

  useEffect(() => {
    setHasBackButton(window.history.length > 1);
  }, []);

  return (
    <ErrorPage
      icon={faQuestion}
      iconBgColor="bg-gradient-to-br from-purple-500/10 to-pink-500/10"
      iconColor="text-purple-400"
      title="404"
      subtitle="Page Not Found"
      message="Oops! The page you're looking for seems to have gone missing. It might have been moved, deleted, or you entered the wrong URL."
      showTryAgain={false}
      showGoHome={true}
      showGoBack={hasBackButton}
      fullScreen={true}
    />
  );
}
