"use client";

import type { WeeklyRecap } from "@workspace/core/queries/recap";
import axios from "axios";
import { useEffect, useState } from "react";

export type UseWeeklyRecapOptions = {
  startDate: Date;
  endDate: Date;
  compareStartDate: Date;
  compareEndDate: Date;
};

export function useWeeklyRecap({
  startDate,
  endDate,
  compareStartDate,
  compareEndDate
}: UseWeeklyRecapOptions) {
  const startKey = startDate.toISOString();
  const endKey = endDate.toISOString();
  const compareStartKey = compareStartDate.toISOString();
  const compareEndKey = compareEndDate.toISOString();

  const [data, setData] = useState<WeeklyRecap | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchRecap = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await axios.get<WeeklyRecap>("/api/recap", {
          params: {
            startDate: startKey,
            endDate: endKey,
            compareStartDate: compareStartKey,
            compareEndDate: compareEndKey,
            tzOffsetMinutes: String(new Date().getTimezoneOffset() * -1)
          }
        });

        if (!cancelled) setData(response.data);
      } catch (err) {
        if (cancelled) return;
        if (axios.isAxiosError(err) && err.response) {
          setError(err.response.data?.error || "Failed to fetch recap");
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An error occurred");
        }
        setData(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void fetchRecap();

    return () => {
      cancelled = true;
    };
  }, [startKey, endKey, compareStartKey, compareEndKey]);

  return { data, isLoading, error };
}
