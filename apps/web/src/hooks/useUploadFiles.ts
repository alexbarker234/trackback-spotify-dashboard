import { useMutation } from "@tanstack/react-query";
import { upload } from "@vercel/blob/client";

interface UploadResponse {
  success: boolean;
  message: string;
  results: {
    totalFiles: number;
    totalProcessed: number;
    totalSkipped: number;
    totalErrors: number;
    fileResults: Array<{
      filename: string;
      processed: number;
      skipped: number;
      errors: string[];
      processingTimeMs: number;
    }>;
    totalProcessingTimeMs: number;
  };
  errors?: string[];
}

interface ProgressUpdate {
  type: "progress" | "complete" | "error";
  message: string;
  progress?: {
    current: number;
    total: number;
    percentage: number;
  };
  fileProgress?: {
    fileIndex: number;
    fileName: string;
    status: "waiting" | "uploading" | "uploaded" | "complete" | "error";
    progress: number;
  };
  data?: UploadResponse;
}

interface FileToUpload {
  file: File;
  id: string;
  status: "waiting" | "uploading" | "uploaded" | "complete" | "error";
  progress?: number;
  result?: {
    processed: number;
    skipped: number;
    errors: string[];
    processingTimeMs: number;
  };
  blobUrl?: string;
}

const uploadFiles = async (
  files: File[],
  onProgress?: (update: ProgressUpdate) => void
): Promise<UploadResponse> => {
  const blobUrls: string[] = [];

  // Step 1: Upload files to Vercel Blob
  onProgress?.({
    type: "progress",
    message: "Starting upload process...",
    progress: { current: 0, total: files.length, percentage: 0 }
  });

  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    // Mark file as uploading
    onProgress?.({
      type: "progress",
      message: `Uploading ${file.name}...`,
      progress: {
        current: i,
        total: files.length,
        percentage: Math.round((i / files.length) * 50)
      },
      fileProgress: {
        fileIndex: i,
        fileName: file.name,
        status: "uploading",
        progress: 0
      }
    });

    try {
      const blob = await upload(`${Date.now()}-${file.name}`, file, {
        access: "public",
        contentType: file.type,
        handleUploadUrl: "/api/upload"
      });

      blobUrls.push(blob.url);
      console.log(`Uploaded ${file.name}: ${blob.url}`);

      // Mark file as uploaded
      onProgress?.({
        type: "progress",
        message: `Uploaded ${file.name} successfully`,
        progress: {
          current: i + 1,
          total: files.length,
          percentage: Math.round(((i + 1) / files.length) * 50)
        },
        fileProgress: {
          fileIndex: i,
          fileName: file.name,
          status: "uploaded",
          progress: 100
        }
      });
    } catch (error) {
      console.error(`Failed to upload ${file.name}:`, error);

      // Mark file as error
      onProgress?.({
        type: "progress",
        message: `Failed to upload ${file.name}`,
        progress: {
          current: i,
          total: files.length,
          percentage: Math.round((i / files.length) * 50)
        },
        fileProgress: {
          fileIndex: i,
          fileName: file.name,
          status: "error",
          progress: 0
        }
      });

      throw new Error(
        `Failed to upload ${file.name}: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  // Step 2: Process the uploaded blobs
  onProgress?.({
    type: "progress",
    message: "Processing uploaded files...",
    progress: { current: files.length, total: files.length, percentage: 50 }
  });

  // Mark all files as complete after successful upload
  for (let i = 0; i < files.length; i++) {
    onProgress?.({
      type: "progress",
      message: `Processing ${files[i].name}...`,
      progress: { current: files.length, total: files.length, percentage: 50 },
      fileProgress: {
        fileIndex: i,
        fileName: files[i].name,
        status: "complete",
        progress: 100
      }
    });
  }

  const response = await fetch("/api/process-blobs?stream=true", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ blobUrls })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Processing failed");
  }

  // Handle streaming response
  if (response.headers.get("content-type")?.includes("text/event-stream")) {
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error("No response body");
    }

    let buffer = "";
    let finalResult: UploadResponse | null = null;

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || ""; // Keep the last incomplete line in buffer

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6)) as ProgressUpdate;

              if (onProgress) {
                onProgress(data);
              }

              if (data.type === "complete" && data.data) {
                finalResult = data.data;
              } else if (data.type === "error" && data.data) {
                throw new Error(data.data.message || "Processing failed");
              }
            } catch (parseError) {
              console.warn("Failed to parse SSE data:", parseError);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    if (!finalResult) {
      throw new Error("Processing completed but no result received");
    }

    return finalResult;
  }

  // Fallback to regular JSON response
  return response.json();
};

export function useUploadFiles() {
  return useMutation({
    mutationFn: ({
      files,
      onProgress
    }: {
      files: File[];
      onProgress?: (update: ProgressUpdate) => void;
    }) => uploadFiles(files, onProgress),
    onError: (error) => {
      console.error("Upload failed:", error);
    },
    onSuccess: (data) => {
      console.log("Upload successful:", data);
    }
  });
}

export type { FileToUpload, UploadResponse };
