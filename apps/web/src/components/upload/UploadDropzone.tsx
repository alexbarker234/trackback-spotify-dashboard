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
      className={`relative cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
        isDragActive ? "border-blue-400 bg-blue-900/20" : "border-zinc-600 hover:border-zinc-500"
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
  );
}
