import { TopAlbum } from "@/types";
import AlbumCard from "./AlbumCard";

export default function AlbumGrid({ albums }: { albums: TopAlbum[] }) {
  return (
    <div>
      <h3 className="mb-4 text-lg font-semibold text-zinc-100">Top Albums</h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {albums.map((album, index) => (
          <AlbumCard key={album.albumId} album={album} rank={index + 1} />
        ))}
      </div>
    </div>
  );
}
