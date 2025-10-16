import { useEffect, useRef, useState } from "react";

export type ViewType = "grid" | "chart";

type ViewSelectorProps = {
  viewType: ViewType;
  onViewTypeChange: (viewType: ViewType) => void;
};

export default function ViewSelector({ viewType, onViewTypeChange }: ViewSelectorProps) {
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonsRef = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  const options: { value: ViewType; label: string }[] = [
    { value: "grid", label: "Grid" },
    { value: "chart", label: "Chart" }
  ];

  useEffect(() => {
    const updateIndicator = () => {
      const activeButton = buttonsRef.current[viewType];
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
  }, [viewType]);

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
          onClick={() => onViewTypeChange(option.value)}
          className={`relative z-10 flex-grow cursor-pointer rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            viewType === option.value ? "text-white" : "text-gray-400 hover:text-white"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
