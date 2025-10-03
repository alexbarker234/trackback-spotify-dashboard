"use client";
import html2canvas from "html2canvas-pro";
import Image from "next/image";
import { useRef, useState } from "react";

type Theme = "light" | "dark";

type SummaryData = {
  month: string;
  totalMinutes: number;
  totalTracks: number;
  topArtists: Array<{
    name: string;
    plays: number;
    image: string | null;
  }>;
  topTracks: Array<{
    name: string;
    artist: string;
    plays: number;
    image: string | null;
  }>;
  listeningHours: Array<{
    hour: number;
    plays: number;
  }>;
};

interface LastMonthSummaryProps {
  data: SummaryData;
}

const exportAsPNG = (element: HTMLDivElement) => {
  html2canvas(element).then((canvas) => {
    const link = document.createElement("a");
    link.download = "spotify-summary.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  });
};

export default function LastMonthSummary({ data }: LastMonthSummaryProps) {
  const componentRef = useRef<HTMLDivElement>(null);
  const [theme, setTheme] = useState<Theme>("dark");

  const containerClasses =
    theme === "light"
      ? "mx-auto max-w-4xl rounded-3xl bg-emerald-500 p-8 text-white"
      : "mx-auto max-w-4xl rounded-3xl bg-gradient-to-b from-gray-700 to-gray-100 p-8 text-white";

  const statCardClasses =
    theme === "light"
      ? "rounded-2xl bg-white bg-opacity-20 p-6 text-center"
      : "rounded-2xl bg-gray-400 p-6 text-center text-gray-800";

  const artistCardClasses =
    theme === "light"
      ? "mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-white bg-opacity-20"
      : "mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-gray-400";

  const trackCardClasses =
    theme === "light"
      ? "flex items-center justify-between rounded-xl bg-white bg-opacity-20 p-3"
      : "flex items-center justify-between rounded-xl bg-gray-400 p-3 text-gray-800";

  const chartCardClasses = theme === "light" ? "rounded-2xl bg-white bg-opacity-20 p-6" : "rounded-2xl bg-gray-400 p-6";

  return (
    <div className="p-6">
      <div ref={componentRef} className={containerClasses}>
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-bold">Your {data.month} Summary</h1>
          <p className="text-lg text-green-100">Powered by Spotify</p>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid grid-cols-2 gap-6">
          <div className={statCardClasses}>
            <div className="text-3xl font-bold text-white">{Math.floor(data.totalMinutes / 60)}</div>
            <div className="text-sm text-gray-300">Hours Listened</div>
          </div>
          <div className={statCardClasses}>
            <div className="text-3xl font-bold text-white">{data.totalTracks}</div>
            <div className="text-sm text-gray-300">Tracks Played</div>
          </div>
        </div>

        {/* Top Artists */}
        <div className="mb-8">
          <h2 className="mb-4 text-2xl font-bold">Top Artists</h2>
          <div className="grid grid-cols-5 gap-4">
            {data.topArtists.map((artist, index) => (
              <div key={index} className="text-center">
                <div className={artistCardClasses}>
                  {artist.image ? (
                    <Image
                      src={artist.image}
                      alt={artist.name}
                      className="h-16 w-16 rounded-full object-cover"
                      width={64}
                      height={64}
                    />
                  ) : (
                    <span className="text-2xl font-bold text-white">{artist.name.charAt(0)}</span>
                  )}
                </div>
                <div className="truncate text-sm font-medium">{artist.name}</div>
                <div className="text-xs text-gray-300">{artist.plays} plays</div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Tracks */}
        <div className="mb-8">
          <h2 className="mb-4 text-2xl font-bold">Top Tracks</h2>
          <div className="space-y-2">
            {data.topTracks.map((track, index) => (
              <div key={index} className={trackCardClasses}>
                <div className="flex items-center space-x-3">
                  <div className="bg-opacity-20 flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm font-bold text-white">
                    {index + 1}
                  </div>
                  {track.image && (
                    <Image
                      src={track.image}
                      alt={track.name}
                      className="h-12 w-12 rounded object-cover"
                      width={48}
                      height={48}
                    />
                  )}
                  <div>
                    <div className="font-medium text-white">{track.name}</div>
                    <div className="text-sm text-gray-200">{track.artist}</div>
                  </div>
                </div>
                <div className="text-sm text-gray-200">{track.plays} plays</div>
              </div>
            ))}
          </div>
        </div>

        {/* Listening Hours Chart */}
        <div className="mb-8">
          <h2 className="mb-4 text-2xl font-bold">Listening Activity</h2>
          <div className={chartCardClasses}>
            <div className="flex h-32 items-end justify-between">
              {data.listeningHours.map((hourData, index) => (
                <div key={index} className="flex h-full flex-col items-end">
                  <div
                    className="mt-auto mb-1 w-3 rounded-t-sm bg-emerald-400"
                    style={{ height: `${(hourData.plays / 62) * 100}%` }}
                  />
                  <div className="origin-left transform text-xs text-gray-600">{hourData.hour}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-300">
          <p>Generated on {new Date().toLocaleDateString()}</p>
        </div>
      </div>

      {/* Theme Selector */}
      <div className="mx-auto w-fit">
        <div className="rounded-lg border bg-white p-2 shadow-lg dark:bg-gray-800">
          <div className="flex gap-2">
            <button
              onClick={() => setTheme("light")}
              className={`cursor-pointer rounded px-3 py-1 text-sm font-medium transition-colors disabled:cursor-not-allowed ${
                theme === "light" ? "bg-emerald-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Light
            </button>
            <button
              onClick={() => setTheme("dark")}
              className={`cursor-pointer rounded px-3 py-1 text-sm font-medium transition-colors disabled:cursor-not-allowed ${
                theme === "dark" ? "bg-emerald-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Dark
            </button>
          </div>
        </div>
      </div>
      <div className="mx-auto mt-6 w-fit text-center">
        <button
          onClick={() => exportAsPNG(componentRef.current!)}
          className="cursor-pointer rounded-xl bg-green-500 px-6 py-3 font-medium text-white transition-colors hover:bg-green-600 disabled:cursor-not-allowed"
        >
          Export as PNG
        </button>
      </div>
    </div>
  );
}
