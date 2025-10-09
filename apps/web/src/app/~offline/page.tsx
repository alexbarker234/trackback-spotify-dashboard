"use client";
import ErrorPage from "@/components/ErrorPage";
import { faWifi } from "@fortawesome/free-solid-svg-icons";

export default function OfflinePage() {
  return (
    <ErrorPage
      icon={faWifi}
      iconBgColor="bg-gradient-to-br from-orange-500/10 to-yellow-500/10"
      iconColor="text-orange-400"
      title="You're offline"
      subtitle="No internet connection"
      message="It looks like you've lost your internet connection. Check your network settings and try again."
      showTryAgain={false}
      showGoHome={false}
      showGoBack={false}
    />
  );
}
