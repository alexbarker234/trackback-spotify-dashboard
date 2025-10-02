import { cn } from "@/lib/utils/cn";
import { faMusic } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";

export type ItemCardProps = {
  href: string;
  imageUrl: string | null;
  number: number;
  title: string;
  subtitle: string;
  streams: number;
  minutes: number;
  className?: string;
};

export default function ItemCard({
  href,
  imageUrl,
  number,
  title,
  subtitle,
  streams,
  minutes,
  className
}: ItemCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex w-42 shrink-0 grow-0 flex-col space-y-3 rounded-lg bg-zinc-800 p-2 transition-colors hover:bg-zinc-700",
        className
      )}
    >
      {imageUrl ? (
        <img src={imageUrl} alt={title} className="aspect-square w-full rounded object-cover" />
      ) : (
        <div className="flex aspect-square w-full items-center justify-center rounded bg-zinc-700">
          <FontAwesomeIcon icon={faMusic} className="text-4xl text-zinc-400" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 font-medium text-zinc-100">
          <span className="font-bold text-zinc-400">#{number}</span> {title}
        </p>
        <p className="line-clamp-1 text-sm text-zinc-400">{subtitle}</p>
        <p className="text-xs text-zinc-500">
          {streams} streams • {minutes} minutes
        </p>
      </div>
    </Link>
  );
}
