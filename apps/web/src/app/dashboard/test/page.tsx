import CalendarRangeSelector from "@/components/calendar/CalendarRangeSelector";

export default async function TestPage() {
  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-y-6">
        <h1 className="mb-8 text-3xl font-bold text-white">Chart Testing</h1>
        <CalendarRangeSelector />
      </div>
    </div>
  );
}
