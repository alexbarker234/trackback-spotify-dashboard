import SlidingIndicatorSelector from "./SlidingIndicatorSelector";

export type ViewType = "grid" | "chart";

type ViewSelectorProps = {
  viewType: ViewType;
  onViewTypeChange: (viewType: ViewType) => void;
};

export default function ViewSelector({ viewType, onViewTypeChange }: ViewSelectorProps) {
  const options = [
    { value: "grid" as ViewType, label: "Grid" },
    { value: "chart" as ViewType, label: "Chart" }
  ];

  return <SlidingIndicatorSelector options={options} value={viewType} onChange={onViewTypeChange} />;
}
