"use client";

import { useStandalone } from "@/hooks/useStandalone";
import { faChartLine, faHome, faMagnifyingGlass, faTableColumns } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface Tab {
  name: string;
  path: string;
  icon: typeof faHome;
}

const tabs: Tab[] = [
  { name: "Home", path: "/dashboard", icon: faHome },
  { name: "Trends", path: "/dashboard/misc", icon: faChartLine },
  { name: "Dashboard", path: "/dashboard/top/tracks", icon: faTableColumns },
  { name: "Search", path: "/dashboard/search", icon: faMagnifyingGlass }
];

export default function TabsNavigation() {
  const pathname = usePathname();
  const { isStandalone } = useStandalone();
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, opacity: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonsRef = useRef<{ [key: string]: HTMLAnchorElement | null }>({});

  const isActiveTab = (path: string) => {
    if (path === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(path);
  };

  const activeTab = tabs.find((tab) => isActiveTab(tab.path));

  useEffect(() => {
    const updateIndicator = () => {
      if (!activeTab) {
        setIndicatorStyle((current) => ({ ...current, opacity: 0 }));
        return;
      }

      const activeButton = buttonsRef.current[activeTab.path];
      const container = containerRef.current;

      if (activeButton && container) {
        const containerRect = container.getBoundingClientRect();
        const buttonRect = activeButton.getBoundingClientRect();

        setIndicatorStyle({
          left: buttonRect.left - containerRect.left,
          width: buttonRect.width,
          opacity: 1
        });
      }
    };

    updateIndicator();
    window.addEventListener("resize", updateIndicator);
    return () => window.removeEventListener("resize", updateIndicator);
  }, [pathname, activeTab]);

  if (!isStandalone) {
    return null;
  }

  return (
    <nav className="fixed right-0 bottom-0 left-0 z-50 border-t border-white/10 bg-black/20 backdrop-blur-md">
      <div className="relative mx-auto max-w-7xl">
        <div ref={containerRef} className="relative grid grid-cols-4">
          {/* Sliding indicator */}
          <div
            className="absolute top-1/2 h-[85%] -translate-y-1/2 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-300 ease-out"
            style={{
              left: `${indicatorStyle.left}px`,
              width: `${indicatorStyle.width}px`,
              opacity: indicatorStyle.opacity
            }}
          />

          {/* Tabs */}
          {tabs.map((tab) => {
            const isActive = isActiveTab(tab.path);
            return (
              <Link
                key={tab.path}
                href={tab.path}
                ref={(el) => {
                  buttonsRef.current[tab.path] = el;
                }}
                className="group relative z-10 flex cursor-pointer flex-col items-center justify-center py-3 transition-colors"
              >
                <div>
                  <FontAwesomeIcon
                    icon={tab.icon}
                    className={`h-5 w-5 transition-all duration-200 ${
                      isActive ? "text-white" : "text-zinc-400 group-hover:text-zinc-200"
                    }`}
                  />
                </div>
                <span
                  className={`text-xs font-medium transition-colors ${
                    isActive ? "text-white" : "text-zinc-500 group-hover:text-zinc-300"
                  }`}
                >
                  {tab.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
