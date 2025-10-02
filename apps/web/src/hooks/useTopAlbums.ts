"use client";

import { useEffect, useState } from "react";

export type TopAlbum = {
  albumName: string;
  albumId: string;
  albumImageUrl: string | null;
  artistNames: string[];
  listenCount: number;
  totalDuration: number;
};

export type UseTopAlbumsOptions = {
  startDate?: Date;
  endDate?: Date;
};

export function useTopAlbums(options: UseTopAlbumsOptions = {}) {
  const { startDate, endDate } = options;
  const [data, setData] = useState<TopAlbum[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const params = new URLSearchParams();
        if (startDate) {
          params.set("startDate", startDate.toISOString());
        }
        if (endDate) {
          params.set("endDate", endDate.toISOString());
        }

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
  }, [startDate, endDate]);

  return { data, isLoading, error };
}
