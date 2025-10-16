"use client";

import { Area, AreaChart, CartesianGrid, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import ChartTooltip from "./ChartTooltip";
import ExpandableChartContainer from "./ExpandableChartContainer";

interface DailyUniqueStreamData {
  date: string;
  uniqueTracks: number;
  uniqueArtists: number;
  movingAvgTracks?: number;
  movingAvgArtists?: number;
}

interface DailyUniqueStreamsChartProps {
  data: DailyUniqueStreamData[];
}

export default function DailyUniqueStreamsChart({ data }: DailyUniqueStreamsChartProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  // Calculate 4-week (28-day) moving averages
  const calculateMovingAverages = (data: DailyUniqueStreamData[]) => {
    const windowSize = 28;
    return data.map((item, index) => {
      if (index < windowSize - 1) {
        return { ...item, movingAvgTracks: undefined, movingAvgArtists: undefined };
      }

      const windowData = data.slice(index - windowSize + 1, index + 1);
      const avgTracks = windowData.reduce((sum, d) => sum + d.uniqueTracks, 0) / windowSize;
      const avgArtists = windowData.reduce((sum, d) => sum + d.uniqueArtists, 0) / windowSize;

      return {
        ...item,
        movingAvgTracks: Math.round(avgTracks * 100) / 100,
        movingAvgArtists: Math.round(avgArtists * 100) / 100
      };
    });
  };

  const dataWithMovingAverages = calculateMovingAverages(data);

  const CustomTooltip = ({
    active,
    payload,
    label
  }: {
    active?: boolean;
    payload?: Array<{ value: number; payload: DailyUniqueStreamData; dataKey: string }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      const tracksData = payload.find((p) => p.dataKey === "uniqueTracks");
      const artistsData = payload.find((p) => p.dataKey === "uniqueArtists");
      const movingAvgTracksData = payload.find((p) => p.dataKey === "movingAvgTracks");
      const movingAvgArtistsData = payload.find((p) => p.dataKey === "movingAvgArtists");

      return (
        <ChartTooltip>
          <p className="text-sm font-medium text-gray-300">{formatDate(label)}</p>
          <p className="text-white">
            <span className="text-gray-400">Unique Tracks: </span>
            {tracksData?.value}
          </p>
          {movingAvgTracksData?.value && (
            <p className="text-white">
              <span className="text-gray-400">4-Week Avg (Tracks): </span>
              {movingAvgTracksData.value}
            </p>
          )}
          <p className="text-white">
            <span className="text-gray-400">Unique Artists: </span>
            {artistsData?.value}
          </p>
          {movingAvgArtistsData?.value && (
            <p className="text-white">
              <span className="text-gray-400">4-Week Avg (Artists): </span>
              {movingAvgArtistsData.value}
            </p>
          )}
        </ChartTooltip>
      );
    }
    return null;
  };

  return (
    <ExpandableChartContainer title="Daily Unique Streams">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={dataWithMovingAverages}
          margin={{
            top: 10,
            right: 10,
            left: -30,
            bottom: 0
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
          <XAxis dataKey="date" tickFormatter={formatDate} stroke="#9CA3AF" fontSize={12} />
          <YAxis stroke="#9CA3AF" fontSize={12} />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="uniqueTracks"
            stroke="#10b981"
            fill="#10b981"
            fillOpacity={0.3}
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="uniqueArtists"
            stroke="#3b82f6"
            fill="#3b82f6"
            fillOpacity={0.3}
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="movingAvgTracks"
            stroke="#eab308"
            dot={false}
            connectNulls={false}
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="movingAvgArtists"
            stroke="#f97316"
            dot={false}
            connectNulls={false}
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ExpandableChartContainer>
  );
}
