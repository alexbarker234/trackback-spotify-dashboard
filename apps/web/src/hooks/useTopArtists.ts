"use client";

import { useEffect, useState } from "react";

export type DateRange = "4weeks" | "6months" | "lifetime";

export type TopArtist = {
  artistName: string;
  artistId: string;
  artistImageUrl: string | null;
  listenCount: number;
};

export type UseTopArtistsOptions = {
  dateRange?: DateRange;
  offset?: number;
};

export function useTopArtists(options: UseTopArtistsOptions = {}) {
  const { dateRange = "4weeks", offset = 0 } = options;
  const [data, setData] = useState<TopArtist[]>([]);
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
  }, [dateRange, offset]);

  return { data, isLoading, error };
}
