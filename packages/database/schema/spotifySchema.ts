import { integer, pgTable, primaryKey, text, timestamp, uuid } from "drizzle-orm/pg-core";

// UNIQUE - Distinguished by ISRC
export const track = pgTable("track", {
  isrc: text("isrc").primaryKey(),
  name: text("name").notNull(),
  durationMS: integer("duration_ms").notNull()
});

export const trackArtist = pgTable(
  "track_artist",
  {
    trackIsrc: text("track_isrc").notNull(),
    artistId: text("artist_id").notNull()
  },
  (table) => [primaryKey({ columns: [table.trackIsrc, table.artistId] })]
);

export const album = pgTable("album", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  imageUrl: text("image_url")
});

export const artist = pgTable("artist", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  imageUrl: text("image_url")
});

export const albumTrack = pgTable(
  "album_track",
  {
    albumId: text("album_id").notNull(),
    trackId: text("track_id").notNull(), // Unique to that album and track
    trackIsrc: text("track_isrc").notNull() // Points to the track record
  },
  (table) => [primaryKey({ columns: [table.albumId, table.trackId] })]
);

export const listen = pgTable("listen", {
  id: uuid("id").primaryKey(),
  durationMS: integer("duration_ms").notNull(),
  playedAt: timestamp("played_at").notNull(),
  trackId: text("track_id").notNull(),
  artistId: text("artist_id").notNull(),
  albumId: text("album_id").notNull()
});
