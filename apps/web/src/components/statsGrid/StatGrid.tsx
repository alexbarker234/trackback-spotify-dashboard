import ListeningDetails, { ListeningDetailsData } from "./ListeningDetails";
import ListeningMetricsGrid, { ListeningMetricsData } from "./ListeningMetricsGrid";

export type Stats = ListeningMetricsData & ListeningDetailsData;

export default function StatGrid({ stats }: { stats: Stats }) {
  return (
    <div className="flex flex-col gap-4 lg:gap-6">
      <ListeningMetricsGrid stats={stats} />
      <ListeningDetails stats={stats} />
    </div>
  );
}
