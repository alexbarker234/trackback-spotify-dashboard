"use client";

import SearchItemCard from "@/components/itemCards/SearchItemCard";
import ItemTypeSelector, { ItemType } from "@/components/ItemTypeSelector";
import Loading from "@/components/Loading";
import SearchBar from "@/components/SearchBar";
import { useSearch } from "@/hooks/useSearch";
import { SearchResults } from "@/types";
import { faMusic } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedItemType, setSelectedItemType] = useState<ItemType>("artists");

  // Debounce the search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const { data: results, isLoading, error } = useSearch(debouncedQuery, selectedItemType, 50);

  const mapResultsToSearchItems = (searchResults: SearchResults) => {
    switch (selectedItemType) {
      case "artists":
        return searchResults.artists.map((artist) => ({
          id: artist.id,
          name: artist.name,
          imageUrl: artist.imageUrl,
          subtitle: `${artist.followers.toLocaleString()} followers`,
          href: `/dashboard/artist/${artist.id}`
        }));
      case "albums":
        return searchResults.albums.map((album) => ({
          id: album.id,
          name: album.name,
          imageUrl: album.imageUrl,
          subtitle: album.artists.join(", "),
          href: `/dashboard/album/${album.id}`
        }));
      case "tracks":
        return searchResults.tracks.map((track) => ({
          id: track.id,
          name: track.name,
          imageUrl: track.imageUrl,
          subtitle: track.artists.join(", "),
          href: `/track/dashboard/${track.isrc}`
        }));
      default:
        return [];
    }
  };

  const searchItems = results ? mapResultsToSearchItems(results) : [];
  const hasResults = searchItems.length > 0;

  return (
    <div className="mx-auto w-full max-w-7xl p-4">
      <div className="mb-4 flex flex-col gap-4">
        <h1 className="text-4xl font-bold text-zinc-100">Search Spotify</h1>
        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder={`Search for ${selectedItemType}...`}
        />
        <div className="flex justify-center">
          <ItemTypeSelector itemType={selectedItemType} onItemTypeChange={setSelectedItemType} />
        </div>
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

      {!isLoading && hasResults && (
        <section>
          <h2 className="mb-4 text-2xl font-bold text-zinc-100">
            {selectedItemType.charAt(0).toUpperCase() + selectedItemType.slice(1)}
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {searchItems.map((item) => (
              <SearchItemCard
                key={item.id}
                href={item.href}
                imageUrl={item.imageUrl}
                title={item.name}
                subtitle={item.subtitle}
              />
            ))}
          </div>
        </section>
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
