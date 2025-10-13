import { cn } from "@/lib/utils/cn";
import { faMusic } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";

export interface ItemCardProps {
  href: string;
  imageUrl: string | null;
  title: string;
  subtitle: string;
  number?: number;
  content?: string;
  className?: string;
}

export default function ItemCard({ href, imageUrl, title, subtitle, content, number, className }: ItemCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        "flex cursor-pointer flex-col space-y-3 rounded-2xl bg-white/5 p-3 backdrop-blur-sm transition-all hover:bg-white/10 disabled:cursor-not-allowed",
        className
      )}
    >
      {imageUrl ? (
        <img src={imageUrl} alt={title} className="aspect-square w-full rounded-lg object-cover shadow-lg" />
      ) : (
        <div className="flex aspect-square w-full items-center justify-center rounded-lg bg-white/5">
          <FontAwesomeIcon icon={faMusic} className="text-4xl text-gray-400" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 font-medium text-white">
          {number !== undefined && <span className="font-bold text-gray-400">#{number}</span>}
          {number !== undefined && " "}
          {title}
        </p>
        <p className="line-clamp-1 text-sm text-gray-400">{subtitle}</p>
        {content !== undefined && <p className="text-xs text-gray-500">{content}</p>}
      </div>
    </Link>
  );
}
