import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api";
import type { TopTrack } from "@/lib/types";

export function useTopTracks() {
  return useQuery({
    queryKey: ["top-tracks"],
    queryFn: async () => {
      const response = await api.get<TopTrack[]>("/api/top-tracks", {
        params: { limit: 50 },
      });
      return response.data;
    },
  });
}
