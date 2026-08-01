import { faSpotify } from "@fortawesome/free-brands-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";

interface ItemHeaderProps {
  imageUrl: string;
  name: string;
  artists?: { id: string; name: string }[];
  subtitle: string;
  spotifyUrl?: string | null;
}

export default function ItemHeader({
  imageUrl,
  name,
  artists,
  subtitle,
  spotifyUrl
}: ItemHeaderProps) {
  return (
    <div className="flex gap-4">
      {/* Image */}
      <img src={imageUrl} className="h-32 w-32 flex-shrink-0 rounded-lg object-cover" />
      {/* Content */}
      <div className="flex flex-col gap-1">
        <h1 className="text-4xl font-bold text-zinc-100">{name}</h1>
        {artists && artists.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {artists.map((artist) => (
              <Link
                key={artist.id}
                href={`/dashboard/artist/${artist.id}`}
                className="text-lg text-zinc-300 transition-colors hover:text-zinc-400"
              >
                {artist.name}
              </Link>
            ))}
          </div>
        )}
        <div className="text-sm text-zinc-400">{subtitle}</div>
        {spotifyUrl && (
          <a
            href={spotifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-fit cursor-pointer items-center gap-1 text-sm text-gray-400 transition-colors hover:text-gray-300"
          >
            <FontAwesomeIcon icon={faSpotify} className="h-4 w-4" />
            Open in Spotify
          </a>
        )}
      </div>
    </div>
  );
}
