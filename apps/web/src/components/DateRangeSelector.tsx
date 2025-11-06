import { DateRange } from "@/hooks/useDateRange";
import SlidingIndicatorSelector from "./SlidingIndicatorSelector";

type DateRangeSelectorProps = {
  dateRange: DateRange;
  onDateRangeChange?: (dateRange: DateRange) => void;
  onOptionClick?: (dateRange: DateRange) => void;
};

export default function DateRangeSelector({
  dateRange,
  onDateRangeChange,
  onOptionClick
}: DateRangeSelectorProps) {
  const options = [
    { value: "4weeks" as DateRange, label: "4 Weeks" },
    { value: "6months" as DateRange, label: "6 Months" },
    { value: "year" as DateRange, label: "Year" },
    { value: "lifetime" as DateRange, label: "Lifetime" },
    { value: "custom" as DateRange, label: "Custom" }
  ];

  return (
    <SlidingIndicatorSelector
      options={options}
      value={dateRange}
      onChange={onDateRangeChange}
      onOptionClick={onOptionClick}
    />
  );
}
