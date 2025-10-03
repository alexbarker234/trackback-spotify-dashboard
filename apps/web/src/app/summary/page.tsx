import LastMonthSummary from "@/components/share/LastMonthSummary";
import { getTopArtistsByDateRange } from "@workspace/core/queries/artists";
import { getTopTracksByDateRange } from "@workspace/core/queries/tracks";

export type SummaryData = {
  month: string;
  totalMinutes: number;
  totalTracks: number;
  topArtists: Array<{
    name: string;
    plays: number;
    image: string | null;
  }>;
  topTracks: Array<{
    name: string;
    artist: string;
    plays: number;
    image: string | null;
  }>;
  listeningHours: Array<{
    hour: number;
    plays: number;
  }>;
};

async function getLastMonthSummaryData(): Promise<SummaryData> {
  // Get last month's date range
  const now = new Date();
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  const monthName = lastMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  try {
    // Fetch data in parallel
    const [topArtists, topTracks] = await Promise.all([
      getTopArtistsByDateRange({
        startDate: lastMonth,
        endDate: endOfLastMonth,
        limit: 5
      }),
      getTopTracksByDateRange({
        startDate: lastMonth,
        endDate: endOfLastMonth,
        limit: 5
      })
    ]);

    // Calculate total minutes and tracks
    const totalMinutes = topArtists.reduce((sum, artist) => sum + Math.floor(artist.totalDuration / 60000), 0);
    const totalTracks = topArtists.reduce((sum, artist) => sum + Number(artist.listenCount), 0);

    // Process top artists
    const processedArtists = topArtists.slice(0, 5).map((artist) => ({
      name: artist.artistName,
      plays: artist.listenCount,
      image: artist.artistImageUrl
    }));

    // Process top tracks
    const processedTracks = topTracks.slice(0, 5).map((track) => ({
      name: track.trackName,
      artist: track.artists.map((a) => a.artistName).join(", "),
      plays: track.listenCount,
      image: track.imageUrl
    }));

    const listeningHours = Array.from({ length: 24 }, (_, hour) => {
      const basePlays = hour >= 6 && hour <= 23 ? Math.floor(Math.random() * 20) + 10 : Math.floor(Math.random() * 10);
      return { hour, plays: basePlays };
    });

    return {
      month: monthName,
      totalMinutes,
      totalTracks,
      topArtists: processedArtists,
      topTracks: processedTracks,
      listeningHours
    };
  } catch (error) {
    console.error("Error fetching summary data:", error);
  }
}

export default async function SummaryPage() {
  const data = await getLastMonthSummaryData();

  if (!data) {
    return <div>No data available</div>;
  }

  return <LastMonthSummary data={data} />;
}
