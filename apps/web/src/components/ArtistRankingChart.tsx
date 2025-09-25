"use client";

import { formatDuration } from "@/lib/utils/timeUtils";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface ArtistRankingData {
  artistId: string;
  artistName: string;
  streamCount: number;
  totalDuration: number;
  imageUrl: string | null;
}

interface ArtistRankingChartProps {
  data: ArtistRankingData[];
}

export default function ArtistRankingChart({ data }: ArtistRankingChartProps) {
  const formatDurationFromMS = (ms: number) => {
    return formatDuration(ms);
  };

  const CustomTooltip = ({
    active,
    payload
  }: {
    active?: boolean;
    payload?: Array<{ value: number; payload: ArtistRankingData }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      const artist = payload[0].payload;
      return (
        <div className="rounded-lg border border-zinc-700 bg-zinc-800 p-3 shadow-lg">
          <div className="mb-2 flex items-center gap-3">
            {artist.imageUrl && (
              <img
                src={artist.imageUrl}
                alt={`${artist.artistName} profile`}
                className="h-8 w-8 rounded-full object-cover"
              />
            )}
            <p className="text-sm font-medium text-zinc-100">{artist.artistName}</p>
          </div>
          <p className="text-zinc-100">
            <span className="text-zinc-400">Streams: </span>
            {payload[0].value.toLocaleString()}
          </p>
          <p className="text-zinc-100">
            <span className="text-zinc-400">Duration: </span>
            {formatDurationFromMS(artist.totalDuration)}
          </p>
        </div>
      );
    }
    return null;
  };

  // Take top 15 for better visualization in column chart
  const chartData = data.slice(0, 15).map((artist, index) => ({
    ...artist,
    rank: index + 1,
    displayName: artist.artistName.length > 15 ? `${artist.artistName.substring(0, 15)}...` : artist.artistName
  }));

  return (
    <div className="rounded-lg bg-zinc-800 p-6">
      <h3 className="mb-4 text-lg font-semibold text-zinc-100">Top Artists by Streams</h3>
      <div className="h-[500px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{
              top: 10,
              right: 30,
              left: 20,
              bottom: 60
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="displayName" stroke="#9CA3AF" fontSize={12} angle={-45} textAnchor="end" height={60} />
            <YAxis stroke="#9CA3AF" fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="streamCount" fill="#3B82F6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
