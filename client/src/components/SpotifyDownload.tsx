import { CircularProgress, Stack, TextField, Typography } from "@suid/material";
import { Show, createSignal } from "solid-js";
import { useGlobalContext } from "../global/store";
import ButtonEl from "./ButtonEl";
import StackRowCentered from "./StackRowCentered";

const SpotifyDownload = (props) => {
  const { apiCall } = useGlobalContext();
  const [spotifyUrl, setSpotifyUrl] = createSignal('');
  const [isDownloading, setIsDownloading] = createSignal(false);
  const downloadUrl = async () => {
    setIsDownloading(true);
    const res = await apiCall('/spotify/getPlaylist', 'GET', { url: spotifyUrl() });
    console.log(res);
    setIsDownloading(false);
  }

  return (
    <StackRowCentered spacing={1}>
      <TextField fullWidth value={spotifyUrl()}  label="Spotify Playlist URL" onChange={(event, value) => {
        setSpotifyUrl(value);
      }}/>
      <Show when={!isDownloading()} fallback={<CircularProgress color="success" />}>
        <ButtonEl 
          onClick={downloadUrl} 
          disabled={isDownloading() || spotifyUrl().length == 0}>Download</ButtonEl>
      </Show>
    </StackRowCentered>
    
  )
}

export default SpotifyDownload;