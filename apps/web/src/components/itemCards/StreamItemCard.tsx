import { cn } from "@/lib/utils/cn";
import ItemCard from "./ItemCard";

export type StreamItemCardProps = {
  href: string;
  imageUrl: string | null;
  number: number;
  title: string;
  subtitle: string;
  streams: number;
  minutes: number;
  className?: string;
};

export default function StreamItemCard({
  href,
  imageUrl,
  number,
  title,
  subtitle,
  streams,
  minutes,
  className
}: StreamItemCardProps) {
  return (
    <ItemCard
      href={href}
      imageUrl={imageUrl}
      number={number}
      title={title}
      subtitle={subtitle}
      content={`${streams} streams • ${minutes} minutes`}
      className={cn("w-42 shrink-0 grow-0 p-2", className)}
    />
  );
}
