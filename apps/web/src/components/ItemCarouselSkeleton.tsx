function StreamItemCardPlaceholder() {
  return (
    <div className="pulsate flex w-42 shrink-0 grow-0 flex-col space-y-3 rounded-2xl bg-white/5 p-2">
      {/* Image */}
      <div className="aspect-square w-full rounded-lg bg-white/10" />
      {/* Content */}
      <div className="min-w-0 flex-1 space-y-2">
        <div className="h-4 w-3/4 rounded bg-white/10" />
        <div className="h-3 w-1/2 rounded bg-white/10" />
        <div className="h-3 w-2/3 rounded bg-white/10" />
      </div>
    </div>
  );
}

export default function ItemCarouselSkeleton({
  title,
  subtitle
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="relative h-fit">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          {subtitle && <p className="text-sm text-gray-400">{subtitle}</p>}
        </div>
      </div>

      <div className="overflow-hidden">
        <div className="flex gap-3">
          {Array.from({ length: 8 }, (_, i) => (
            <StreamItemCardPlaceholder key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
