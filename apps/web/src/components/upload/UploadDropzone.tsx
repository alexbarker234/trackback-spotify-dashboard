"use client";

import { faUpload } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";

interface UploadDropzoneProps {
  onDrop: (acceptedFiles: File[]) => void;
  isUploading: boolean;
}

export default function UploadDropzone({ onDrop, isUploading }: UploadDropzoneProps) {
  const onDropCallback = useCallback(
    (acceptedFiles: File[]) => {
      console.log("acceptedFiles", acceptedFiles);
      onDrop(acceptedFiles);
    },
    [onDrop]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onDropCallback,
    accept: {
      "application/json": [".json"]
    },
    multiple: true,
    onDragEnter: () => {},
    onDragLeave: () => {}
  });

  return (
    <div
      {...getRootProps()}
      className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
        isDragActive
          ? "border-pink-400 bg-gradient-to-br from-pink-500/20 to-purple-500/20 backdrop-blur-sm"
          : "border-white/20 hover:border-pink-400/50 hover:bg-white/5"
      } ${isUploading ? "pointer-events-none opacity-50" : ""} `}
    >
      <input {...getInputProps()} />
      <div className="space-y-4">
        <FontAwesomeIcon icon={faUpload} className="mx-auto h-12 w-12 text-gray-400" />
        <div>
          <p className="text-lg font-medium text-white">
            {isDragActive ? "Drop files here" : "Drag & drop JSON files here"}
          </p>
          <p className="mt-1 text-sm text-gray-400">or click to select files</p>
          <p className="mt-2 text-xs text-gray-500">Supports multiple files • JSON format only</p>
        </div>
      </div>
    </div>
  );
}
