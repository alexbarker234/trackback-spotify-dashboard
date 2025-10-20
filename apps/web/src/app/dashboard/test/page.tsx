import DailyUniqueRateChart from "@/components/charts/DailyUniqueRateChart";
import DailyUniqueStreamsChart from "@/components/charts/DailyUniqueStreamsChart";
import HourlyListensRadialChart from "@/components/charts/HourlyListensRadialChart";
import ListeningHeatmap from "@/components/charts/ListeningHeatmap";
import { getDailyStreamData, getDailyUniqueStreamData, getHourlyListenData } from "@workspace/core/queries/listens";

export default async function TestPage() {
  const currentYear = new Date().getFullYear();
  const startDate = new Date(Date.UTC(currentYear, 0, 1)); // January 1st UTC
  const endDate = new Date(Date.UTC(currentYear, 11, 31, 23, 59, 59, 999)); // December 31st UTC (end of day)

  const dailyData = await getDailyStreamData({ startDate, endDate });
  const dailyUniqueData = await getDailyUniqueStreamData({ groupBy: "day" });
  const weeklyData = await getDailyUniqueStreamData({ groupBy: "week" });
  const hourlyData = await getHourlyListenData();

  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <h1 className="mb-8 text-3xl font-bold text-white">Chart Testing</h1>
        <ListeningHeatmap data={dailyData} />
        <HourlyListensRadialChart data={hourlyData} />
        <DailyUniqueStreamsChart data={dailyUniqueData} />
        <DailyUniqueRateChart data={weeklyData} groupBy="week" />
      </div>
    </div>
  );
}
