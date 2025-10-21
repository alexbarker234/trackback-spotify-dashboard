import DailyUniqueRateChart from "@/components/charts/DailyUniqueRateChart";
import DailyUniqueStreamsChart from "@/components/charts/DailyUniqueStreamsChart";
import HourlyListensRadialChart from "@/components/charts/HourlyListensRadialChart";
import ListeningHeatmap from "@/components/charts/ListeningHeatmap";
import { getDailyUniqueStreamData, getHourlyListenData } from "@workspace/core/queries/listens";

export default async function TestPage() {
  const dailyUniqueData = await getDailyUniqueStreamData({ groupBy: "day" });
  const weeklyData = await getDailyUniqueStreamData({ groupBy: "week" });
  const hourlyData = await getHourlyListenData();

  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-y-6">
        <h1 className="mb-8 text-3xl font-bold text-white">Chart Testing</h1>
        <ListeningHeatmap />
        <HourlyListensRadialChart data={hourlyData} />
        <DailyUniqueStreamsChart data={dailyUniqueData} />
        <DailyUniqueRateChart data={weeklyData} groupBy="week" />
      </div>
    </div>
  );
}
