"use client";

import axios from "axios";
import { useEffect, useState } from "react";

export type PeriodListenStats = {
  totalListens: number;
  totalDuration: number;
  uniqueTracks: number;
  uniqueArtists: number;
  uniqueAlbums: number;
};

export type StatsDailyData = {
  date: string;
  streamCount: number;
  totalDuration: number;
};

export type StatsCumulativeData = {
  date: string;
  streamCount: number;
  totalDuration: number;
  cumulativeStreams: number;
  cumulativeDuration: number;
};

export type StatsMonthlyData = {
  month: string;
  monthNumber: number;
  streamCount: number;
  totalDuration: number;
};

export type StatsDayOfWeekData = {
  dayOfWeek: number;
  day: string;
  streamCount: number;
  totalDuration: number;
};

export type StatsHourlyData = {
  hour: number;
  listenCount: number;
  totalDuration: number;
};

export type StatsData = {
  summary: PeriodListenStats;
  daily: StatsDailyData[];
  cumulative: StatsCumulativeData[];
  monthly: StatsMonthlyData[];
  dayOfWeek: StatsDayOfWeekData[];
  hourly: StatsHourlyData[];
};

export type UseStatsDataOptions = {
  startDate?: Date;
  endDate?: Date;
};

export function useStatsData(options: UseStatsDataOptions) {
  const { startDate, endDate } = options;
  const [data, setData] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const params: Record<string, string> = {};
        if (startDate) {
          params.startDate = startDate.toISOString();
        }
        if (endDate) {
          params.endDate = endDate.toISOString();
        }

        const response = await axios.get<StatsData>("/api/stats", { params });
        setData(response.data);
      } catch (err) {
        if (axios.isAxiosError(err) && err.response) {
          setError(err.response.data?.message || "Failed to fetch stats");
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An error occurred");
        }
        setData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [startDate, endDate]);

  return { data, isLoading, error };
}
