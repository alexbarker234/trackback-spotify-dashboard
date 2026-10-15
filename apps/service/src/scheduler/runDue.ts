import { jobs, isOnceJob, type Job } from "./jobs";
import {
  claimJob,
  ensureJobRows,
  failJob,
  finishOnceComplete,
  finishOnceContinue,
  finishRecurring
} from "./jobState";

export type TickAction = "ran" | "skipped" | "failed" | "continued" | "completed";

async function runClaimedJob(job: Job, lockToken: string): Promise<TickAction> {
  try {
    if (isOnceJob(job)) {
      const outcome = await job.run();
      if (outcome === "continue") {
        await finishOnceContinue(job.id, lockToken);
        return "continued";
      }
      await finishOnceComplete(job.id, lockToken);
      return "completed";
    }

    await job.run();
    await finishRecurring(job.id, lockToken, job.everyMs);
    return "ran";
  } catch (error) {
    console.error(`[scheduler] ${job.id} failed:`, error);
    await failJob(job.id, lockToken, error);
    return "failed";
  }
}

export async function runDueJobs(): Promise<void> {
  await ensureJobRows(jobs.map((job) => job.id));

  const summary: string[] = [];

  for (const job of jobs) {
    const lockToken = await claimJob(job.id);
    if (!lockToken) {
      summary.push(`${job.id}=skipped`);
      continue;
    }

    const action = await runClaimedJob(job, lockToken);
    summary.push(`${job.id}=${action}`);
  }

  console.log(`[scheduler] ${summary.join(" ")}`);
}
