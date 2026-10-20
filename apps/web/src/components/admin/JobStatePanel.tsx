"use client";

export type JobStateView = {
  jobId: string;
  label: string;
  status: "running" | "retrying" | "completed" | "requested" | "due" | "scheduled";
  nextRunAt: string;
  lastFinishedAt: string | null;
  lastError: string | null;
  runRequestedAt: string | null;
  lockedAt: string | null;
  lockedUntil: string | null;
  completedAt: string | null;
};

const STATUS_LABEL: Record<JobStateView["status"], string> = {
  running: "Running",
  retrying: "Retrying",
  completed: "Completed",
  requested: "Requested",
  due: "Due",
  scheduled: "Scheduled"
};

const STATUS_CLASS: Record<JobStateView["status"], string> = {
  running: "bg-amber-400/15 text-amber-200",
  retrying: "bg-red-400/15 text-red-200",
  completed: "bg-white/10 text-zinc-300",
  requested: "bg-purple-400/15 text-purple-200",
  due: "bg-emerald-400/15 text-emerald-200",
  scheduled: "bg-white/10 text-zinc-400"
};

const TIMESTAMP_FORMAT = new Intl.DateTimeFormat("en-AU", {
  timeZone: "Etc/GMT-8",
  day: "numeric",
  month: "short",
  hour: "numeric",
  minute: "2-digit",
  hour12: true
});

function formatTimestamp(iso: string): string {
  return TIMESTAMP_FORMAT.format(new Date(iso));
}

function relativeTime(iso: string, now: number): string {
  const deltaMs = new Date(iso).getTime() - now;
  const past = deltaMs < 0;
  const minutes = Math.round(Math.abs(deltaMs) / 60000);

  if (minutes < 1) return past ? "just now" : "now";
  if (minutes < 60) return past ? `${minutes}m ago` : `in ${minutes}m`;

  const hours = Math.round(minutes / 60);
  if (hours < 48) return past ? `${hours}h ago` : `in ${hours}h`;

  const days = Math.round(hours / 24);
  return past ? `${days}d ago` : `in ${days}d`;
}

function TimeCell({ iso, now }: { iso: string | null; now: number }) {
  if (!iso) return <span className="text-zinc-500">—</span>;

  return (
    <div>
      <div className="text-zinc-200">{formatTimestamp(iso)}</div>
      <div className="text-xs text-zinc-500">{relativeTime(iso, now)}</div>
    </div>
  );
}

export default function JobStatePanel({ jobs, now }: { jobs: JobStateView[]; now: string }) {
  const renderedAt = new Date(now).getTime();
  return (
    <section className="overflow-hidden rounded-lg bg-white/5 backdrop-blur-sm">
      {/* Header */}
      <h1 className="border-b border-white/10 px-5 py-4 text-xl font-semibold text-white">Background Jobs</h1>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="text-xs tracking-wide text-zinc-500 uppercase">
            <tr className="border-b border-white/10">
              <th className="px-5 py-3 font-medium">Job</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Next run</th>
              <th className="px-5 py-3 font-medium">Last finished</th>
              <th className="px-5 py-3 font-medium">Last error</th>
            </tr>
          </thead>
          <tbody>
            {jobs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-zinc-400">
                  No jobs have been scheduled yet.
                </td>
              </tr>
            ) : (
              jobs.map((job) => (
                <tr key={job.jobId} className="border-b border-white/5 last:border-0">
                  <td className="px-5 py-4">
                    <div className="font-medium text-white">{job.label}</div>
                    <div className="text-xs text-zinc-500">{job.jobId}</div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_CLASS[job.status]}`}>
                      {STATUS_LABEL[job.status]}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <TimeCell iso={job.status === "completed" ? null : job.nextRunAt} now={renderedAt} />
                  </td>
                  <td className="px-5 py-4">
                    <TimeCell iso={job.lastFinishedAt} now={renderedAt} />
                  </td>
                  <td className={`max-w-xs px-5 py-4 ${job.lastError ? "text-red-200" : "text-zinc-500"}`}>
                    {job.lastError ?? "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
