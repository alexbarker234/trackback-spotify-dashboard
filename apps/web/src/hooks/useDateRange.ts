"use client";

import { parseAsInteger, parseAsStringLiteral, useQueryState } from "nuqs";
import { useMemo } from "react";

const dateRangeOptions = ["4weeks", "6months", "year", "lifetime"] as const;
export type DateRange = (typeof dateRangeOptions)[number];

export type UseDateRangeOptions = {
  initialDateRange?: DateRange;
  initialPeriod?: number;
};

export function useDateRange(options: UseDateRangeOptions = {}) {
  const { initialDateRange = "4weeks", initialPeriod = 0 } = options;

  const [dateRange, setDateRange] = useQueryState<DateRange>(
    "dateRange",
    parseAsStringLiteral(dateRangeOptions).withDefault(initialDateRange)
  );
  const [currentPeriod, setCurrentPeriod] = useQueryState("currentPeriod", parseAsInteger.withDefault(initialPeriod));

  // Calculate start and end dates based on dateRange and currentPeriod
  const { startDate, endDate } = useMemo(() => {
    const now = new Date();
    let start: Date | undefined;
    let end: Date | undefined = now;

    if (dateRange === "4weeks") {
      start = new Date();
      start.setDate(start.getDate() - (28 + currentPeriod * 28));
    } else if (dateRange === "6months") {
      start = new Date();
      start.setMonth(start.getMonth() - (6 + currentPeriod * 6));
    } else if (dateRange === "year") {
      const currentYear = new Date().getFullYear();
      const targetYear = currentYear - currentPeriod;
      start = new Date(targetYear, 0, 1); // January 1st of target year
      end = new Date(targetYear, 11, 31, 23, 59, 59); // December 31st of target year
    } else if (dateRange === "lifetime") {
      start = undefined;
      end = undefined;
    }

    return { startDate: start, endDate: end };
  }, [dateRange, currentPeriod]);

  const handleDateRangeChange = (newRange: DateRange) => {
    setDateRange(newRange);
    setCurrentPeriod(0); // Reset to current period when changing range
  };

  const handlePreviousPeriod = () => {
    setCurrentPeriod((prev) => prev + 1);
  };

  const handleNextPeriod = () => {
    setCurrentPeriod((prev) => Math.max(0, prev - 1));
  };

  return {
    dateRange,
    currentPeriod,
    startDate,
    endDate,
    handleDateRangeChange,
    handlePreviousPeriod,
    handleNextPeriod
  };
}
