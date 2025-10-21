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

  return <ThrowbackClientPage artists={artists} tracks={tracks} albums={albums} />;
}
