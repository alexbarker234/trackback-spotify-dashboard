import { SearchResults } from "@/types";
import { useQuery } from "@tanstack/react-query";

const fetchSearch = async (query: string): Promise<SearchResults> => {
  if (!query || query.trim() === "") {
    return { albums: [], tracks: [], artists: [] };
  }

  const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);

  if (!response.ok) {
    throw new Error("Failed to search");
  }

  return response.json();
};

export const useSearch = (query: string) => {
  return useQuery({
    queryKey: ["search", query],
    queryFn: () => fetchSearch(query),
    enabled: query.trim().length > 0,
    retry: 2
  });
};
