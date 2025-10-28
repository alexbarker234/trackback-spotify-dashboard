"use client";

import {
  faChevronLeft,
  faChevronRight,
  faPause,
  faPlay,
  IconDefinition
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { WeeklyTopArtist } from "@workspace/core/queries/artists";
import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import ExpandableChartContainer from "./ExpandableChartContainer";

// Reusable Icon Button Component
interface IconButtonProps {
  onClick: () => void;
  disabled?: boolean;
  title: string;
  icon: IconDefinition;
}

function IconButton({ onClick, disabled = false, title, icon }: IconButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg bg-white/10 text-white transition-colors hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
      title={title}
      disabled={disabled}
    >
      <FontAwesomeIcon icon={icon} className="h-5 w-5" />
    </button>
  );
}

interface RaceBarChartProps {
  data: WeeklyTopArtist[];
  animationSpeed?: number; // milliseconds between frames
  movingAverageWeeks?: number; // number of weeks for moving average
}

export default function RaceBarChart({
  data,
  animationSpeed = 1000,
  movingAverageWeeks = 4
}: RaceBarChartProps) {
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

  // Get all unique artists across all weeks for tracking
  const allArtists = useMemo(() => {
    const artistSet = new Set<string>();
    data.forEach((item) => artistSet.add(item.artistId));
    return Array.from(artistSet);
  }, [data]);

  // Track which artists were visible in the previous week
  const [previousVisibleArtists, setPreviousVisibleArtists] = useState<Set<string>>(new Set());

  const visibleArtists = useMemo(() => {
    return new Set(currentData.map((artist) => artist.artistId));
  }, [currentData]);

  // Update previous visible artists when week changes
  useEffect(() => {
    setPreviousVisibleArtists(visibleArtists);
  }, [currentWeek, visibleArtists]);

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
    <ExpandableChartContainer
      title={`Top Artists Race Over Time (${movingAverageWeeks}-Week Moving Average)`}
      chartHeight="h-fit"
    >
      <div className="h-full w-full">
        {/* Controls */}
        <div className="mb-4 flex flex-col gap-4">
          {/* Play/Pause and Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <IconButton
                onClick={handlePlayPause}
                title={isPlaying ? "Pause" : "Play"}
                icon={isPlaying ? faPause : faPlay}
              ></IconButton>

              <IconButton
                onClick={handlePrevious}
                disabled={currentWeekIndex === 0}
                title="Previous Week"
                icon={faChevronLeft}
              ></IconButton>

              <IconButton
                onClick={handleNext}
                disabled={currentWeekIndex === weeks.length - 1}
                title="Next Week"
                icon={faChevronRight}
              ></IconButton>
            </div>

            <div className="text-right">
              <p className="text-sm text-gray-400">
                Week {currentWeekIndex + 1} of {weeks.length}
              </p>
              <p className="text-lg font-semibold text-white">
                {currentWeek ? formatWeek(currentWeek) : "No data"}
              </p>
              <p className="text-xs text-gray-500">
                Showing {movingAverageWeeks}-week moving average
              </p>
            </div>
          </div>

          {/* Timeline Slider */}
          <div className="w-full">
            <div className="relative">
              <input
                type="range"
                min="0"
                max={weeks.length - 1}
                value={currentWeekIndex}
                onChange={(e) => setCurrentWeekIndex(parseInt(e.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-700 focus:ring-2 focus:ring-pink-500 focus:outline-none"
                style={{
                  background: `linear-gradient(to right, #ec4899 0%, #ec4899 ${(currentWeekIndex / (weeks.length - 1)) * 100}%, #374151 ${(currentWeekIndex / (weeks.length - 1)) * 100}%, #374151 100%)`
                }}
              />
              <div className="mt-2 flex justify-between text-xs text-gray-400">
                <span>{weeks.length > 0 ? formatWeek(weeks[0]) : ""}</span>
                <span>{weeks.length > 0 ? formatWeek(weeks[weeks.length - 1]) : ""}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="h-[600px] w-full">
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

            {allArtists.map((artistId) => {
              const artist = currentData.find((a) => a.artistId === artistId);
              const isVisible = visibleArtists.has(artistId);
              const wasVisible = previousVisibleArtists.has(artistId);

              // Only render if artist is currently visible or was visible (for exit animation)
              if (!isVisible && !wasVisible) return null;

              const currentPosition =
                artistPositions.get(artistId) ?? (artist ? currentData.indexOf(artist) : 10);
              const targetPosition = artist ? currentData.indexOf(artist) : 10; // 10 = off-screen bottom
              const isMoving = currentPosition !== targetPosition;
              const isEntering = !wasVisible && isVisible;
              const isExiting = wasVisible && !isVisible;

              // Ensure entering artists always start from bottom
              const startY = isEntering ? 600 : currentPosition * 60;

              return (
                <motion.div
                  key={artistId}
                  animate={{
                    y: targetPosition * 60, // 60px per row (48px height + 12px gap)
                    opacity: isVisible ? 1 : 0,
                    scale: isMoving ? 1.02 : 1
                  }}
                  initial={{
                    y: startY, // Start from bottom if entering, otherwise current position
                    opacity: isEntering ? 0 : 0.8,
                    scale: isEntering ? 0.8 : 1 // Start smaller if entering
                  }}
                  exit={{
                    y: 600, // Exit to bottom
                    opacity: 0,
                    scale: 0.8
                  }}
                  transition={{
                    duration: isEntering || isExiting ? 1.2 : 0.8,
                    ease: isEntering ? "easeOut" : "easeInOut",
                    delay: isEntering ? 0 : Math.abs(targetPosition - currentPosition) * 0.05
                  }}
                  className="absolute right-0 left-0 flex h-12 items-center gap-4 rounded-lg bg-[#312f49] px-2"
                  style={{ margin: "6px 0" }}
                >
                  {/* Rank */}
                  <div className="flex w-8 items-center justify-center">
                    <motion.span
                      key={`rank-${artist?.rank}-${currentWeek}`}
                      initial={{ scale: 1.2, color: "#ec4899" }}
                      animate={{ scale: 1, color: "#ffffff" }}
                      transition={{ duration: 0.3 }}
                      className="text-sm font-bold"
                    >
                      #{artist?.rank || "?"}
                    </motion.span>
                  </div>

                  {/* Artist Image */}
                  <div className="flex aspect-square h-full items-center justify-center py-1">
                    <div className="h-full rounded-full">
                      {artist?.artistImageUrl ? (
                        <img
                          src={artist.artistImageUrl}
                          alt={`${artist.artistName} profile`}
                          className="aspect-square h-full w-full rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex aspect-square h-full items-center justify-center rounded-full bg-gray-600">
                          <span className="text-xs text-gray-300">
                            {artist?.artistName?.charAt(0).toUpperCase() || "?"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Artist Name */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium text-white">
                        {artist?.artistName || "Unknown Artist"}
                      </p>
                    </div>
                  </div>

                  {/* Bar */}
                  <div className="flex-1">
                    <div className="relative h-6 w-full rounded-full bg-gray-700">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: artist
                            ? `${(artist.listenCount / Math.max(...currentData.map((a) => a.listenCount))) * 100}%`
                            : "0%"
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
                          {artist?.listenCount?.toLocaleString() || "0"}
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
