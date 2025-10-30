import { getStandaloneCookieServer } from "@/lib/utils/serverCookies";
import {
  getOnThisDayAlbums,
  getOnThisDayArtists,
  getOnThisDayTracks
} from "@workspace/core/queries/throwback";
import ThrowbackClientPage from "./ThrowbackClientPage";

export default async function OnThisDayPage() {
  const [artists, tracks, albums] = await Promise.all([
    getOnThisDayArtists(),
    getOnThisDayTracks(),
    getOnThisDayAlbums()
  ]);

  const isStandalone = await getStandaloneCookieServer();

  return (
    <ThrowbackClientPage
      artists={artists}
      tracks={tracks}
      albums={albums}
      isStandalone={isStandalone}
    />
  );
}
