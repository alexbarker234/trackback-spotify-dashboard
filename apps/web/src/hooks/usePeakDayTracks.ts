"use client";

import type { PeakDayTrack } from "@workspace/core/queries/tracks";
import axios from "axios";
import { useEffect, useState } from "react";

export type UsePeakDayTracksOptions = {
  startDate?: Date;
  endDate?: Date;
};

export function usePeakDayTracks(options: UsePeakDayTracksOptions) {
  const { startDate, endDate } = options;
  const [data, setData] = useState<PeakDayTrack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const params: Record<string, string> = {
          tzOffsetMinutes: String(new Date().getTimezoneOffset() * -1)
        };
        if (startDate) {
          params.startDate = startDate.toISOString();
        }
        if (endDate) {
          params.endDate = endDate.toISOString();
        }

        const response = await axios.get<PeakDayTrack[]>("/api/peak-day-tracks", { params });
        setData(response.data);
      } catch (err) {
        if (axios.isAxiosError(err) && err.response) {
          setError(err.response.data?.message || "Failed to fetch peak day tracks");
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An error occurred");
        }
        setData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [startDate, endDate]);

  return { data, isLoading, error };
}
