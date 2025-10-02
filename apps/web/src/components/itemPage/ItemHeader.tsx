import Link from "next/link";

interface ItemHeaderProps {
  imageUrl: string;
  name: string;
  artists?: { id: string; name: string }[];
  subtitle: string;
}

export default function ItemHeader({ imageUrl, name, artists, subtitle }: ItemHeaderProps) {
  return (
    <div className="flex gap-4">
      <img src={imageUrl} className="h-32 w-32 flex-shrink-0 rounded-lg object-cover" />
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold text-zinc-100">{name}</h1>
        {artists && artists.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {artists.map((artist) => (
              <Link
                key={artist.id}
                href={`/artist/${artist.id}`}
                className="text-lg text-zinc-300 transition-colors hover:text-zinc-400"
              >
                {artist.name}
              </Link>
            ))}
          </div>
        )}
        <div className="text-sm text-zinc-400">{subtitle}</div>
      </div>
    </div>
  );
}
