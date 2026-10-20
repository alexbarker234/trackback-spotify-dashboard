import { runDueJobs } from "./runDue";

const TICK_MS = 60 * 1000;

let ticking = false;

async function tick(): Promise<void> {
  if (ticking) {
    console.log("[scheduler] previous tick still running");
    return;
  }

  ticking = true;
  try {
    await runDueJobs();
  } finally {
    ticking = false;
  }
}

export async function startScheduler(): Promise<void> {
  const external = process.env.USE_EXTERNAL_CRON === "true";

  if (external) {
    console.log("🕑 External scheduler tick");
  } else {
    console.log("🕑 Internal scheduler");
  }

  try {
    await tick();
  } catch (error) {
    console.error("[scheduler] tick failed:", error);
    process.exit(1);
  }

  if (external) {
    console.log("✅ Tick complete. Exiting.");
    process.exit(0);
  }

  setInterval(() => {
    tick().catch((error) => {
      console.error("[scheduler] tick failed:", error);
    });
  }, TICK_MS);

  console.log("⏰ Trackback service is running.");
}
