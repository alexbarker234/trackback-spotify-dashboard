"use client";

import { useStandalone } from "@/hooks/useStandalone";
import { setStandaloneCookie } from "@/lib/utils/cookies";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { useEffect, useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false
          }
        }
      })
  );
  const { isStandalone } = useStandalone();
  useEffect(() => {
    setStandaloneCookie(isStandalone);
  }, [isStandalone]);

  return (
    <NuqsAdapter>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </NuqsAdapter>
  );
}
