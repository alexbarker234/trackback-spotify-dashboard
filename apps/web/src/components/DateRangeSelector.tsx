import { DateRange } from "@/hooks/useDateRange";
import { useEffect, useRef, useState } from "react";

type DateRangeSelectorProps = {
  dateRange: DateRange;
  onDateRangeChange: (dateRange: DateRange) => void;
};

export default function DateRangeSelector({ dateRange, onDateRangeChange }: DateRangeSelectorProps) {
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonsRef = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  const options: { value: DateRange; label: string }[] = [
    { value: "4weeks", label: "4 Weeks" },
    { value: "6months", label: "6 Months" },
    { value: "year", label: "Year" },
    { value: "lifetime", label: "Lifetime" }
  ];

  useEffect(() => {
    const updateIndicator = () => {
      const activeButton = buttonsRef.current[dateRange];
      const container = containerRef.current;

      if (activeButton && container) {
        const containerRect = container.getBoundingClientRect();
        const buttonRect = activeButton.getBoundingClientRect();

        setIndicatorStyle({
          left: buttonRect.left - containerRect.left,
          width: buttonRect.width
        });
      }
    };

    updateIndicator();
    window.addEventListener("resize", updateIndicator);
    return () => window.removeEventListener("resize", updateIndicator);
  }, [dateRange]);

  return (
    <div ref={containerRef} className="relative flex gap-1 rounded-xl bg-white/5 p-1 backdrop-blur-sm">
      {/* Sliding indicator */}
      <div
        className="absolute top-1 h-[calc(100%-8px)] rounded-lg bg-gradient-to-r from-pink-500 to-purple-500 transition-all duration-300 ease-out"
        style={{
          left: `${indicatorStyle.left}px`,
          width: `${indicatorStyle.width}px`
        }}
      />

      {/* Buttons */}
      {options.map((option) => (
        <button
          key={option.value}
          ref={(el) => {
            buttonsRef.current[option.value] = el;
          }}
          onClick={() => onDateRangeChange(option.value)}
          className={`relative z-10 flex-grow cursor-pointer rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            dateRange === option.value ? "text-white" : "text-gray-400 hover:text-white"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
