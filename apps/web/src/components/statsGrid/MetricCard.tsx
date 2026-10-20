import { cn } from "@/lib/utils/cn";
import Link from "next/link";

interface MetricCardProps {
  title: string;
  mainText: number | string;
  secondaryText?: string;
  gradientFrom: string;
  gradientTo: string;
  blurColor: string;
  textColor: string;
  href?: string;
  compact?: boolean;
}

export default function MetricCard({
  title,
  mainText,
  secondaryText,
  gradientFrom,
  gradientTo,
  blurColor,
  textColor,
  href,
  compact = false
}: MetricCardProps) {
  const content = (
    <>
      <div className={`absolute -top-4 -right-4 h-24 w-24 rounded-full ${blurColor} blur-2xl`}></div>
      <div className="relative">
        <h3 className={cn("text-sm font-medium text-gray-400", compact ? "mb-1 sm:mb-2" : "mb-2")}>
          {title}
        </h3>
        <p className={`xs:text-3xl text-2xl font-bold ${textColor}`}>
          {typeof mainText === "number" ? mainText.toLocaleString() : mainText}
        </p>
        {secondaryText && <p className="text-sm text-gray-500">{secondaryText}</p>}
      </div>
    </>
  );

  const className = cn(
    "group relative overflow-hidden rounded-2xl bg-gradient-to-br p-6 backdrop-blur-sm transition-all",
    gradientFrom,
    gradientTo,
    compact && "p-2.5 sm:p-6"
  );

  if (href) {
    return (
      <Link
        href={href}
        className={`${className} cursor-pointer hover:brightness-110 focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:outline-none`}
      >
        {content}
      </Link>
    );
  }

  return <div className={className}>{content}</div>;
}
