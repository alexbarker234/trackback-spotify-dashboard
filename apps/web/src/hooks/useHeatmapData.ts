"use client";

import axios from "axios";
import { useEffect, useState } from "react";

export interface DailyData {
  date: string;
  streamCount: number;
  totalDuration: number;
}

export interface UseHeatmapDataOptions {
  year?: number;
}

export function useHeatmapData(options: UseHeatmapDataOptions = {}) {
  const { year } = options;
  const [data, setData] = useState<DailyData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setData([]);
        setIsLoading(true);
        setError(null);

        const params: { [key: string]: string } = {};
        if (year) {
          params["year"] = year.toString();
        }

        const response = await axios.get<DailyData[]>("/api/heatmap", { params });
        setData(response.data);
      } catch (err) {
        if (axios.isAxiosError(err) && err.response) {
          setError(err.response.data?.error || "Failed to fetch heatmap data");
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An error occurred");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [year]);

  return { data, isLoading, error };
}
