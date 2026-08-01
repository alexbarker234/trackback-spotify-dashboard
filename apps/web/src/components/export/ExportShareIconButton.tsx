"use client";

import { faShareNodes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

type ExportShareIconButtonProps = {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  title?: string;
};

export default function ExportShareIconButton({
  onClick,
  disabled = false,
  loading = false,
  title = "Export/share"
}: ExportShareIconButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      title={title}
      className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-white/10 p-2 text-white transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <FontAwesomeIcon icon={faShareNodes} className={`h-4 w-4 ${loading ? "animate-pulse" : ""}`} />
    </button>
  );
}
