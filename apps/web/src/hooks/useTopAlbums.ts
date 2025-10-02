"use client";

import { useEffect, useState } from "react";

export type DateRange = "4weeks" | "6months" | "lifetime";

export type TopAlbum = {
  albumName: string;
  albumId: string;
  albumImageUrl: string | null;
  artistNames: string[];
  listenCount: number;
};

export type UseTopAlbumsOptions = {
  dateRange?: DateRange;
  offset?: number;
};

export function useTopAlbums(options: UseTopAlbumsOptions = {}) {
  const { dateRange = "4weeks", offset = 0 } = options;
  const [data, setData] = useState<TopAlbum[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const params = new URLSearchParams({
          dateRange,
          offset: offset.toString()
        });

        const response = await fetch(`/api/top-albums?${params}`);

        if (!response.ok) {
          throw new Error("Failed to fetch top albums");
        }

        const albums = await response.json();
        setData(albums);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [dateRange, offset]);

  return { data, isLoading, error };
}
