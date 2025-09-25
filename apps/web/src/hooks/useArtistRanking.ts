import { useQuery } from "@tanstack/react-query";

interface ArtistRankingData {
  artistId: string;
  artistName: string;
  streamCount: number;
  totalDuration: number;
  imageUrl: string | null;
}

interface UseArtistRankingParams {
  period: "4weeks" | "6months" | "lifetime";
  offset: number;
}

export function useArtistRanking({ period, offset }: UseArtistRankingParams) {
  return useQuery({
    queryKey: ["artistRanking", period, offset],
    queryFn: async (): Promise<ArtistRankingData[]> => {
      const params = new URLSearchParams({
        period,
        offset: offset.toString()
      });

      const response = await fetch(`/api/artist-ranking?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch artist ranking data");
      }

      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000 // 10 minutes
  });
}

export type { ArtistRankingData };
