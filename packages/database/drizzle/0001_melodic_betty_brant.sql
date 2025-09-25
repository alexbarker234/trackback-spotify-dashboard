ALTER TABLE "listen" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "listen" ALTER COLUMN "artist_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "listen" ALTER COLUMN "album_id" DROP NOT NULL;--> statement-breakpoint
DELETE FROM "listen";
ALTER TABLE "listen" ADD COLUMN "imported" boolean NOT NULL;