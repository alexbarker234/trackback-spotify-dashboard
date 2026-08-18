import cron from "node-cron";
import {
  fetchRecentlyPlayedTracksService,
  backfillAlbumReleaseYearsService,
  populateAlbumArtistData,
  populateAlbumTrackService,
  refetchArtistData
} from "./services";

console.log("🚀 Starting Trackback service...");

const useInternalCron = process.env.USE_EXTERNAL_CRON != "true";

if (useInternalCron) {
  console.log("🕑 Starting Trackback cron service...");
  cron.schedule("*/2 * * * *", fetchRecentlyPlayedTracksService);
  cron.schedule("*/30 * * * *", () => {
    Promise.all([
      populateAlbumTrackService(),
      populateAlbumArtistData(),
      refetchArtistData()
    ]);
  });

  // Backfill album release years (used by release-year analytics pages).
  cron.schedule("0 */6 * * *", () => {
    backfillAlbumReleaseYearsService({ limit: 50 }).catch((e) => {
      console.error("Album release year backfill failed:", e);
    });
  });
} else {
  console.log("🕑 Using external cron service...");
}

Promise.all([
  fetchRecentlyPlayedTracksService(),
  populateAlbumTrackService(),
  populateAlbumArtistData(),
  refetchArtistData(),
  backfillAlbumReleaseYearsService({ limit: 50 })
]).then(() => {
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
