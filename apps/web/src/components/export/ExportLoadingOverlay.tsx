"use client";

import Loading from "../Loading";

export default function ExportLoadingOverlay({ label = "Preparing export…" }: { label?: string }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-3 rounded-2xl bg-white/10 px-8 py-6">
        <Loading />
        <p className="text-sm text-gray-300">{label}</p>
      </div>
    </div>
  );
}
