import { populateAlbumArtistData } from "@/services/albumArtistService";
import { populateAlbumTrackService } from "@/services/albumTrackService";
import { refetchArtistData } from "@/services/refetchArtistService";
import { backfillAlbumReleaseYearsService } from "@/services/releaseYearBackfillService";
import { fetchRecentlyPlayedTracksService } from "@/services/spotifyService";
import { ENRICHMENT_JOB_ID, RECENTLY_PLAYED_JOB_ID, RELEASE_YEAR_BACKFILL_JOB_ID } from "./ids";
import { requestJob } from "./jobState";

const FIVE_MINUTES_MS = 5 * 60 * 1000;
const THIRTY_MINUTES_MS = 30 * 60 * 1000;

type RecurringJob = {
  id: string;
  everyMs: number;
  run: () => Promise<void>;
};

type OnceJob = {
  id: string;
  once: true;
  run: () => Promise<"continue" | "complete">;
};

export type Job = RecurringJob | OnceJob;

export function isOnceJob(job: Job): job is OnceJob {
  return "once" in job;
}

async function runEnrichment(): Promise<void> {
  const tracks = await populateAlbumTrackService();
  const albums = await populateAlbumArtistData();
  await refetchArtistData();

  if (tracks.more || albums.more) {
    await requestJob(ENRICHMENT_JOB_ID);
  }
}

export const jobs: Job[] = [
  {
    id: RECENTLY_PLAYED_JOB_ID,
    everyMs: FIVE_MINUTES_MS,
    run: fetchRecentlyPlayedTracksService
  },
  {
    id: ENRICHMENT_JOB_ID,
    everyMs: THIRTY_MINUTES_MS,
    run: runEnrichment
  },
  {
    id: RELEASE_YEAR_BACKFILL_JOB_ID,
    once: true,
    run: () => backfillAlbumReleaseYearsService({ limit: 50 })
  }
];
