export default function ChartTooltip({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-gray-800/[80%] p-3 shadow-lg backdrop-blur-3xl">
      {children}
    </div>
  );
}
