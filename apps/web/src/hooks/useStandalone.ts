import { getStandaloneCookie } from "@/lib/utils/cookies";
import { useEffect, useState } from "react";

type WindowWithWebView = Window & { ReactNativeWebView?: unknown };

export function detectStandalone(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  if (window.matchMedia("(display-mode: standalone)").matches) {
    return true;
  }

  if ((window as WindowWithWebView).ReactNativeWebView) {
    return true;
  }

  if (navigator.userAgent.includes("TrackbackApp")) {
    return true;
  }

  return getStandaloneCookie();
}

export const useStandalone = () => {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream);
    setIsStandalone(detectStandalone());
  }, []);

  return { isIOS, isStandalone };
};
