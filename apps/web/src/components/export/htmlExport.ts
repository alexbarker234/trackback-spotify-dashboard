import type { Options as Html2CanvasOptions } from "html2canvas-pro";

export const PORTRAIT_EXPORT_SIZE = {
  width: 1080,
  height: 1920
} as const;

export async function waitForImages(root: HTMLElement) {
  const images = Array.from(root.querySelectorAll("img"));
  await Promise.all(
    images.map(
      (img) =>
        img.complete
          ? Promise.resolve()
          : new Promise<void>((resolve) => {
              img.addEventListener("load", () => resolve(), { once: true });
              img.addEventListener("error", () => resolve(), { once: true });
            })
    )
  );
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
    backgroundColor = "#111827",
    settleMs = 400,
    scale = 1,
    useCORS = true,
    allowTaint = false,
    logging = false
  }: CaptureElementOptions
): Promise<Blob> {
  await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
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
