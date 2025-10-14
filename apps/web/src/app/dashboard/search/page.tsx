"use client";

import SearchItemCard from "@/components/itemCards/SearchItemCard";
import Loading from "@/components/Loading";
import SearchBar from "@/components/SearchBar";
import { useSearch } from "@/hooks/useSearch";
import { faMusic } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Debounce the search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const { data: results, isLoading, error } = useSearch(debouncedQuery);

  const hasResults = results && (results.albums.length > 0 || results.tracks.length > 0 || results.artists.length > 0);

  return (
    <div className="mx-auto w-full max-w-7xl p-4">
      <div className="mb-8">
        <h1 className="mb-6 text-4xl font-bold text-zinc-100">Search Spotify</h1>
        <SearchBar value={query} onChange={setQuery} placeholder="Search for albums, tracks, or artists..." />
      </div>

      {error && (
        <div className="rounded-2xl bg-red-500/10 p-4 text-red-400">
          <p>{error instanceof Error ? error.message : "Failed to search. Please try again."}</p>
        </div>
      )}

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loading />
        </div>
      )}

      {!isLoading && debouncedQuery && !hasResults && (
        <div className="py-12 text-center text-gray-400">
          <FontAwesomeIcon icon={faMusic} className="mb-4 text-6xl text-gray-600" />
          <p className="text-xl">No results found for &quot;{debouncedQuery}&quot;</p>
        </div>
      )}

      {!isLoading && hasResults && results && (
        <div className="space-y-8">
          {/* Artists Section */}
          {results.artists.length > 0 && (
            <section>
              <h2 className="mb-4 text-2xl font-bold text-zinc-100">Artists</h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {results.artists.map((artist) => (
                  <SearchItemCard
                    key={artist.id}
                    href={`/dashboard/artist/${artist.id}`}
                    imageUrl={artist.imageUrl}
                    title={artist.name}
                    subtitle={`${artist.followers.toLocaleString()} followers`}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Albums Section */}
          {results.albums.length > 0 && (
            <section>
              <h2 className="mb-4 text-2xl font-bold text-zinc-100">Albums</h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {results.albums.map((album) => (
                  <SearchItemCard
                    key={album.id}
                    href={`/dashboard/album/${album.id}`}
                    imageUrl={album.imageUrl}
                    title={album.name}
                    subtitle={album.artists.join(", ")}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Tracks Section */}
          {results.tracks.length > 0 && (
            <section>
              <h2 className="mb-4 text-2xl font-bold text-zinc-100">Tracks</h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {results.tracks.map((track) => (
                  <SearchItemCard
                    key={track.id}
                    href={`/track/dashboard/${track.isrc}`}
                    imageUrl={track.imageUrl}
                    title={track.name}
                    subtitle={track.artists.join(", ")}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {!debouncedQuery && !isLoading && (
        <div className="py-12 text-center text-gray-400">
          <FontAwesomeIcon icon={faMusic} className="mb-4 text-6xl text-gray-600" />
          <p className="text-xl">Start typing to search for music</p>
        </div>
      )}
    </div>
  );
}
