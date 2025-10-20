import SlidingIndicatorSelector from "./SlidingIndicatorSelector";

export const viewTypeOptions = ["grid", "list", "pie", "bubble"] as const;
export type ViewType = (typeof viewTypeOptions)[number];

type ViewSelectorProps = {
  viewType: ViewType;
  onViewTypeChange: (viewType: ViewType) => void;
};

export default function ViewSelector({ viewType, onViewTypeChange }: ViewSelectorProps) {
  const options = [
    { value: "grid" as ViewType, label: "Grid" },
    { value: "list" as ViewType, label: "List" },
    { value: "pie" as ViewType, label: "Pie" },
    { value: "bubble" as ViewType, label: "Bubble" }
  ];
  return <SlidingIndicatorSelector options={options} value={viewType} onChange={onViewTypeChange} />;
}
