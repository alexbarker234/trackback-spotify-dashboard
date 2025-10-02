import { formatDuration, formatTime } from "@/lib/utils/timeUtils";
import LocalDate from "./LocalDate";
import LocalTime from "./LocalTime";

export interface Stats {
  totalListens: number;
  totalDuration: number;
  yearListens: number;
  yearDuration: number;
  monthListens: number;
  monthDuration: number;
  weekListens: number;
  weekDuration: number;
  firstListen: Date | null;
  lastListen: Date | null;
  avgDuration: number;
  completionRate: number;
}

export default function StatGrid({ stats }: { stats: Stats }) {
  return (
    <div className="flex flex-col gap-4 lg:gap-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
        {/* Total Listens */}
        <div className="rounded-lg bg-zinc-800 p-6">
          <h3 className="mb-2 text-sm font-medium text-zinc-400">Total Listens</h3>
          <p className="text-3xl font-bold text-zinc-100">{stats.totalListens.toLocaleString()}</p>
          <p className="text-sm text-zinc-500">{formatDuration(stats.totalDuration)} total time</p>
        </div>

        {/* This Year */}
        <div className="rounded-lg bg-zinc-800 p-6">
          <h3 className="mb-2 text-sm font-medium text-zinc-400">This Year</h3>
          <p className="text-3xl font-bold text-zinc-100">{stats.yearListens.toLocaleString()}</p>
          <p className="text-sm text-zinc-500">{formatDuration(stats.yearDuration)} total time</p>
        </div>

        {/* This Month */}
        <div className="rounded-lg bg-zinc-800 p-6">
          <h3 className="mb-2 text-sm font-medium text-zinc-400">This Month</h3>
          <p className="text-3xl font-bold text-zinc-100">{stats.monthListens.toLocaleString()}</p>
          <p className="text-sm text-zinc-500">{formatDuration(stats.monthDuration)} total time</p>
        </div>

        {/* This Week */}
        <div className="rounded-lg bg-zinc-800 p-6">
          <h3 className="mb-2 text-sm font-medium text-zinc-400">This Week</h3>
          <p className="text-3xl font-bold text-zinc-100">{stats.weekListens.toLocaleString()}</p>
          <p className="text-sm text-zinc-500">{formatDuration(stats.weekDuration)} total time</p>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Listen History */}
        <div className="rounded-lg bg-zinc-800 p-6">
          <h3 className="mb-4 text-lg font-semibold text-zinc-100">Listen History</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-zinc-400">First Listen:</span>
              <span className="text-right text-zinc-100">
                {stats.firstListen ? (
                  <>
                    <LocalDate date={stats.firstListen} />
                    <br />
                    <LocalTime date={stats.firstListen} />
                  </>
                ) : (
                  "Never"
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Last Listen:</span>
              <span className="text-right text-zinc-100">
                {stats.lastListen ? (
                  <>
                    <LocalDate date={stats.lastListen} />
                    <br />
                    <LocalTime date={stats.lastListen} />
                  </>
                ) : (
                  "Never"
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Listen Quality */}
        <div className="rounded-lg bg-zinc-800 p-6">
          <h3 className="mb-4 text-lg font-semibold text-zinc-100">Listen Quality</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-zinc-400">Average Duration:</span>
              <span className="text-zinc-100">{formatTime(stats.avgDuration)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-400">Completion Rate:</span>
              <span className="text-zinc-100">{stats.completionRate.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
