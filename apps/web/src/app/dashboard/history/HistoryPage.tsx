"use client";

import Loading from "@/components/Loading";
import SlidingIndicatorSelector from "@/components/SlidingIndicatorSelector";
import { ListenSortOrder, useRecentListensInfinite } from "@/hooks/useRecentListensInfinite";
import { useSearchParams } from "next/navigation";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import { HistoryList } from "./HistoryList";

const sortOrderOptions = ["desc", "asc"] as const;

export default function HistoryPage() {
  const searchParams = useSearchParams();
  const type = searchParams.get("type");
  const id = searchParams.get("id");
  const name = searchParams.get("name");
  const [sort, setSort] = useQueryState(
    "sort",
    parseAsStringLiteral(sortOrderOptions).withDefault("desc")
  );

  const filters = {
    sort,
    artistId: type === "artist" ? (id ?? undefined) : undefined,
    albumId: type === "album" ? (id ?? undefined) : undefined,
    trackIsrc: type === "track" ? (id ?? undefined) : undefined
  };

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status, error } =
    useRecentListensInfinite(7, filters);

  return (
    <div className="mx-auto w-full max-w-5xl p-4">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-zinc-100 sm:text-3xl">
          {name ? `Listening history for ${name}` : "Listening History"}
        </h1>
        <SlidingIndicatorSelector<ListenSortOrder>
          options={[
            { value: "desc", label: "Descending" },
            { value: "asc", label: "Ascending" }
          ]}
          value={sort}
          onChange={(value) => {
            void setSort(value);
          }}
        />
      </div>

      {status === "pending" && <Loading />}
      {status === "error" && (
        <div className="p-4 text-red-400">{(error as Error).message}</div>
      )}
      {status === "success" && (
        <>
          <HistoryList
            pages={data?.pages}
            fetchNextPage={fetchNextPage}
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
          />

          {isFetchingNextPage && <Loading />}
          {!hasNextPage && <div className="py-6 text-center text-zinc-500">No more listens</div>}
        </>
      )}
    </div>
  );
}
