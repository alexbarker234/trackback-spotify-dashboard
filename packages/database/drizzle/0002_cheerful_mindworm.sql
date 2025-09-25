CREATE TABLE "album_artist" (
	"album_id" text NOT NULL,
	"artist_id" text NOT NULL,
	CONSTRAINT "album_artist_album_id_artist_id_pk" PRIMARY KEY("album_id","artist_id")
);
--> statement-breakpoint
ALTER TABLE "listen" DROP COLUMN "artist_id";--> statement-breakpoint
ALTER TABLE "listen" DROP COLUMN "album_id";