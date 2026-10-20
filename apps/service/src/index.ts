import { startScheduler } from "./scheduler";

console.log("🚀 Starting Trackback service...");

startScheduler().catch((error) => {
  console.error("[scheduler] failed to start:", error);
  process.exit(1);
});

process.on("SIGINT", () => {
  console.log(`\n🛑 Shutting down Trackback service...`);
  process.exit(0);
});
