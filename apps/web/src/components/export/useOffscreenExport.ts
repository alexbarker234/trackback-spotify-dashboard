"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  CaptureElementOptions,
  captureElementToPng,
  PORTRAIT_EXPORT_SIZE,
  shareOrDownloadImage
} from "./htmlExport";

export type UseOffscreenExportOptions = {
  filename: string;
  shareTitle: string;
  enabled?: boolean;
  size?: { width: number; height: number };
  captureOptions?: Omit<CaptureElementOptions, "width" | "height">;
};

export function useOffscreenExport({
  filename,
  shareTitle,
  enabled = true,
  size = PORTRAIT_EXPORT_SIZE,
  captureOptions
}: UseOffscreenExportOptions) {
  const [isExporting, setIsExporting] = useState(false);
  const [showExportSurface, setShowExportSurface] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);
  const captureOptionsRef = useRef(captureOptions);
  captureOptionsRef.current = captureOptions;

  const startExport = useCallback(() => {
    if (!enabled || isExporting) return;
    setIsExporting(true);
    setShowExportSurface(true);
  }, [enabled, isExporting]);

  useEffect(() => {
    if (!showExportSurface) return;

    let cancelled = false;

    const runExport = async () => {
      const node = exportRef.current;
      if (!node) {
        setShowExportSurface(false);
        setIsExporting(false);
        return;
      }

      try {
        const blob = await captureElementToPng(node, {
          width: size.width,
          height: size.height,
          ...captureOptionsRef.current
        });
        if (cancelled) return;
        await shareOrDownloadImage(blob, filename, shareTitle);
      } catch (error) {
        console.error("Failed to export:", error);
      } finally {
        setShowExportSurface(false);
        setIsExporting(false);
      }
    };

    void runExport();

    return () => {
      cancelled = true;
    };
  }, [showExportSurface, filename, shareTitle, size.width, size.height]);

  return {
    isExporting,
    showExportSurface,
    exportRef,
    startExport,
    exportWidth: size.width,
    exportHeight: size.height
  };
}
