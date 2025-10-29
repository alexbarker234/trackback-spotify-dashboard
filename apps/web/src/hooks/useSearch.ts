import { SearchResults } from "@/types";
import { useQuery } from "@tanstack/react-query";

type ItemType = "artists" | "tracks" | "albums";

const fetchSearch = async (
  query: string,
  type: ItemType,
  limit: number = 50
): Promise<SearchResults> => {
  if (!query || query.trim() === "") {
    return { albums: [], tracks: [], artists: [] };
  }
  // Remove the s from the end
  const apiType = type.slice(0, -1);

  const response = await fetch(
    `/api/search?q=${encodeURIComponent(query)}&type=${apiType}&limit=${limit}`
  );

  if (!response.ok) {
    throw new Error("Failed to search");
  }

  return response.json();
};

export const useSearch = (query: string, type: ItemType = "artists", limit: number = 50) => {
  return useQuery({
    queryKey: ["search", query, type, limit],
    queryFn: () => fetchSearch(query, type, limit),
    enabled: query.trim().length > 0,
    retry: 2
  });
};
