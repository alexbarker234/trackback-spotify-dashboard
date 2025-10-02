import { cn } from "@/lib/utils/cn";

export default function Loading({ className }: { className?: string }) {
  return (
    <div className={cn("relative mx-auto my-4 flex h-16 w-16 items-end justify-between", className)}>
      <div className="animate-loader-bounce bg-spotify-green w-1/4 rounded-full" />
      <div className="animate-loader-bounce bg-spotify-green w-1/4 rounded-full" style={{ animationDelay: "-300ms" }} />
      <div className="animate-loader-bounce bg-spotify-green w-1/4 rounded-full" style={{ animationDelay: "-600ms" }} />
    </div>
  );
}
