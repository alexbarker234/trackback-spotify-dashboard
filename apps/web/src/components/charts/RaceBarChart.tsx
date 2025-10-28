"use client";

import { WeeklyTopArtist } from "@workspace/core/queries/artists";
import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import ExpandableChartContainer from "./ExpandableChartContainer";

interface RaceBarChartProps {
  data: WeeklyTopArtist[];
  animationSpeed?: number; // milliseconds between frames
}

export default function RaceBarChart({ data, animationSpeed = 1000 }: RaceBarChartProps) {
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [artistPositions, setArtistPositions] = useState<Map<string, number>>(new Map());

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
  const currentData = useMemo(
    () => (currentWeek ? weeklyData[currentWeek] : []),
    [currentWeek, weeklyData]
  );

  // Update artist positions when week changes
  useEffect(() => {
    if (currentData.length === 0) return;

    // Update positions after a short delay to allow for smooth transitions
    const timeout = setTimeout(() => {
      const newPositions = new Map<string, number>();
      currentData.forEach((artist, index) => {
        newPositions.set(artist.artistId, index);
      });
      setArtistPositions(newPositions);
    }, 100);

    return () => clearTimeout(timeout);
  }, [currentWeek, currentData]);

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
          <div className="relative h-full w-full overflow-hidden rounded-lg">
            {/* Background grid lines */}
            <div className="absolute inset-0">
              {Array.from({ length: 10 }, (_, i) => (
                <div
                  key={i}
                  className="absolute right-0 left-0 border-b border-gray-700/30"
                  style={{ top: `${i * 60}px` }}
                />
              ))}
            </div>

            {currentData.map((artist, index) => {
              const currentPosition = artistPositions.get(artist.artistId) ?? index;
              const targetPosition = index;
              const isMoving = currentPosition !== targetPosition;

              return (
                <motion.div
                  key={artist.artistId}
                  animate={{
                    y: targetPosition * 60, // 60px per row (48px height + 12px gap)
                    opacity: 1,
                    scale: isMoving ? 1.02 : 1
                  }}
                  initial={{
                    y: currentPosition * 60,
                    opacity: 0.8,
                    scale: 1
                  }}
                  transition={{
                    duration: 0.8,
                    ease: "easeInOut",
                    delay: Math.abs(targetPosition - currentPosition) * 0.05
                  }}
                  className="absolute right-0 left-0 flex h-12 items-center gap-4 rounded-lg bg-[#312f49] px-2"
                  style={{ margin: "6px 0" }}
                >
                  {/* Rank */}
                  <div className="flex w-8 items-center justify-center">
                    <motion.span
                      key={`rank-${artist.rank}-${currentWeek}`}
                      initial={{ scale: 1.2, color: "#ec4899" }}
                      animate={{ scale: 1, color: "#ffffff" }}
                      transition={{ duration: 0.3 }}
                      className="text-sm font-bold"
                    >
                      #{artist.rank}
                    </motion.span>
                  </div>

                  {/* Artist Image */}
                  <div className="flex aspect-square h-full items-center justify-center py-1">
                    <motion.div
                      animate={{
                        boxShadow:
                          isMoving && currentPosition > targetPosition
                            ? "0 0 20px rgba(34, 197, 94, 0.5)"
                            : "0 0 0px rgba(0, 0, 0, 0)"
                      }}
                      transition={{ duration: 0.3 }}
                      className="h-full rounded-full"
                    >
                      {artist.artistImageUrl ? (
                        <img
                          src={artist.artistImageUrl}
                          alt={`${artist.artistName} profile`}
                          className="aspect-square h-full w-full rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex aspect-square h-full items-center justify-center rounded-full bg-gray-600">
                          <span className="text-xs text-gray-300">
                            {artist.artistName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </motion.div>
                  </div>

                  {/* Artist Name */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium text-white">{artist.artistName}</p>
                      {isMoving && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0 }}
                          className="flex items-center"
                        >
                          {currentPosition > targetPosition ? (
                            <span className="text-xs text-green-400">↑</span>
                          ) : currentPosition < targetPosition ? (
                            <span className="text-xs text-red-400">↓</span>
                          ) : null}
                        </motion.div>
                      )}
                    </div>
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
                          duration: 1.2,
                          ease: "easeOut",
                          delay: Math.abs(targetPosition - currentPosition) * 0.1
                        }}
                        className="h-full rounded-full bg-gradient-to-r from-pink-500 to-purple-600"
                      />
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="absolute inset-0 flex items-center justify-end pr-2"
                      >
                        <span className="text-xs font-medium text-white">
                          {artist.listenCount.toLocaleString()}
                        </span>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </ExpandableChartContainer>
  );
}
