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
        return <FontAwesomeIcon icon={faSpinner} className="h-4 w-4 animate-spin text-purple-400" />;
      case "uploaded":
        return <FontAwesomeIcon icon={faCheck} className="h-4 w-4 text-purple-400" />;
      case "complete":
        return <FontAwesomeIcon icon={faCheck} className="h-4 w-4 text-pink-400" />;
      case "error":
        return <FontAwesomeIcon icon={faX} className="h-4 w-4 text-red-400" />;
      default:
        return <FontAwesomeIcon icon={faFile} className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: FileToUpload["status"]) => {
    switch (status) {
      case "waiting":
        return "border-yellow-500/30 bg-gradient-to-br from-yellow-500/10 to-orange-500/10";
      case "uploading":
        return "border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-pink-500/10";
      case "uploaded":
        return "border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-pink-500/10";
      case "complete":
        return "border-pink-500/30 bg-gradient-to-br from-pink-500/10 to-rose-500/10";
      case "error":
        return "border-red-500/30 bg-gradient-to-br from-red-500/10 to-pink-500/10";
      default:
        return "border-white/10 bg-white/5";
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
    <div
      className={`flex items-center justify-between rounded-2xl border p-4 backdrop-blur-sm transition-all ${getStatusColor(file.status)}`}
    >
      <div className="flex min-w-0 flex-1 items-center space-x-3">
        {getStatusIcon(file.status)}
        <div className="min-w-0 flex-1">
          {/* File name and file size */}
          <div className="mr-4 flex justify-between truncate text-sm font-medium text-white">
            <p>{file.file.name}</p>
            <p className="text-gray-400">{formatFileSize(file.file.size)}</p>
          </div>
          {/* Progress */}
          <div className="flex items-center space-x-4 text-xs text-gray-400">
            {file.status === "uploading" && file.progress !== undefined && <span>Uploading...</span>}
            {file.status === "uploaded" && <span>Uploaded</span>}
            {file.status === "complete" && <span>Complete</span>}
            {file.status === "waiting" && <span>Waiting</span>}
          </div>
        </div>
      </div>
      {file.status === "waiting" && (
        <button
          onClick={() => onRemove(file.id)}
          disabled={isUploading}
          className="cursor-pointer text-gray-400 transition-colors hover:text-red-400 disabled:opacity-50"
        >
          <FontAwesomeIcon icon={faX} className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
