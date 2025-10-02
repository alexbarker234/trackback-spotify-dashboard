"use client";

import { useUploadFiles, type FileToUpload, type UploadResponse } from "@/hooks/useUploadFiles";
import { faCheck, faClock, faFile, faUpload, faX } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

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

export default function UploadDropzone() {
  const [files, setFiles] = useState<FileToUpload[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const uploadMutation = useUploadFiles();
  console.log(files);
  // Handle successful upload
  const handleUploadSuccess = (data: UploadResponse) => {
    // Update file statuses based on results
    setFiles((prevFiles) =>
      prevFiles.map((file) => {
        const fileResult = data.results.fileResults.find((result) => result.filename === file.file.name);

        if (fileResult) {
          return {
            ...file,
            status: fileResult.errors.length > 0 ? "error" : "success",
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
      status: "pending" as const
    }));

    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/json": [".json"]
    },
    multiple: true,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false)
  });

  const handleUpload = () => {
    const pendingFiles = files.filter((file) => file.status === "pending");
    if (pendingFiles.length > 0) {
      handleUploadStart();
      uploadMutation.mutate(
        {
          files: pendingFiles.map((file) => file.file),
          onProgress: (update: ProgressUpdate) => {
            if (update.type === "progress" && update.progress) {
              // Update progress for all uploading files
              setFiles((prevFiles) =>
                prevFiles.map((file) => ({
                  ...file,
                  progress: update.progress?.percentage || 0
                }))
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

  const getStatusIcon = (status: FileToUpload["status"]) => {
    switch (status) {
      case "success":
        return <FontAwesomeIcon icon={faCheck} className="h-4 w-4 text-green-400" />;
      case "error":
        return <FontAwesomeIcon icon={faX} className="h-4 w-4 text-red-400" />;
      case "uploading":
        return <FontAwesomeIcon icon={faClock} className="h-4 w-4 animate-spin text-blue-400" />;
      default:
        return <FontAwesomeIcon icon={faFile} className="h-4 w-4 text-zinc-400" />;
    }
  };

  const getStatusColor = (status: FileToUpload["status"]) => {
    switch (status) {
      case "success":
        return "border-green-700 bg-green-900/20";
      case "error":
        return "border-red-700 bg-red-900/20";
      case "uploading":
        return "border-blue-700 bg-blue-900/20";
      default:
        return "border-zinc-700 bg-zinc-700/50";
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const pendingFiles = files.filter((f) => f.status === "pending");
  const hasPendingFiles = pendingFiles.length > 0;
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
        <div
          {...getRootProps()}
          className={`relative cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
            isDragActive || dragActive ? "border-blue-400 bg-blue-900/20" : "border-zinc-600 hover:border-zinc-500"
          } ${isUploading ? "pointer-events-none opacity-50" : ""} `}
        >
          <input {...getInputProps()} />
          <div className="space-y-4">
            <FontAwesomeIcon icon={faUpload} className="mx-auto h-12 w-12 text-zinc-400" />
            <div>
              <p className="text-lg font-medium text-zinc-100">
                {isDragActive ? "Drop files here" : "Drag & drop JSON files here"}
              </p>
              <p className="mt-1 text-sm text-zinc-400">or click to select files</p>
              <p className="mt-2 text-xs text-zinc-500">Supports multiple files • JSON format only</p>
            </div>
          </div>
        </div>

        {/* File List */}
        {files.length > 0 && (
          <div className="border-t border-zinc-700 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-medium text-zinc-100">Files ({files.length})</h3>
              {files.length > 0 && (
                <button
                  onClick={handleClearAll}
                  disabled={isUploading}
                  className="text-sm text-red-400 hover:text-red-300 disabled:opacity-50"
                >
                  Clear All
                </button>
              )}
            </div>

            <div className="space-y-3">
              {files.map((file) => (
                <div
                  key={file.id}
                  className={`flex items-center justify-between rounded-lg border p-4 ${getStatusColor(file.status)} `}
                >
                  <div className="flex min-w-0 flex-1 items-center space-x-3">
                    {getStatusIcon(file.status)}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-zinc-100">{file.file.name}</p>
                      <div className="flex items-center space-x-4 text-xs text-zinc-400">
                        <span>{formatFileSize(file.file.size)}</span>
                        {file.status === "uploading" && file.progress !== undefined && <span>{file.progress}%</span>}
                      </div>
                      {file.status === "uploading" && file.progress !== undefined && (
                        <div className="mt-1 h-1 w-full rounded-full bg-zinc-700">
                          <div
                            className="h-1 rounded-full bg-blue-500 transition-all duration-300"
                            style={{ width: `${file.progress}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  {file.status === "pending" && (
                    <button
                      onClick={() => handleRemoveFile(file.id)}
                      disabled={isUploading}
                      className="text-zinc-400 hover:text-red-400 disabled:opacity-50"
                    >
                      <FontAwesomeIcon icon={faX} className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Upload Button */}
            {hasPendingFiles && (
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleUpload}
                  disabled={isUploading}
                  className={`rounded-md px-6 py-2 font-medium text-white transition-colors ${
                    isUploading ? "cursor-not-allowed bg-zinc-600" : "bg-blue-600 hover:bg-blue-700"
                  } `}
                >
                  {isUploading ? (
                    <div className="flex items-center space-x-2">
                      <FontAwesomeIcon icon={faClock} className="h-4 w-4 animate-spin" />
                      <span>Uploading...</span>
                    </div>
                  ) : (
                    `Upload ${pendingFiles.length} file${pendingFiles.length === 1 ? "" : "s"}`
                  )}
                </button>
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
          </div>
        )}
      </div>
    </div>
  );
}
