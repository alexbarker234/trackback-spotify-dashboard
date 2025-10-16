"use client";

import { formatDuration } from "@/lib/utils/timeUtils";
import { faExpand, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import ChartTooltip from "./ChartTooltip";

interface YearlyStreamData {
  year: string;
  streamCount: number;
  totalDuration: number;
}

interface YearlyStreamChartProps {
  data: YearlyStreamData[];
}

export default function YearlyStreamChart({ data }: YearlyStreamChartProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const formatYear = (yearStr: string) => {
    return yearStr;
  };

  const formatDurationFromMS = (ms: number) => {
    return formatDuration(ms);
  };

  // Handle escape key to exit fullscreen and body scroll lock
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    if (isFullscreen) {
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "auto";
        document.removeEventListener("keydown", handleKeyDown);
      };
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isFullscreen]);

  const CustomTooltip = ({
    active,
    payload,
    label
  }: {
    active?: boolean;
    payload?: Array<{ value: number; payload: YearlyStreamData }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      return (
        <ChartTooltip>
          <p className="text-sm font-medium text-gray-300">{label}</p>
          <p className="text-white">
            <span className="text-gray-400">Streams: </span>
            {payload[0].value.toLocaleString()}
          </p>
          <p className="text-white">
            <span className="text-gray-400">Duration: </span>
            {formatDurationFromMS(payload[0].payload.totalDuration)}
          </p>
        </ChartTooltip>
      );
    }
    return null;
  };

  const ChartContent = ({ isFullscreenContent }: { isFullscreenContent: boolean }) => {
    return (
      <>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Streams by year</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setIsFullscreen(!isFullscreenContent)}
              className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-white/10 p-2 text-white transition-colors hover:bg-white/20 disabled:cursor-not-allowed"
              title={isFullscreenContent ? "Exit fullscreen" : "Enter fullscreen"}
            >
              <FontAwesomeIcon icon={isFullscreenContent ? faXmark : faExpand} className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className={`w-full ${isFullscreenContent ? "h-[calc(100vh-8rem)]" : "h-64"}`}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{
                top: 10,
                right: 10,
                left: -10,
                bottom: 0
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
              <XAxis dataKey="year" tickFormatter={formatYear} stroke="#9CA3AF" fontSize={12} />
              <YAxis stroke="#9CA3AF" fontSize={12} />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="streamCount"
                stroke="#f59e0b"
                fill="#f59e0b"
                fillOpacity={0.3}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </>
    );
  };

  return (
    <>
      {/* Background Overlay */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* Fullscreen Modal */}
      <AnimatePresence>
        {isFullscreen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="h-[95vh] w-[95vw] rounded-2xl bg-gray-500/10 p-6 backdrop-blur-sm"
            >
              <ChartContent isFullscreenContent={true} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Regular Chart Container */}
      <motion.div layout className="rounded-2xl bg-white/5 p-6 backdrop-blur-sm">
        <ChartContent isFullscreenContent={false} />
      </motion.div>
    </>
  );
}
