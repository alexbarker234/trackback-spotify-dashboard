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
import { useEffect, useMemo, useRef, useState } from "react";
import ExpandableChartContainer from "../ExpandableChartContainer";
import EvolutionChartItem from "./EvolutionChartItem";

const formatWeek = (weekString: string) => {
  const date = new Date(weekString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
};

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

function EvolutionChartSlider({
  currentWeekIndex,
  weeks,
  setCurrentWeekIndex
}: {
  currentWeekIndex: number;
  weeks: string[];
  setCurrentWeekIndex: (index: number) => void;
}) {
  return (
    <div className="w-full">
      <div className="relative">
        <input
          type="range"
          min="0"
          max={weeks.length - 1}
          value={currentWeekIndex}
          onChange={(e) => setCurrentWeekIndex(parseInt(e.target.value))}
          className="slider h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-700 focus:outline-none"
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
  );
}

interface EvolutionChartProps {
  data: WeeklyTopArtist[];
  animationSpeed?: number; // milliseconds between frames
  movingAverageWeeks?: number; // number of weeks for moving average
}

function EvolutionChartContent({
  data,
  isPlaying,
  handlePlayPause,
  handlePrevious,
  handleNext,
  currentWeekIndex,
  movingAverageWeeks,
  weeks,
  currentWeek,
  setCurrentWeekIndex,
  visibleArtists,
  previousVisibleArtists,
  artistPositions,
  currentData
}: {
  data: WeeklyTopArtist[];
  isPlaying: boolean;
  handlePlayPause: () => void;
  handlePrevious: () => void;
  handleNext: () => void;
  currentWeekIndex: number;
  movingAverageWeeks: number;
  weeks: string[];
  currentWeek: string;
  setCurrentWeekIndex: (index: number) => void;
  visibleArtists: Set<string>;
  previousVisibleArtists: Set<string>;
  artistPositions: Map<string, number>;
  currentData: WeeklyTopArtist[];
}) {
  const chartContainerRef = useRef<HTMLDivElement>(null);

  // Calculate dynamic item height based on container height
  const [itemHeight, setItemHeight] = useState(60);

  // Use ResizeObserver to update item height when container size changes
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const updateItemHeight = () => {
      if (!chartContainerRef.current) return;
      const containerHeight = chartContainerRef.current.clientHeight;
      const maxItems = 10;
      const itemMargin = 6;
      const minItemHeight = 30;
      const maxItemHeight = 60;
      const calculatedHeight = Math.max(minItemHeight, containerHeight / maxItems);
      const newHeight = Math.min(calculatedHeight, maxItemHeight);
      const finalHeight = newHeight - itemMargin * 2;
      console.log(finalHeight);
      setItemHeight(finalHeight);
    };

    // Initial calculation
    updateItemHeight();

    // Set up ResizeObserver
    const resizeObserver = new ResizeObserver(updateItemHeight);
    resizeObserver.observe(chartContainerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const itemSpacing = useMemo(() => itemHeight + 12, [itemHeight]);

  // Get all unique artists across all weeks for tracking
  const allArtists = useMemo(() => {
    const artistSet = new Set<string>();
    data.forEach((item) => artistSet.add(item.artistId));
    return Array.from(artistSet);
  }, [data]);

  // Calculate max listen count for bar scaling
  const maxListenCount = useMemo(() => {
    return Math.max(...currentData.map((a) => a.listenCount));
  }, [currentData]);

  return (
    <div className="flex h-full w-full flex-col">
      {/* Controls */}
      <div className="mb-4 flex flex-col gap-4">
        {/* Play/Pause and Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <IconButton
              onClick={handlePlayPause}
              title={isPlaying ? "Pause" : "Play"}
              icon={isPlaying ? faPause : faPlay}
            />

            <IconButton
              onClick={handlePrevious}
              disabled={currentWeekIndex === 0}
              title="Previous Week"
              icon={faChevronLeft}
            />

            <IconButton
              onClick={handleNext}
              disabled={currentWeekIndex === weeks.length - 1}
              title="Next Week"
              icon={faChevronRight}
            />
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
        <EvolutionChartSlider
          currentWeekIndex={currentWeekIndex}
          weeks={weeks}
          setCurrentWeekIndex={setCurrentWeekIndex}
        />
      </div>

      {/* Chart */}
      <div ref={chartContainerRef} className="h-full w-full">
        <div className="relative h-full w-full overflow-hidden rounded-lg">
          {allArtists.map((artistId) => {
            const artist = currentData.find((a) => a.artistId === artistId);
            const isVisible = visibleArtists.has(artistId);
            const wasVisible = previousVisibleArtists.has(artistId);

            // Only render if artist is currently visible or was visible (for exit animation)
            if (!isVisible && !wasVisible) return null;

            const currentPosition =
              artistPositions.get(artistId) ?? (artist ? currentData.indexOf(artist) : 10);
            const targetPosition = artist ? currentData.indexOf(artist) : 10; // 10 = off-screen bottom

            return (
              <EvolutionChartItem
                key={artistId}
                artist={artist}
                artistId={artistId}
                isVisible={isVisible}
                wasVisible={wasVisible}
                currentPosition={currentPosition}
                targetPosition={targetPosition}
                itemHeight={itemHeight}
                itemSpacing={itemSpacing}
                currentWeek={currentWeek}
                maxListenCount={maxListenCount}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function EvolutionChart({
  data,
  animationSpeed = 1000,
  movingAverageWeeks = 4
}: EvolutionChartProps) {
  const [currentWeekIndex, setCurrentWeekIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [previousVisibleArtists, setPreviousVisibleArtists] = useState<Set<string>>(new Set());

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
  const artistPositions = useMemo(() => {
    const newPositions = new Map<string, number>();
    currentData.forEach((artist, index) => {
      newPositions.set(artist.artistId, index);
    });
    return newPositions;
  }, [currentData]);

  const visibleArtists = useMemo(() => {
    return new Set(currentData.map((artist) => artist.artistId));
  }, [currentData]);

  // Update previous visible artists when week changes
  useEffect(() => {
    setPreviousVisibleArtists(visibleArtists);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentWeek]);

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

  return (
    <ExpandableChartContainer title={`Top Artists Evolution Over Time`} chartHeight="h-[600px]">
      <EvolutionChartContent
        data={data}
        isPlaying={isPlaying}
        handlePlayPause={handlePlayPause}
        handlePrevious={handlePrevious}
        handleNext={handleNext}
        currentWeekIndex={currentWeekIndex}
        movingAverageWeeks={movingAverageWeeks}
        weeks={weeks}
        currentWeek={currentWeek}
        setCurrentWeekIndex={setCurrentWeekIndex}
        visibleArtists={visibleArtists}
        previousVisibleArtists={previousVisibleArtists}
        artistPositions={artistPositions}
        currentData={currentData}
      />
    </ExpandableChartContainer>
  );
}
