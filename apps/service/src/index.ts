import cron from "node-cron";
import { fetchRecentlyPlayedTracksService, populateImportedListensService } from "./services";

cron.schedule("*/2 * * * *", fetchRecentlyPlayedTracksService);
cron.schedule("*/30 * * * *", populateImportedListensService);

// Run initial fetch immediately
console.log("🚀 Starting Trackback service...");
fetchRecentlyPlayedTracksService();
populateImportedListensService();

process.on("SIGINT", () => {
  console.log(`\n🛑 Shutting down Trackback service...`);
  process.exit(0);
});

console.log(`⏰ Trackback service is running.`);
