import { useMutation } from "@tanstack/react-query";

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
  data?: UploadResponse;
}

interface FileToUpload {
  file: File;
  id: string;
  status: "pending" | "uploading" | "success" | "error";
  progress?: number;
  result?: {
    processed: number;
    skipped: number;
    errors: string[];
    processingTimeMs: number;
  };
}

const uploadFiles = async (files: File[], onProgress?: (update: ProgressUpdate) => void): Promise<UploadResponse> => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("files", file);
  });
  formData.append("stream", "true");

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Upload failed");
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
                throw new Error(data.data.message || "Upload failed");
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
      throw new Error("Upload completed but no result received");
    }

    return finalResult;
  }

  // Fallback to regular JSON response
  return response.json();
};

export function useUploadFiles() {
  return useMutation({
    mutationFn: ({ files, onProgress }: { files: File[]; onProgress?: (update: ProgressUpdate) => void }) =>
      uploadFiles(files, onProgress),
    onError: (error) => {
      console.error("Upload failed:", error);
    },
    onSuccess: (data) => {
      console.log("Upload successful:", data);
    }
  });
}

export type { FileToUpload, UploadResponse };
