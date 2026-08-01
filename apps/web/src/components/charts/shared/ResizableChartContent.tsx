"use client";

import { useResizeObserver } from "@/hooks/useResizeObserver";
import { ReactNode } from "react";

interface ResizableChartContentProps {
  children: (isVertical: boolean) => ReactNode;
}

export default function ResizableChartContent({ children }: ResizableChartContentProps) {
  const { containerRef, isVertical } = useResizeObserver();

  return (
    <div ref={containerRef} className="h-full w-full">
      {children(isVertical)}
    </div>
  );
}
