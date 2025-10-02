"use client";

import { type FileToUpload } from "@/hooks/useUploadFiles";
import { faCheck, faClock, faFile, faSpinner, faX } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface UploadFileProps {
  file: FileToUpload;
  isUploading: boolean;
  onRemove: (fileId: string) => void;
}

export default function UploadFile({ file, isUploading, onRemove }: UploadFileProps) {
  const getStatusIcon = (status: FileToUpload["status"]) => {
    switch (status) {
      case "waiting":
        return <FontAwesomeIcon icon={faClock} className="h-4 w-4 text-yellow-400" />;
      case "uploading":
        return <FontAwesomeIcon icon={faSpinner} className="h-4 w-4 animate-spin text-blue-400" />;
      case "uploaded":
        return <FontAwesomeIcon icon={faCheck} className="h-4 w-4 text-blue-400" />;
      case "complete":
        return <FontAwesomeIcon icon={faCheck} className="h-4 w-4 text-green-400" />;
      case "error":
        return <FontAwesomeIcon icon={faX} className="h-4 w-4 text-red-400" />;
      default:
        return <FontAwesomeIcon icon={faFile} className="h-4 w-4 text-zinc-400" />;
    }
  };

  const getStatusColor = (status: FileToUpload["status"]) => {
    switch (status) {
      case "waiting":
        return "border-yellow-700 bg-yellow-900/20";
      case "uploading":
        return "border-blue-700 bg-blue-900/20";
      case "uploaded":
        return "border-blue-700 bg-blue-900/20";
      case "complete":
        return "border-green-700 bg-green-900/20";
      case "error":
        return "border-red-700 bg-red-900/20";
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

  return (
    <div className={`flex items-center justify-between rounded-lg border p-4 ${getStatusColor(file.status)}`}>
      <div className="flex min-w-0 flex-1 items-center space-x-3">
        {getStatusIcon(file.status)}
        <div className="min-w-0 flex-1">
          {/* File name and file size */}
          <div className="mr-4 flex justify-between truncate text-sm font-medium text-zinc-100">
            <p>{file.file.name}</p>
            <p className="text-zinc-400">{formatFileSize(file.file.size)}</p>
          </div>
          {/* Progress */}
          <div className="flex items-center space-x-4 text-xs text-zinc-400">
            {file.status === "uploading" && file.progress !== undefined && <span>{file.progress}%</span>}
            {file.status === "uploaded" && <span>Uploaded</span>}
            {file.status === "complete" && <span>Complete</span>}
            {file.status === "waiting" && <span>Waiting</span>}
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
      {file.status === "waiting" && (
        <button
          onClick={() => onRemove(file.id)}
          disabled={isUploading}
          className="cursor-pointer text-zinc-400 transition-colors hover:text-red-400 disabled:opacity-50"
        >
          <FontAwesomeIcon icon={faX} className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
