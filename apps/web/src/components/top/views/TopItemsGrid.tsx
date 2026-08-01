import StreamItemCard from "@/components/itemCards/StreamItemCard";
import { TopItem } from "../types";

export default function TopItemsGrid({ items, maxItems }: { items: TopItem[]; maxItems: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
      {items.slice(0, maxItems).map((item, index) => (
        <StreamItemCard
          key={item.id}
          href={item.href}
          imageUrl={item.imageUrl}
          number={index + 1}
          title={item.name}
          subtitle={item.subtitle}
          streams={item.streams}
          durationMs={item.durationMs}
          className="w-auto"
        />
      ))}
    </div>
  );
}
