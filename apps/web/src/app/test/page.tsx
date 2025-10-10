import DailyUniqueRateChart from "@/components/charts/DailyUniqueRateChart";
import DailyUniqueStreamsChart from "@/components/charts/DailyUniqueStreamsChart";
import { getDailyUniqueStreamData } from "@workspace/core/queries/listens";

export default async function TestPage() {
  const dailyData = await getDailyUniqueStreamData({ groupBy: "day" });
  const weeklyData = await getDailyUniqueStreamData({ groupBy: "week" });

  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <h1 className="mb-8 text-3xl font-bold text-white">Chart Testing</h1>
        <DailyUniqueStreamsChart data={dailyData} />
        <DailyUniqueRateChart data={weeklyData} groupBy="week" />
      </div>
    </div>
  );
}
