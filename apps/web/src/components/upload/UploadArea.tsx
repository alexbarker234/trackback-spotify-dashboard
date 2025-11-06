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
              console.log(
                `Upload progress: ${update.message} (${update.progress?.percentage || 0}%)`
              );
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
      <div className="rounded-2xl bg-white/5 shadow-lg backdrop-blur-sm">
        <div className="p-6">
          <h2 className="mb-2 bg-gradient-to-r from-pink-500 via-purple-500 to-yellow-500 bg-clip-text text-2xl font-bold text-transparent">
            Upload Spotify Data
          </h2>
          <p className="text-gray-400">
            Upload your Spotify Extended Streaming History JSON files to import your listening data.
          </p>
        </div>

        {/* Dropzone */}
        <UploadDropzone onDrop={onDrop} isUploading={isUploading} />

        {/* Global Progress */}
        {globalProgress && (
          <div className="border-t border-white/10 p-6">
            <div className="mb-4">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-lg font-medium text-white">Upload Progress</h3>
                <span className="text-sm text-gray-400">
                  {globalProgress.current} of {globalProgress.total} files
                </span>
              </div>
              <div className="mb-2 h-2 w-full rounded-full bg-white/10">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-pink-500 via-purple-500 to-yellow-500 transition-all duration-300"
                  style={{ width: `${globalProgress.percentage}%` }}
                />
              </div>
              <p className="text-sm text-gray-400">{globalProgress.message}</p>
            </div>
          </div>
        )}

        {/* Upload Summary */}
        {uploadMutation.isSuccess && uploadMutation.data && (
          <div className="mt-6 rounded-2xl border border-pink-500/30 bg-gradient-to-br from-pink-500/10 to-purple-500/10 p-4 backdrop-blur-sm">
            <h4 className="mb-2 font-medium text-pink-300">Upload Complete!</h4>
            <div className="space-y-1 text-sm text-gray-200">
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
          <div className="border-t border-white/10 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-medium text-white">Files ({files.length})</h3>
              <div className="flex items-center space-x-2">
                {/* Upload Button */}
                {hasWaitingFiles && (
                  <button
                    onClick={handleUpload}
                    disabled={isUploading}
                    className={`cursor-pointer rounded-md bg-gradient-to-r from-pink-500 to-purple-500 px-6 py-2 font-medium text-white transition-all disabled:cursor-not-allowed disabled:opacity-50`}
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
                <UploadFile
                  key={file.id}
                  file={file}
                  isUploading={isUploading}
                  onRemove={handleRemoveFile}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
