import { cn } from "@/lib/utils/cn";

export default function Loading({ className }: { className?: string }) {
  return (
    <div className={cn("relative mx-auto my-4 flex aspect-[24/16] h-16 items-center justify-between", className)}>
      <div className="animate-loader-bounce w-1/7 rounded-full bg-purple-500" style={{ animationDelay: "-600ms" }} />
      <div className="animate-loader-bounce w-1/7 rounded-full bg-pink-500" style={{ animationDelay: "-300ms" }} />
      <div className="animate-loader-bounce w-1/7 rounded-full bg-yellow-500" />
      <div className="animate-loader-bounce w-1/7 rounded-full bg-pink-500" style={{ animationDelay: "-300ms" }} />
      <div className="animate-loader-bounce w-1/7 rounded-full bg-purple-500" style={{ animationDelay: "-600ms" }} />
    </div>
  );
}
