import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { album, albumTrack, artist, listen, track, trackArtist } from "./schema/spotifySchema";

export type Listen = InferSelectModel<typeof listen>;
export type Track = InferSelectModel<typeof track>;
export type Artist = InferSelectModel<typeof artist>;
export type Album = InferSelectModel<typeof album>;
export type TrackArtist = InferSelectModel<typeof trackArtist>;
export type AlbumTrack = InferSelectModel<typeof albumTrack>;

export type ListenInsert = InferInsertModel<typeof listen>;
export type TrackInsert = InferInsertModel<typeof track>;
export type ArtistInsert = InferInsertModel<typeof artist>;
export type AlbumInsert = InferInsertModel<typeof album>;
export type TrackArtistInsert = InferInsertModel<typeof trackArtist>;
export type AlbumTrackInsert = InferInsertModel<typeof albumTrack>;
