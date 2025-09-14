import cron from "node-cron";
import { fetchRecentlyPlayedTracksService } from "./services";

cron.schedule("*/2 * * * *", fetchRecentlyPlayedTracksService);

// Run initial fetch immediately
console.log("🚀 Starting Trackback service...");
fetchRecentlyPlayedTracksService();

process.on("SIGINT", () => {
  console.log(`\n🛑 Shutting down Trackback service...`);
  process.exit(0);
});

console.log(`⏰ Trackback service is running.`);
