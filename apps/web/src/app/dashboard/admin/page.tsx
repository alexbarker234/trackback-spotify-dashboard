import JobStatePanel, { type JobStateView } from "@/components/admin/JobStatePanel";
import { asc, db, jobState } from "@workspace/database";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Background Jobs"
};

const JOB_ORDER = ["recently-played", "enrichment", "release-year-backfill"];

const JOB_LABELS: Record<string, string> = {
  "recently-played": "Recently played",
  enrichment: "Enrichment",
  "release-year-backfill": "Release year backfill"
};

function toIso(date: Date | null): string | null {
  return date ? date.toISOString() : null;
}

function jobStatus(
  row: {
    completedAt: Date | null;
    lockedUntil: Date | null;
    lastError: string | null;
    runRequestedAt: Date | null;
    nextRunAt: Date;
  },
  now: Date
): JobStateView["status"] {
  if (row.lockedUntil && row.lockedUntil > now) return "running";
  if (row.completedAt) return "completed";
  if (row.lastError && row.nextRunAt > now) return "retrying";
  if (row.runRequestedAt) return "requested";
  if (row.nextRunAt <= now) return "due";
  return "scheduled";
}

export default async function AdminPage() {
  const now = new Date();
  const rows = await db.select().from(jobState).orderBy(asc(jobState.jobId));

  const jobs: JobStateView[] = rows
    .map((row) => ({
      jobId: row.jobId,
      label: JOB_LABELS[row.jobId] ?? row.jobId,
      status: jobStatus(row, now),
      nextRunAt: row.nextRunAt.toISOString(),
      lastFinishedAt: toIso(row.lastFinishedAt),
      lastError: row.lastError,
      runRequestedAt: toIso(row.runRequestedAt),
      lockedAt: toIso(row.lockedAt),
      lockedUntil: toIso(row.lockedUntil),
      completedAt: toIso(row.completedAt)
    }))
    .sort((a, b) => {
      const aIndex = JOB_ORDER.indexOf(a.jobId);
      const bIndex = JOB_ORDER.indexOf(b.jobId);
      return (aIndex === -1 ? JOB_ORDER.length : aIndex) - (bIndex === -1 ? JOB_ORDER.length : bIndex);
    });

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-4">
      <JobStatePanel jobs={jobs} now={now.toISOString()} />
    </div>
  );
}
