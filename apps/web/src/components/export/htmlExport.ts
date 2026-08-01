import type { Options as Html2CanvasOptions } from "html2canvas-pro";
import { colors } from "@/lib/utils/colors";

export const PORTRAIT_EXPORT_SIZE = {
  width: 1080,
  height: 1920
} as const;

export async function waitForImages(root: HTMLElement) {
  const htmlImages = Array.from(root.querySelectorAll("img"));
  const svgImages = Array.from(root.querySelectorAll("image"));

  await Promise.all([
    ...htmlImages.map(
      (img) =>
        img.complete
          ? Promise.resolve()
          : new Promise<void>((resolve) => {
              img.addEventListener("load", () => resolve(), { once: true });
              img.addEventListener("error", () => resolve(), { once: true });
            })
    ),
    ...svgImages.map(
      (img) =>
        new Promise<void>((resolve) => {
          const done = () => resolve();
          img.addEventListener("load", done, { once: true });
          img.addEventListener("error", done, { once: true });
          // Already-decoded images may not fire load again
          window.setTimeout(done, 150);
        })
    )
  ]);
}

async function urlToDataUrl(url: string): Promise<string | null> {
  try {
    const response = await fetch(url, { mode: "cors", credentials: "omit" });
    if (!response.ok) return null;
    const blob = await response.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

/** Convert external <img> / SVG <image> sources to data URLs so html2canvas can paint them reliably. */
export async function inlineImagesAsDataUrls(root: HTMLElement) {
  const htmlImgs = Array.from(root.querySelectorAll("img"));
  const svgImgs = Array.from(root.querySelectorAll("image"));

  await Promise.all([
    ...htmlImgs.map(async (img) => {
      const src = img.currentSrc || img.getAttribute("src");
      if (!src || src.startsWith("data:")) return;
      const dataUrl = await urlToDataUrl(src);
      if (dataUrl) img.setAttribute("src", dataUrl);
    }),
    ...svgImgs.map(async (img) => {
      const href =
        img.getAttribute("href") ||
        img.getAttribute("xlink:href") ||
        (img as SVGImageElement).href?.baseVal;
      if (!href || href.startsWith("data:")) return;
      const dataUrl = await urlToDataUrl(href);
      if (dataUrl) {
        img.setAttribute("href", dataUrl);
        img.setAttributeNS("http://www.w3.org/1999/xlink", "href", dataUrl);
      }
    })
  ]);
}

export async function shareOrDownloadImage(blob: Blob, filename: string, title: string) {
  const file = new File([blob], filename, { type: "image/png" });

  if (typeof navigator !== "undefined" && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title });
      return;
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
    }
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export type CaptureElementOptions = {
  width: number;
  height: number;
  backgroundColor?: string;
  settleMs?: number;
} & Partial<Pick<Html2CanvasOptions, "scale" | "useCORS" | "allowTaint" | "logging">>;

export async function captureElementToPng(
  node: HTMLElement,
  {
    width,
    height,
    backgroundColor = colors.gray900,
    settleMs = 600,
    scale = 1,
    useCORS = true,
    allowTaint = false,
    logging = false
  }: CaptureElementOptions
): Promise<Blob> {
  await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
  await waitForImages(node);
  await inlineImagesAsDataUrls(node);
  await waitForImages(node);
  if (settleMs > 0) {
    await new Promise((resolve) => setTimeout(resolve, settleMs));
  }

  const html2canvas = (await import("html2canvas-pro")).default;
  const canvas = await html2canvas(node, {
    useCORS,
    allowTaint,
    backgroundColor,
    width,
    height,
    scale,
    logging
  });

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
  if (!blob) throw new Error("Failed to create image");
  return blob;
}
