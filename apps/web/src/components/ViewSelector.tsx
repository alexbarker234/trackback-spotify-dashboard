import SlidingIndicatorSelector from "./SlidingIndicatorSelector";

export const viewTypeOptions = ["grid", "chart"] as const;
export type ViewType = (typeof viewTypeOptions)[number];

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
