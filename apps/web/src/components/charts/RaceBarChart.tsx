"use client";

import { WeeklyTopArtist } from "@workspace/core/queries/artists";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import ChartTooltip from "./ChartTooltip";
import ExpandableChartContainer from "./ExpandableChartContainer";

interface RaceBarChartProps {
  data: WeeklyTopArtist[];
  animationSpeed?: number; // milliseconds between frames
}

export default function RaceBarChart({ data, animationSpeed = 1000 }: RaceBarChartProps) {
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  // Group data by week
  const weeklyData = data.reduce(
    (acc, item) => {
      if (!acc[item.week]) {
        acc[item.week] = [];
      }
      acc[item.week].push(item);
      return acc;
    },
    {} as Record<string, WeeklyTopArtist[]>
  );

  const weeks = Object.keys(weeklyData).sort();
  const currentWeek = weeks[currentWeekIndex];
  const currentData = currentWeek ? weeklyData[currentWeek] : [];

  // Auto-play animation
  useEffect(() => {
    if (!isPlaying || weeks.length === 0) return;

    const interval = setInterval(() => {
      setCurrentWeekIndex((prev) => (prev + 1) % weeks.length);
    }, animationSpeed);

    return () => clearInterval(interval);
  }, [isPlaying, weeks.length, animationSpeed]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handlePrevious = () => {
    setCurrentWeekIndex((prev) => (prev - 1 + weeks.length) % weeks.length);
  };

  const handleNext = () => {
    setCurrentWeekIndex((prev) => (prev + 1) % weeks.length);
  };

  const formatWeek = (weekString: string) => {
    const date = new Date(weekString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const artist = payload[0].payload;
      return (
        <ChartTooltip>
          <div className="mb-2 flex items-center gap-3">
            {artist.artistImageUrl && (
              <img
                src={artist.artistImageUrl}
                alt={`${artist.artistName} profile`}
                className="h-8 w-8 rounded-full object-cover"
              />
            )}
            <p className="text-sm font-medium text-white">{artist.artistName}</p>
          </div>
          <p className="text-white">
            <span className="text-gray-400">Rank: </span>#{artist.rank}
          </p>
          <p className="text-white">
            <span className="text-gray-400">Streams: </span>
            {artist.listenCount.toLocaleString()}
          </p>
        </ChartTooltip>
      );
    }
    return null;
  };

  return (
    <ExpandableChartContainer title="Top Artists Race Over Time" chartHeight="h-[600px]">
      <div className="h-full w-full">
        {/* Controls */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handlePlayPause}
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg bg-white/10 text-white transition-colors hover:bg-white/20 disabled:cursor-not-allowed"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>

            <button
              onClick={handlePrevious}
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg bg-white/10 text-white transition-colors hover:bg-white/20 disabled:cursor-not-allowed"
              disabled={currentWeekIndex === 0}
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            <button
              onClick={handleNext}
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg bg-white/10 text-white transition-colors hover:bg-white/20 disabled:cursor-not-allowed"
              disabled={currentWeekIndex === weeks.length - 1}
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>

          <div className="text-right">
            <p className="text-sm text-gray-400">
              Week {currentWeekIndex + 1} of {weeks.length}
            </p>
            <p className="text-lg font-semibold text-white">
              {currentWeek ? formatWeek(currentWeek) : "No data"}
            </p>
          </div>
        </div>

        {/* Chart */}
        <div className="h-[calc(100%-4rem)] w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentWeek}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="h-full w-full"
            >
              <div className="h-full w-full space-y-2">
                {currentData.map((artist, index) => (
                  <motion.div
                    key={`${artist.artistId}-${currentWeek}`}
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      duration: 0.5,
                      delay: index * 0.1,
                      ease: "easeOut"
                    }}
                    className="flex items-center gap-4"
                  >
                    {/* Rank */}
                    <div className="flex w-8 items-center justify-center">
                      <span className="text-sm font-bold text-white">#{artist.rank}</span>
                    </div>

                    {/* Artist Image */}
                    <div className="flex h-12 w-12 items-center justify-center">
                      {artist.artistImageUrl ? (
                        <img
                          src={artist.artistImageUrl}
                          alt={`${artist.artistName} profile`}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-600">
                          <span className="text-xs text-gray-300">
                            {artist.artistName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Artist Name */}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-white">{artist.artistName}</p>
                    </div>

                    {/* Bar */}
                    <div className="flex-1">
                      <div className="relative h-6 w-full rounded-full bg-gray-700">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{
                            width: `${(artist.listenCount / Math.max(...currentData.map((a) => a.listenCount))) * 100}%`
                          }}
                          transition={{
                            duration: 0.8,
                            delay: index * 0.1,
                            ease: "easeOut"
                          }}
                          className="h-full rounded-full bg-gradient-to-r from-pink-500 to-purple-600"
                        />
                        <div className="absolute inset-0 flex items-center justify-end pr-2">
                          <span className="text-xs font-medium text-white">
                            {artist.listenCount.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </ExpandableChartContainer>
  );
}
