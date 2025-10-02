"use client";

import { useEffect, useState } from "react";

export type TopArtist = {
  artistName: string;
  artistId: string;
  artistImageUrl: string | null;
  listenCount: number;
  totalDuration: number;
};

export type UseTopArtistsOptions = {
  startDate?: Date;
  endDate?: Date;
};

export function useTopArtists(options: UseTopArtistsOptions = {}) {
  const { startDate, endDate } = options;
  const [data, setData] = useState<TopArtist[]>([]);
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

        const response = await fetch(`/api/top-artists?${params}`);

        if (!response.ok) {
          throw new Error("Failed to fetch top artists");
        }

        const artists = await response.json();
        setData(artists);
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
