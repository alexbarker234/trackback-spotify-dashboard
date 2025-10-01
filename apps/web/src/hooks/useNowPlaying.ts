import { useQuery } from "@tanstack/react-query";

interface SpotifyCurrentlyPlayingResponse {
  is_playing: boolean;
  item: {
    id: string;
    name: string;
    duration_ms: number;
    external_ids?: {
      isrc?: string;
    };
    artists: Array<{
      id: string;
      name: string;
    }>;
    album: {
      id: string;
      name: string;
      images: Array<{
        url: string;
      }>;
    };
  } | null;
  currently_playing_type: string;
  timestamp: number;
}

const fetchNowPlaying = async (): Promise<SpotifyCurrentlyPlayingResponse> => {
  const response = await fetch("/api/now-playing");
  if (!response.ok) {
    throw new Error("Failed to fetch now playing data");
  }
  return response.json();
};

export const useNowPlaying = () => {
  return useQuery({
    queryKey: ["nowPlaying"],
    queryFn: fetchNowPlaying,
    refetchInterval: 10000, // Refetch every 10 seconds
    refetchIntervalInBackground: true, // Continue refetching even when tab is not active
    staleTime: 5000, // Consider data stale after 5 seconds
    retry: 3, // Retry failed requests up to 3 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000) // Exponential backoff
  });
};
