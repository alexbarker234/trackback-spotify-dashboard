"use client";

import Loading from "@/components/Loading";
import { useRecentListensInfinite } from "@/hooks/useRecentListensInfinite";
import { useSearchParams } from "next/navigation";
import { HistoryList } from "./HistoryList";

export default function HistoryPage({ isStandalone }: { isStandalone: boolean }) {
  const searchParams = useSearchParams();
  const type = searchParams.get("type");
  const id = searchParams.get("id");
  const name = searchParams.get("name");

  const filters =
    type === "artist"
      ? { artistId: id ?? undefined }
      : type === "album"
        ? { albumId: id ?? undefined }
        : type === "track"
          ? { trackIsrc: id ?? undefined }
          : undefined;

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status, error } =
    useRecentListensInfinite(7, filters);

  if (status === "pending") {
    return <Loading />;
  }

  if (status === "error") {
    return <div className="p-4 text-red-400">{(error as Error).message}</div>;
  }

  return (
    <div className="mx-auto w-full max-w-5xl p-4">
      <h1 className="mb-4 text-2xl font-bold text-zinc-100 sm:text-3xl">
        {name ? `Listening history for ${name}` : "Listening History"}
      </h1>

      <HistoryList
        pages={data?.pages}
        fetchNextPage={fetchNextPage}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
      />

      {isFetchingNextPage && <Loading />}
      {!hasNextPage && <div className="py-6 text-center text-zinc-500">No more listens</div>}
    </div>
  );
}
