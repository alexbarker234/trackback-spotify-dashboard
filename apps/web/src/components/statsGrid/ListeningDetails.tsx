import { formatTime } from "@/lib/utils/timeUtils";
import LocalDate from "../LocalDate";
import LocalTime from "../LocalTime";

export interface ListeningDetailsData {
  firstListen: Date | null;
  lastListen: Date | null;
  avgDuration: number;
  completionRate: number;
}

export default function ListeningDetails({ stats }: { stats: ListeningDetailsData }) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {/* Listen History */}
      <div className="rounded-2xl bg-white/5 p-6 backdrop-blur-sm">
        <h3 className="mb-4 text-lg font-semibold text-white">Listen History</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-400">First Listen:</span>
            <span className="text-right text-white">
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
            <span className="text-gray-400">Last Listen:</span>
            <span className="text-right text-white">
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
      <div className="rounded-2xl bg-white/5 p-6 backdrop-blur-sm">
        <h3 className="mb-4 text-lg font-semibold text-white">Listen Quality</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-400">Average Duration:</span>
            <span className="text-white">{formatTime(stats.avgDuration)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Completion Rate:</span>
            <span className="text-white">{stats.completionRate.toFixed(1)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
