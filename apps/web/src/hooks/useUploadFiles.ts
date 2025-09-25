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

interface FileToUpload {
  file: File;
  id: string;
  status: "pending" | "uploading" | "success" | "error";
}

const uploadFiles = async (files: File[]): Promise<UploadResponse> => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("files", file);
  });

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Upload failed");
  }

  return response.json();
};

export function useUploadFiles() {
  return useMutation({
    mutationFn: uploadFiles,
    onError: (error) => {
      console.error("Upload failed:", error);
    },
    onSuccess: (data) => {
      console.log("Upload successful:", data);
    }
  });
}

export type { FileToUpload, UploadResponse };
