import SlidingIndicatorSelector from "./SlidingIndicatorSelector";

export const itemTypeOptions = ["artists", "tracks", "albums"] as const;
export type ItemType = (typeof itemTypeOptions)[number];

type ItemTypeSelectorProps = {
  itemType: ItemType;
  onItemTypeChange: (itemType: ItemType) => void;
};

export default function ItemTypeSelector({ itemType, onItemTypeChange }: ItemTypeSelectorProps) {
  const options = [
    { value: "artists" as ItemType, label: "Artists" },
    { value: "tracks" as ItemType, label: "Tracks" },
    { value: "albums" as ItemType, label: "Albums" }
  ];
  return <SlidingIndicatorSelector options={options} value={itemType} onChange={onItemTypeChange} />;
}
