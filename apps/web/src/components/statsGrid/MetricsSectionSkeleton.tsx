function MetricCardPlaceholder() {
  return (
    <div className="pulsate relative overflow-hidden rounded-2xl bg-white/5 p-6">
      {/* Title */}
      <div className="mb-2 h-4 w-24 rounded bg-white/10" />
      {/* Main text */}
      <div className="xs:h-9 mb-1 h-8 w-20 rounded bg-white/10" />
      {/* Secondary text */}
      <div className="h-4 w-36 max-w-full rounded bg-white/10" />
    </div>
  );
}

export default function MetricsSectionSkeleton() {
  return (
    <div className="flex flex-col gap-4 lg:gap-6">
      {/* Listening metrics */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
        <MetricCardPlaceholder />
        <MetricCardPlaceholder />
        <MetricCardPlaceholder />
        <MetricCardPlaceholder />
      </div>
      {/* Listening analytics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:gap-6">
        <MetricCardPlaceholder />
        <MetricCardPlaceholder />
      </div>
    </div>
  );
}
