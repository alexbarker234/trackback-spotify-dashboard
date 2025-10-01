import { useQuery } from "@tanstack/react-query";
import { SpotifyCurrentlyPlayingResponse } from "@workspace/core/types/spotifyTypes";

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
    refetchInterval: 10000,
    refetchOnWindowFocus: true,
    staleTime: 5000,
    retry: 3
  });
};
