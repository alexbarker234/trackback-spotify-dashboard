"use client";

import Loading from "@/components/Loading";
import { useRecentListensInfinite } from "@/hooks/useRecentListensInfinite";
import { HistoryList } from "./HistoryList";

export default function Page() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status, error } =
    useRecentListensInfinite(7);

  if (status === "pending") {
    return <Loading />;
  }

  if (status === "error") {
    return <div className="p-4 text-red-400">{(error as Error).message}</div>;
  }

  return (
    <div className="mx-auto w-full max-w-5xl p-4">
      <h1 className="mb-4 text-3xl font-bold text-zinc-100">Listening History</h1>

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
