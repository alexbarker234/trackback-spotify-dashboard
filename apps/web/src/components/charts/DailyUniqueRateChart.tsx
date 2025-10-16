"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import ChartTooltip from "./ChartTooltip";
import ExpandableChartContainer from "./ExpandableChartContainer";

interface DailyUniqueRateData {
  date: string;
  streamCount: number;
  uniqueTracks: number;
  uniqueArtists: number;
  trackUniqueRate?: number;
  artistUniqueRate?: number;
  movingAvgTrackRate?: number;
  movingAvgArtistRate?: number;
}

interface DailyUniqueRateChartProps {
  data: DailyUniqueRateData[];
  groupBy?: "day" | "week" | "month" | "year";
}

export default function DailyUniqueRateChart({ data, groupBy = "day" }: DailyUniqueRateChartProps) {
  const formatDate = (dateStr: string) => {
    // Handle different date formats based on groupBy
    if (groupBy === "week") {
      // Format: YYYY-WW (ISO week)
      const [year, week] = dateStr.split("-");
      return `${year} W${week}`;
    } else if (groupBy === "month") {
      // Format: YYYY-MM
      const date = new Date(dateStr + "-01");
      return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
    } else if (groupBy === "year") {
      // Format: YYYY
      return dateStr;
    } else {
      // Day format: YYYY-MM-DD
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    }
  };

  const getTitle = () => {
    switch (groupBy) {
      case "week":
        return "Weekly Listening Diversity";
      case "month":
        return "Monthly Listening Diversity";
      case "year":
        return "Yearly Listening Diversity";
      default:
        return "Daily Listening Diversity";
    }
  };

  const getSubtitle = () => {
    switch (groupBy) {
      case "week":
        return "Percentage of unique tracks and artists per week";
      case "month":
        return "Percentage of unique tracks and artists per month";
      case "year":
        return "Percentage of unique tracks and artists per year";
      default:
        return "Percentage of unique tracks and artists per day";
    }
  };

  // Calculate unique rates and moving averages
  const calculateRatesAndMovingAverages = (data: DailyUniqueRateData[]) => {
    // Determine window size based on grouping
    let windowSize: number;
    switch (groupBy) {
      case "week":
        windowSize = 4; // 4 weeks
        break;
      case "month":
        windowSize = 3; // 3 months (quarter)
        break;
      case "year":
        windowSize = 3; // 3 years
        break;
      default:
        windowSize = 28; // 28 days (4 weeks)
        break;
    }

    // First pass: calculate rates
    const dataWithRates = data.map((item) => {
      const trackUniqueRate = item.streamCount > 0 ? (item.uniqueTracks / item.streamCount) * 100 : 0;
      const artistUniqueRate = item.streamCount > 0 ? (item.uniqueArtists / item.streamCount) * 100 : 0;

      return {
        ...item,
        trackUniqueRate: Math.round(trackUniqueRate * 100) / 100,
        artistUniqueRate: Math.round(artistUniqueRate * 100) / 100
      };
    });

    // Second pass: calculate moving averages
    return dataWithRates.map((item, index) => {
      if (index < windowSize - 1) {
        return { ...item, movingAvgTrackRate: undefined, movingAvgArtistRate: undefined };
      }

      const windowData = dataWithRates.slice(index - windowSize + 1, index + 1);
      const avgTrackRate = windowData.reduce((sum, d) => sum + (d.trackUniqueRate || 0), 0) / windowSize;
      const avgArtistRate = windowData.reduce((sum, d) => sum + (d.artistUniqueRate || 0), 0) / windowSize;

      return {
        ...item,
        movingAvgTrackRate: Math.round(avgTrackRate * 100) / 100,
        movingAvgArtistRate: Math.round(avgArtistRate * 100) / 100
      };
    });
  };

  const getMovingAvgLabel = () => {
    switch (groupBy) {
      case "week":
        return "4-Week Avg";
      case "month":
        return "3-Month Avg";
      case "year":
        return "3-Year Avg";
      default:
        return "4-Week Avg";
    }
  };

  const processedData = calculateRatesAndMovingAverages(data);

  const CustomTooltip = ({
    active,
    payload,
    label
  }: {
    active?: boolean;
    payload?: Array<{ value: number; payload: DailyUniqueRateData; dataKey: string }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      const trackRateData = payload.find((p) => p.dataKey === "trackUniqueRate");
      const artistRateData = payload.find((p) => p.dataKey === "artistUniqueRate");
      const movingAvgTrackData = payload.find((p) => p.dataKey === "movingAvgTrackRate");
      const movingAvgArtistData = payload.find((p) => p.dataKey === "movingAvgArtistRate");
      const movingAvgLabel = getMovingAvgLabel();

      return (
        <ChartTooltip>
          <p className="text-sm font-medium text-gray-300">{formatDate(label)}</p>
          <p className="text-white">
            <span className="text-gray-400">Total Streams: </span>
            {trackRateData?.payload.streamCount}
          </p>
          <p className="text-white">
            <span className="text-gray-400">Track Unique Rate: </span>
            {trackRateData?.value.toFixed(1)}%
          </p>
          {movingAvgTrackData?.value && (
            <p className="text-white">
              <span className="text-gray-400">{movingAvgLabel} (Tracks): </span>
              {movingAvgTrackData.value.toFixed(1)}%
            </p>
          )}
          <p className="text-white">
            <span className="text-gray-400">Artist Unique Rate: </span>
            {artistRateData?.value.toFixed(1)}%
          </p>
          {movingAvgArtistData?.value && (
            <p className="text-white">
              <span className="text-gray-400">{movingAvgLabel} (Artists): </span>
              {movingAvgArtistData.value.toFixed(1)}%
            </p>
          )}
        </ChartTooltip>
      );
    }
    return null;
  };

  return (
    <ExpandableChartContainer title={getTitle()}>
      <div className="mb-4">
        <p className="text-sm text-gray-400">{getSubtitle()}</p>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={processedData}
          margin={{
            top: 10,
            right: 10,
            left: -30,
            bottom: 0
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
          <XAxis dataKey="date" tickFormatter={formatDate} stroke="#9CA3AF" fontSize={12} />
          <YAxis stroke="#9CA3AF" fontSize={12} domain={[0, 100]} />
          <Tooltip content={<CustomTooltip />} />
          <Line type="monotone" dataKey="trackUniqueRate" stroke="#10b981" dot={false} strokeWidth={2} />
          <Line type="monotone" dataKey="artistUniqueRate" stroke="#3b82f6" dot={false} strokeWidth={2} />
          <Line
            type="monotone"
            dataKey="movingAvgTrackRate"
            stroke="#eab308"
            dot={false}
            connectNulls={false}
            strokeWidth={2}
            strokeDasharray="5 5"
          />
          <Line
            type="monotone"
            dataKey="movingAvgArtistRate"
            stroke="#f97316"
            dot={false}
            connectNulls={false}
            strokeWidth={2}
            strokeDasharray="5 5"
          />
        </LineChart>
      </ResponsiveContainer>
    </ExpandableChartContainer>
  );
}
