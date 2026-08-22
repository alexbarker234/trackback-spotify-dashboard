import { formatDate, formatTime } from "@/lib/utils/timeUtils";
import LocalDate from "../LocalDate";
import LocalTime from "../LocalTime";

export interface ListeningDetailsData {
  firstListen: Date | null;
  lastListen: Date | null;
  avgDuration: number;
  peakDayListenCount: number;
  peakDayDate: string | null;
}

function formatPeakDate(isoDate: string) {
  const [year, month, day] = isoDate.split("-").map(Number);
  if (!year || !month || !day) return isoDate;
  return formatDate(new Date(year, month - 1, day).getTime());
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

      {/* Highlights */}
      <div className="rounded-2xl bg-white/5 p-6 backdrop-blur-sm">
        <h3 className="mb-4 text-lg font-semibold text-white">Highlights</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-400">Average Duration:</span>
            <span className="text-white">{formatTime(stats.avgDuration)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Most in one day:</span>
            <span className="text-right text-white">
              {stats.peakDayDate ? (
                <>
                  {stats.peakDayListenCount} listen{stats.peakDayListenCount === 1 ? "" : "s"}
                  <br />
                  {formatPeakDate(stats.peakDayDate)}
                </>
              ) : (
                "Never"
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
