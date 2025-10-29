"use client";

import StreamItemCard from "@/components/itemCards/StreamItemCard";
import ItemCarousel from "@/components/ItemCarousel";
import ItemTypeSelector, { ItemType } from "@/components/ItemTypeSelector";
import NoData from "@/components/NoData";
import { OnThisDayAlbum, OnThisDayArtist, OnThisDayTrack } from "@workspace/core/queries/throwback";
import { useState } from "react";

type ThrowbackClientPageProps = {
  artists: OnThisDayArtist[];
  tracks: OnThisDayTrack[];
  albums: OnThisDayAlbum[];
  isStandalone: boolean;
};

function ArtistsSection({ artists }: { artists: OnThisDayArtist[] }) {
  if (artists.length === 0) return null;

  // Group artists by year
  const artistsByYear = artists.reduce(
    (acc, artist) => {
      if (!acc[artist.year]) {
        acc[artist.year] = [];
      }
      acc[artist.year].push(artist);
      return acc;
    },
    {} as Record<number, typeof artists>
  );

  return (
    <div className="space-y-6">
      {Object.entries(artistsByYear)
        .sort(([a], [b]) => Number(b) - Number(a))
        .map(([year, yearArtists]) => (
          <ItemCarousel
            key={year}
            title={`Artists on this day in ${year}`}
            subtitle={`${yearArtists.length} artists`}
          >
            {yearArtists.slice(0, 20).map((artist, index) => (
              <StreamItemCard
                key={`${artist.id}-${year}`}
                href={`/dashboard/artist/${artist.id}`}
                imageUrl={artist.imageUrl}
                number={index + 1}
                title={artist.name}
                subtitle={`${artist.listenCount} streams`}
                streams={artist.listenCount}
                durationMs={artist.totalDuration}
              />
            ))}
          </ItemCarousel>
        ))}
    </div>
  );
}

function TracksSection({ tracks }: { tracks: OnThisDayTrack[] }) {
  if (tracks.length === 0) return null;

  // Group tracks by year
  const tracksByYear = tracks.reduce(
    (acc, track) => {
      if (!acc[track.year]) {
        acc[track.year] = [];
      }
      acc[track.year].push(track);
      return acc;
    },
    {} as Record<number, typeof tracks>
  );

  return (
    <div className="space-y-6">
      {Object.entries(tracksByYear)
        .sort(([a], [b]) => Number(b) - Number(a))
        .map(([year, yearTracks]) => (
          <ItemCarousel
            key={year}
            title={`Tracks on this day in ${year}`}
            subtitle={`${yearTracks.length} tracks`}
          >
            {yearTracks.slice(0, 20).map((track, index) => (
              <StreamItemCard
                key={`${track.id}-${year}`}
                href={`/dashboard/track/${track.id}`}
                imageUrl={track.imageUrl}
                number={index + 1}
                title={track.name}
                subtitle={track.artists.map((a) => a.artistName).join(", ")}
                streams={track.listenCount}
                durationMs={track.totalDuration}
              />
            ))}
          </ItemCarousel>
        ))}
    </div>
  );
}

function AlbumsSection({ albums }: { albums: OnThisDayAlbum[] }) {
  if (albums.length === 0) return null;

  // Group albums by year
  const albumsByYear = albums.reduce(
    (acc, album) => {
      if (!acc[album.year]) {
        acc[album.year] = [];
      }
      acc[album.year].push(album);
      return acc;
    },
    {} as Record<number, typeof albums>
  );

  return (
    <div className="space-y-6">
      {Object.entries(albumsByYear)
        .sort(([a], [b]) => Number(b) - Number(a))
        .map(([year, yearAlbums]) => (
          <ItemCarousel
            key={year}
            title={`Albums on this day in ${year}`}
            subtitle={`${yearAlbums.length} albums`}
          >
            {yearAlbums.slice(0, 20).map((album, index) => (
              <StreamItemCard
                key={`${album.id}-${year}`}
                href={`/dashboard/album/${album.id}`}
                imageUrl={album.imageUrl}
                number={index + 1}
                title={album.name}
                subtitle={album.artistNames.join(", ")}
                streams={album.listenCount}
                durationMs={album.totalDuration}
              />
            ))}
          </ItemCarousel>
        ))}
    </div>
  );
}

export default function ThrowbackClientPage({
  artists,
  tracks,
  albums,
  isStandalone
}: ThrowbackClientPageProps) {
  const [selectedItemType, setSelectedItemType] = useState<ItemType>("artists");

  const hasData = artists.length > 0 || tracks.length > 0 || albums.length > 0;

  if (!hasData) {
    return (
      <div className="mx-auto my-4 flex w-full max-w-7xl flex-1 flex-col gap-5 p-4">
        <div className="text-center">
          <h1 className="mb-4 text-3xl font-bold text-white">On This Day</h1>
          <p className="text-lg text-gray-400">
            No listening history found for this day in previous years.
          </p>
        </div>
        <NoData />
      </div>
    );
  }

  const renderSelectedContent = () => {
    switch (selectedItemType) {
      case "artists":
        return <ArtistsSection artists={artists} />;
      case "tracks":
        return <TracksSection tracks={tracks} />;
      case "albums":
        return <AlbumsSection albums={albums} />;
      default:
        return <ArtistsSection artists={artists} />;
    }
  };

  return (
    <div className="mx-auto my-4 flex w-full max-w-7xl flex-1 flex-col gap-4 p-4">
      {!isStandalone && <h1 className="text-center text-3xl font-bold text-white">On This Day</h1>}

      <div className="flex justify-center">
        <ItemTypeSelector itemType={selectedItemType} onItemTypeChange={setSelectedItemType} />
      </div>

      <p className="text-center text-lg text-gray-400">
        Your listening history on this day in previous years
      </p>

      {renderSelectedContent()}
    </div>
  );
}
