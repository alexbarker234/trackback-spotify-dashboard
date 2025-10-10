import DailyUniqueStreamsChart from "@/components/charts/DailyUniqueStreamsChart";
import { getDailyUniqueStreamData } from "@workspace/core/queries/listens";

export default async function TestPage() {
  const data = await getDailyUniqueStreamData();
  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-8 text-3xl font-bold text-white">Chart Testing</h1>
        <DailyUniqueStreamsChart data={data} />
      </div>
    </div>
  );
}
