import { and, db, eq, isNotNull, isNull, jobState, or, sql } from "@workspace/database";
import { randomUUID } from "crypto";

const LEASE = sql`interval '10 minutes'`;
const FAILURE_BACKOFF = sql`interval '5 minutes'`;

export async function ensureJobRows(jobIds: string[]): Promise<void> {
  if (jobIds.length === 0) return;

  await db
    .insert(jobState)
    .values(
      jobIds.map((jobId) => ({
        jobId,
        nextRunAt: sql`now()`
      }))
    )
    .onConflictDoNothing({ target: jobState.jobId });
}

/**
 * Claims a due, unlocked job. A job is due when its schedule has elapsed or something requested a run.
 * The lease expires on its own if this process dies mid-run.
 */
export async function claimJob(jobId: string): Promise<string | null> {
  const lockToken = randomUUID();

  const claimed = await db
    .update(jobState)
    .set({
      lockToken,
      lockedAt: sql`now()`,
      lockedUntil: sql`now() + ${LEASE}`
    })
    .where(
      and(
        eq(jobState.jobId, jobId),
        isNull(jobState.completedAt),
        or(isNull(jobState.lockedUntil), sql`${jobState.lockedUntil} < now()`),
        or(sql`${jobState.nextRunAt} <= now()`, isNotNull(jobState.runRequestedAt))
      )
    )
    .returning({ jobId: jobState.jobId });

  return claimed.length > 0 ? lockToken : null;
}

export async function requestJob(jobId: string): Promise<void> {
  await db
    .update(jobState)
    .set({ runRequestedAt: sql`now()` })
    .where(and(eq(jobState.jobId, jobId), isNull(jobState.completedAt)));
}

export async function finishRecurring(
  jobId: string,
  lockToken: string,
  everyMs: number
): Promise<void> {
  await db
    .update(jobState)
    .set({
      lockedUntil: null,
      lockToken: null,
      lockedAt: null,
      lastFinishedAt: sql`now()`,
      lastError: null,
      nextRunAt: sql`now() + (${everyMs} * interval '1 millisecond')`,
      // A request that arrived after this run started still needs another pass.
      runRequestedAt: sql`case when ${jobState.runRequestedAt} > ${jobState.lockedAt} then ${jobState.runRequestedAt} else null end`
    })
    .where(and(eq(jobState.jobId, jobId), eq(jobState.lockToken, lockToken)));
}

export async function finishOnceContinue(jobId: string, lockToken: string): Promise<void> {
  await db
    .update(jobState)
    .set({
      lockedUntil: null,
      lockToken: null,
      lockedAt: null,
      lastFinishedAt: sql`now()`,
      lastError: null,
      nextRunAt: sql`now()`,
      runRequestedAt: sql`case when ${jobState.runRequestedAt} > ${jobState.lockedAt} then ${jobState.runRequestedAt} else null end`
    })
    .where(and(eq(jobState.jobId, jobId), eq(jobState.lockToken, lockToken)));
}

export async function finishOnceComplete(jobId: string, lockToken: string): Promise<void> {
  await db
    .update(jobState)
    .set({
      lockedUntil: null,
      lockToken: null,
      lockedAt: null,
      lastFinishedAt: sql`now()`,
      lastError: null,
      nextRunAt: sql`now()`,
      runRequestedAt: null,
      completedAt: sql`now()`
    })
    .where(and(eq(jobState.jobId, jobId), eq(jobState.lockToken, lockToken)));
}

export async function failJob(jobId: string, lockToken: string, error: unknown): Promise<void> {
  const message = error instanceof Error ? error.message : String(error);

  await db
    .update(jobState)
    .set({
      lockedUntil: null,
      lockToken: null,
      lockedAt: null,
      lastFinishedAt: sql`now()`,
      lastError: message.slice(0, 1000),
      nextRunAt: sql`now() + ${FAILURE_BACKOFF}`,
      runRequestedAt: sql`case when ${jobState.runRequestedAt} > ${jobState.lockedAt} then ${jobState.runRequestedAt} else null end`
    })
    .where(and(eq(jobState.jobId, jobId), eq(jobState.lockToken, lockToken)));
}
