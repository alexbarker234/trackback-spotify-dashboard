"use client";

import { getPageTitle } from "@/lib/utils/pageTitle";
import { usePathname, useSearchParams } from "next/navigation";
import {
  createContext,
  ReactNode,
  Suspense,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";

type PageTitleContextType = {
  title: string | null;
  subheader: string | null;
  setTitle: (title: string | null) => void;
  setSubheader: (subheader: string | null) => void;
};

const PageTitleContext = createContext<PageTitleContextType | undefined>(undefined);

function PageTitleProviderInner({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const defaultTitle = useMemo(
    () => getPageTitle(pathname, searchParams),
    [pathname, searchParams]
  );
  const [title, setTitle] = useState<string>(defaultTitle);
  const [subheader, setSubheader] = useState<string | null>(null);

  // Title reset
  const prevPathnameRef = useRef<string | null>(null);
  useEffect(() => {
    // Reset the title to the default when only pathname changes
    if (prevPathnameRef.current !== null && prevPathnameRef.current !== pathname) {
      setTitle(getPageTitle(pathname, searchParams));
      setSubheader(null);
    }
    prevPathnameRef.current = pathname;
  }, [pathname, searchParams]);

  return (
    <PageTitleContext.Provider value={{ title, subheader, setTitle, setSubheader }}>
      {children}
    </PageTitleContext.Provider>
  );
}

function PageTitleProviderFallback({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const defaultTitle = useMemo(() => getPageTitle(pathname, new URLSearchParams()), [pathname]);
  const [title] = useState<string>(defaultTitle);
  const [subheader] = useState<string | null>(null);

  return (
    <PageTitleContext.Provider
      value={{
        title,
        subheader,
        setTitle: () => {},
        setSubheader: () => {}
      }}
    >
      {children}
    </PageTitleContext.Provider>
  );
}

export function PageTitleProvider({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<PageTitleProviderFallback>{children}</PageTitleProviderFallback>}>
      <PageTitleProviderInner>{children}</PageTitleProviderInner>
    </Suspense>
  );
}

export function usePageTitle() {
  const context = useContext(PageTitleContext);
  if (context === undefined) {
    throw new Error("usePageTitle must be used within a PageTitleProvider");
  }
  return context;
}
