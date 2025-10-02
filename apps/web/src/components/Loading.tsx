import { cn } from "@/lib/utils/cn";

export default function Loading({ className }: { className?: string }) {
  return (
    <div className={cn("relative mx-auto my-4 h-16 w-16", className)}>
      <span className="animate-loader-bounce bg-spotify-green absolute top-0 left-0 h-1/2 w-1/4 rounded-lg" />
      <span
        className="animate-loader-bounce bg-spotify-green absolute top-0 left-1/2 h-1/2 w-1/4 -translate-x-1/2 rounded-lg"
        style={{ animationDelay: "-300ms" }}
      />
      <span
        className="animate-loader-bounce bg-spotify-green absolute top-0 right-0 h-1/2 w-1/4 rounded-lg"
        style={{ animationDelay: "-600ms" }}
      />
    </div>
  );
}
