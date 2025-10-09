"use client";

import { cn } from "@/lib/utils/cn";
import { faArrowLeft, faArrowRight, IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

type DateRange = "4weeks" | "6months" | "year" | "lifetime";

interface DateNavigationControlsProps {
  dateRange: DateRange;
  currentPeriod: number;
  onPreviousPeriod: () => void;
  onNextPeriod: () => void;
}

export default function DateNavigationControls({
  dateRange,
  currentPeriod,
  onPreviousPeriod,
  onNextPeriod
}: DateNavigationControlsProps) {
  const getPeriodLabel = () => {
    if (dateRange === "lifetime") return "Lifetime";

    const isCurrentPeriod = currentPeriod === 0;

    if (dateRange === "4weeks") {
      if (isCurrentPeriod) return "Last 4 Weeks";
      return `${currentPeriod * 4} weeks ago`;
    }

    if (dateRange === "6months") {
      if (isCurrentPeriod) return "Last 6 Months";
      return `${currentPeriod * 6} months ago`;
    }

    if (dateRange === "year") {
      const currentYear = new Date().getFullYear();
      const targetYear = currentYear - currentPeriod;
      if (isCurrentPeriod) return `${currentYear}`;
      return `${targetYear}`;
    }

    return "";
  };

  const canNavigateBack = dateRange !== "lifetime";
  const canNavigateForward = currentPeriod > 0;

  if (!canNavigateBack) {
    return null;
  }

  return (
    <div className="mx-auto flex items-center gap-2 lg:mx-0">
      <NavigationButton
        onClick={onPreviousPeriod}
        disabled={!canNavigateBack}
        icon={faArrowLeft}
        iconPosition="left"
        text="Previous"
      />
      <span className="mx-2 text-sm text-gray-400">{getPeriodLabel()}</span>
      <NavigationButton
        onClick={onNextPeriod}
        disabled={!canNavigateForward}
        icon={faArrowRight}
        iconPosition="right"
        text="Next"
      />
    </div>
  );
}

const NavigationButton = ({
  onClick,
  disabled,
  icon,
  iconPosition,
  text
}: {
  onClick: () => void;
  disabled: boolean;
  icon: IconDefinition;
  iconPosition: "left" | "right";
  text: string;
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex w-28 cursor-pointer items-center justify-center rounded-xl bg-white/5 px-3 py-2 text-sm font-medium text-gray-300 backdrop-blur-sm transition-all enabled:hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {iconPosition === "right" && <span>{text}</span>}
      <FontAwesomeIcon icon={icon} className={cn(iconPosition === "left" ? "mr-2" : "ml-2")} />
      {iconPosition === "left" && <span>{text}</span>}
    </button>
  );
};
