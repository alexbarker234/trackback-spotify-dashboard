import cron from "node-cron";
import { fetchRecentlyPlayedTracksService, populateImportedListensService } from "./services";

console.log("🚀 Starting Trackback service...");

if (process.env.USE_EXTERNAL_CRON != "true") {
  console.log("🕑 Starting Trackback cron service...");
  cron.schedule("*/2 * * * *", fetchRecentlyPlayedTracksService);
  cron.schedule("*/30 * * * *", populateImportedListensService);
} else {
  console.log("🕑 Using external cron service...");
}

// Run initial fetch immediately
fetchRecentlyPlayedTracksService();
populateImportedListensService();

process.on("SIGINT", () => {
  console.log(`\n🛑 Shutting down Trackback service...`);
  process.exit(0);
});

console.log(`⏰ Trackback service is running.`);
