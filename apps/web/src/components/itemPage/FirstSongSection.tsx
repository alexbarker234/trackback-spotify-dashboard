import ListenCard from "@/components/cards/ListenCard";
import { getRecentListens } from "@workspace/core";

export default async function FirstSongSection({
  artistId,
  albumId
}: {
  artistId?: string;
  albumId?: string;
}) {
  const [firstListen] = await getRecentListens({
    artistId,
    albumId,
    limit: 1,
    order: "asc"
  });

  if (!firstListen) return null;

  return (
    <div>
      <h3 className="mb-4 text-lg font-semibold text-zinc-100">First Song</h3>
      <ListenCard listen={firstListen} />
    </div>
  );
}
