import { formatDuration } from "@/lib/utils/timeUtils";
import CompactRankListCard from "@/components/cards/CompactRankListCard";
import { TopItem } from "../types";

export default function TopItemsList({ items, maxItems }: { items: TopItem[]; maxItems: number }) {
  return (
    <div className="flex flex-col gap-3">
      {items.slice(0, maxItems).map((item, index) => (
        <CompactRankListCard
          key={item.id}
          href={item.href}
          imageUrl={item.imageUrl}
          name={item.name}
          subtitle={item.subtitle}
          rank={index + 1}
          primaryText={`${item.streams.toLocaleString()} streams`}
          secondaryText={formatDuration(item.durationMs)}
        />
      ))}
    </div>
  );
}
