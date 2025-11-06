import { useEffect, useRef, useState } from "react";

type Option<T> = {
  value: T;
  label: string;
};

type SlidingIndicatorSelectorProps<T> = {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  onOptionClick?: (value: T) => void;
};

export default function SlidingIndicatorSelector<T extends string>({
  options,
  value,
  onChange,
  onOptionClick
}: SlidingIndicatorSelectorProps<T>) {
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0, top: 0, height: 0 });
  const [isInitialised, setIsInitialised] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonsRef = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  useEffect(() => {
    const updateIndicator = () => {
      const activeButton = buttonsRef.current[value];
      const container = containerRef.current;

      if (activeButton && container) {
        const containerRect = container.getBoundingClientRect();
        const buttonRect = activeButton.getBoundingClientRect();

        setIndicatorStyle({
          left: buttonRect.left - containerRect.left,
          width: buttonRect.width,
          top: buttonRect.top - containerRect.top,
          height: buttonRect.height
        });

        if (!isInitialised) {
          setTimeout(() => setIsInitialised(true), 10);
        }
      }
    };

    updateIndicator();
    window.addEventListener("resize", updateIndicator);
    return () => window.removeEventListener("resize", updateIndicator);
  }, [value, isInitialised]);

  const handleOptionClick = (optionValue: T) => {
    onOptionClick?.(optionValue);
    // Only call onChange if the value actually changed
    if (optionValue !== value) {
      onChange(optionValue);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative flex flex-wrap gap-1 rounded-xl bg-white/5 p-1 backdrop-blur-sm"
    >
      {/* Sliding indicator */}
      <div
        className={`absolute rounded-lg bg-gradient-to-r from-pink-500 to-purple-500 ${
          isInitialised ? "transition-all duration-300 ease-out" : ""
        }`}
        style={{
          left: `${indicatorStyle.left}px`,
          width: `${indicatorStyle.width}px`,
          top: `${indicatorStyle.top}px`,
          height: `${indicatorStyle.height}px`
        }}
      />

      {/* Buttons */}
      {options.map((option) => (
        <button
          key={option.value}
          ref={(el) => {
            buttonsRef.current[option.value] = el;
          }}
          onClick={() => handleOptionClick(option.value)}
          className={`relative z-10 flex-grow cursor-pointer rounded-lg px-4 py-1 text-sm font-medium transition-colors disabled:cursor-not-allowed sm:py-2 ${
            value === option.value ? "text-white" : "text-gray-400 hover:text-white"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
