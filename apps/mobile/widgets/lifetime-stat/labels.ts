import type { WidgetLifetimeStats } from "@/lib/types";

const FULL_LABELS = {
  streams: "Total streams",
  minutes: "Total minutes",
  hours: "Total hours",
  tracks: "Unique tracks",
  albums: "Unique albums",
  artists: "Unique artists",
} as const;

const SHORT_LABELS = {
  streams: "Streams",
  minutes: "Minutes",
  hours: "Hours",
  tracks: "Tracks",
  albums: "Albums",
  artists: "Artists",
} as const;

export type LifetimeStatKey = keyof typeof FULL_LABELS;

export function getLifetimeStatLabel(key: LifetimeStatKey, shortLabels: boolean): string {
  return shortLabels ? SHORT_LABELS[key] : FULL_LABELS[key];
}

export function getLifetimeStatValue(stats: WidgetLifetimeStats, key: LifetimeStatKey): number {
  switch (key) {
    case "streams":
      return stats.totalStreams;
    case "minutes":
      return stats.minutesListened;
    case "hours":
      return stats.hoursListened;
    case "tracks":
      return stats.uniqueTracks;
    case "albums":
      return stats.uniqueAlbums;
    case "artists":
      return stats.uniqueArtists;
  }
}

export const LIFETIME_STAT_KEYS: LifetimeStatKey[] = [
  "streams",
  "minutes",
  "hours",
  "tracks",
  "albums",
  "artists",
];
