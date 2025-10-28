"use client";

import { WeeklyTopArtist } from "@workspace/core/queries/artists";
import { motion } from "motion/react";

interface EvolutionChartItemProps {
  artist: WeeklyTopArtist | undefined;
  artistId: string;
  isVisible: boolean;
  wasVisible: boolean;
  currentPosition: number;
  targetPosition: number;
  itemHeight: number;
  itemSpacing: number;
  currentWeek: string;
  maxListenCount: number;
}

export default function EvolutionChartItem({
  artist,
  artistId,
  isVisible,
  wasVisible,
  currentPosition,
  targetPosition,
  itemHeight,
  itemSpacing,
  currentWeek,
  maxListenCount
}: EvolutionChartItemProps) {
  const isMoving = currentPosition !== targetPosition;
  const isEntering = !wasVisible && isVisible;
  const isExiting = wasVisible && !isVisible;

  // Ensure entering artists always start from bottom
  const startY = isEntering ? 600 : currentPosition * itemSpacing;

  return (
    <motion.div
      key={artistId}
      animate={{
        y: targetPosition * itemSpacing,
        opacity: isVisible ? 1 : 0,
        scale: isMoving ? 1.02 : 1
      }}
      initial={{
        y: startY,
        opacity: isEntering ? 0 : 0.8,
        scale: isEntering ? 0.8 : 1
      }}
      exit={{
        y: 600,
        opacity: 0,
        scale: 0.8
      }}
      transition={{
        duration: isEntering || isExiting ? 0.6 : 0.4,
        ease: isEntering ? "easeOut" : "easeInOut",
        delay: isEntering ? 0 : Math.abs(targetPosition - currentPosition) * 0.05
      }}
      className="absolute right-0 left-0 flex items-center gap-4 rounded-lg bg-[#312f49] px-2"
      style={{ height: `${itemHeight}px`, margin: "6px 0" }}
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
      <div
        className="flex aspect-square items-center justify-center py-1"
        style={{ height: `${itemHeight - 8}px` }}
      >
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
        <div className="relative h-6 w-full overflow-hidden rounded-full bg-gray-700">
          <motion.div
            initial={{ width: 0 }}
            animate={{
              width: artist ? `${(artist.listenCount / maxListenCount) * 100}%` : "0%"
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
}
