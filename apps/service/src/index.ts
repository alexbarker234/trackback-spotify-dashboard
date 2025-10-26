import cron from "node-cron";
import { fetchRecentlyPlayedTracksService, populateImportedListensService } from "./services";

console.log("🚀 Starting Trackback service...");

const useInternalCron = process.env.USE_EXTERNAL_CRON != "true";

if (useInternalCron) {
  console.log("🕑 Starting Trackback cron service...");
  cron.schedule("*/2 * * * *", fetchRecentlyPlayedTracksService);
  cron.schedule("*/30 * * * *", populateImportedListensService);
} else {
  console.log("🕑 Using external cron service...");
}

Promise.all([fetchRecentlyPlayedTracksService(), populateImportedListensService()]).then(() => {
  if (!useInternalCron) {
    console.log("✅ Fetching complete. Exiting.");
    process.exit(0);
  }
});

process.on("SIGINT", () => {
  console.log(`\n🛑 Shutting down Trackback service...`);
  process.exit(0);
});

if (useInternalCron) {
  console.log(`⏰ Trackback service is running.`);
}
