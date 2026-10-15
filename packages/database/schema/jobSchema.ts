import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const jobState = pgTable("job_state", {
  jobId: text("job_id").primaryKey(),
  nextRunAt: timestamp("next_run_at", { withTimezone: true, mode: "date" }).notNull(),
  lockedUntil: timestamp("locked_until", { withTimezone: true, mode: "date" }),
  lockToken: text("lock_token"),
  lockedAt: timestamp("locked_at", { withTimezone: true, mode: "date" }),
  lastFinishedAt: timestamp("last_finished_at", { withTimezone: true, mode: "date" }),
  lastError: text("last_error"),
  runRequestedAt: timestamp("run_requested_at", { withTimezone: true, mode: "date" }),
  completedAt: timestamp("completed_at", { withTimezone: true, mode: "date" })
});
