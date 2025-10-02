"use client";

import { useUploadFiles, type FileToUpload, type UploadResponse } from "@/hooks/useUploadFiles";
import { faSpinner, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useCallback, useState } from "react";
import Button from "../Button";
import UploadDropzone from "./UploadDropzone";
import UploadFile from "./UploadFile";

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

export default function UploadArea() {
  const [files, setFiles] = useState<FileToUpload[]>([]);
  const [globalProgress, setGlobalProgress] = useState<{
    current: number;
    total: number;
    percentage: number;
    message: string;
  } | null>(null);

  const uploadMutation = useUploadFiles();
  console.log(files);
  // Handle successful upload
  const handleUploadSuccess = (data: UploadResponse) => {
    // Clear global progress
    setGlobalProgress(null);

    // Update file statuses based on results
    setFiles((prevFiles) =>
      prevFiles.map((file, index) => {
        // Match by index since blob filenames are generated
        const fileResult = data.results.fileResults[index];

        if (fileResult) {
          return {
            ...file,
            status: fileResult.errors.length > 0 ? "error" : "complete",
            result: {
              processed: fileResult.processed,
              skipped: fileResult.skipped,
              errors: fileResult.errors,
              processingTimeMs: fileResult.processingTimeMs
            }
          };
        }

        return {
          ...file,
          status: "error",
          result: {
            processed: 0,
            skipped: 0,
            errors: ["File not processed"],
            processingTimeMs: 0
          }
        };
      })
    );
  };

  // Handle upload error
  const handleUploadError = (error: Error) => {
    // Clear global progress
    setGlobalProgress(null);

    setFiles((prevFiles) =>
      prevFiles.map((file) => ({
        ...file,
        status: "error",
        result: {
          processed: 0,
          skipped: 0,
          errors: [error.message],
          processingTimeMs: 0
        }
      }))
    );
  };

  // Handle upload start
  const handleUploadStart = () => {
    setFiles((prevFiles) =>
      prevFiles.map((file) => ({
        ...file,
        status: "uploading",
        progress: 0
      }))
    );
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    console.log("acceptedFiles", acceptedFiles);
    const newFiles: FileToUpload[] = acceptedFiles.map((file) => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      status: "waiting" as const
    }));

    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
  }, []);

  const handleUpload = () => {
    const waitingFiles = files.filter((file) => file.status === "waiting");
    if (waitingFiles.length > 0) {
      handleUploadStart();
      uploadMutation.mutate(
        {
          files: waitingFiles.map((file) => file.file),
          onProgress: (update: ProgressUpdate) => {
            // Update global progress
            if (update.type === "progress" && update.progress) {
              setGlobalProgress({
                current: update.progress.current,
                total: update.progress.total,
                percentage: update.progress.percentage,
                message: update.message
              });
            }

            // Update file-specific progress
            if (update.fileProgress) {
              setFiles((prevFiles) =>
                prevFiles.map((file, index) => {
                  if (index === update.fileProgress!.fileIndex) {
                    return {
                      ...file,
                      status: update.fileProgress!.status,
                      progress: update.fileProgress!.progress
                    };
                  }
                  return file;
                })
              );
            }

            // Log progress messages for debugging
            if (update.message) {
              console.log(`Upload progress: ${update.message} (${update.progress?.percentage || 0}%)`);
            }
          }
        },
        {
          onSuccess: handleUploadSuccess,
          onError: handleUploadError
        }
      );
    }
  };

  const handleRemoveFile = (fileId: string) => {
    setFiles((prevFiles) => prevFiles.filter((file) => file.id !== fileId));
  };

  const handleClearAll = () => {
    setFiles([]);
  };

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const waitingFiles = files.filter((f) => f.status === "waiting");
  const hasWaitingFiles = waitingFiles.length > 0;
  const isUploading = uploadMutation.isPending;

  return (
    <div className="mx-auto w-full max-w-4xl p-6">
      <div className="rounded-lg bg-zinc-800 shadow-lg">
        <div className="border-b border-zinc-700 p-6">
          <h2 className="mb-2 text-2xl font-bold text-zinc-100">Upload Spotify Data</h2>
          <p className="text-zinc-400">
            Upload your Spotify Extended Streaming History JSON files to import your listening data.
          </p>
        </div>

        {/* Dropzone */}
        <UploadDropzone onDrop={onDrop} isUploading={isUploading} />

        {/* Global Progress */}
        {globalProgress && (
          <div className="border-t border-zinc-700 p-6">
            <div className="mb-4">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-lg font-medium text-zinc-100">Upload Progress</h3>
                <span className="text-sm text-zinc-400">
                  {globalProgress.current} of {globalProgress.total} files
                </span>
              </div>
              <div className="mb-2 h-2 w-full rounded-full bg-zinc-700">
                <div
                  className="h-2 rounded-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${globalProgress.percentage}%` }}
                />
              </div>
              <p className="text-sm text-zinc-400">{globalProgress.message}</p>
            </div>
          </div>
        )}

        {/* Upload Summary */}
        {uploadMutation.isSuccess && uploadMutation.data && (
          <div className="mt-6 rounded-lg border border-green-700 bg-green-900/20 p-4">
            <h4 className="mb-2 font-medium text-green-300">Upload Complete!</h4>
            <div className="space-y-1 text-sm text-green-200">
              <p>Total files: {uploadMutation.data.results.totalFiles}</p>
              <p>Processed: {uploadMutation.data.results.totalProcessed} listens</p>
              <p>Skipped: {uploadMutation.data.results.totalSkipped} items</p>
              <p>Errors: {uploadMutation.data.results.totalErrors}</p>
              <p>Total time: {formatTime(uploadMutation.data.results.totalProcessingTimeMs)}</p>
            </div>
          </div>
        )}

        {/* File List */}
        {files.length > 0 && (
          <div className="border-t border-zinc-700 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-medium text-zinc-100">Files ({files.length})</h3>
              <div className="flex items-center space-x-2">
                {/* Upload Button */}
                {hasWaitingFiles && (
                  <button
                    onClick={handleUpload}
                    disabled={isUploading}
                    className={`cursor-pointer rounded-md bg-blue-600 px-6 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50`}
                  >
                    {isUploading ? (
                      <div className="flex items-center space-x-2">
                        <FontAwesomeIcon icon={faSpinner} className="h-4 w-4 animate-spin" />
                        <span>Uploading...</span>
                      </div>
                    ) : (
                      `Upload ${waitingFiles.length} file${waitingFiles.length === 1 ? "" : "s"}`
                    )}
                  </button>
                )}

                {/* Clear all button */}
                {files.length > 0 && (
                  <Button
                    variant="danger"
                    onClick={handleClearAll}
                    disabled={isUploading}
                    icon={faTrash}
                    label="Clear All"
                  />
                )}
              </div>
            </div>

            <div className="space-y-3">
              {files.map((file) => (
                <UploadFile key={file.id} file={file} isUploading={isUploading} onRemove={handleRemoveFile} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
