import { Button, CircularProgress, Stack, TextField, Typography } from "@suid/material";
import { Show, createSignal } from "solid-js";
import { useGlobalContext } from "../global/store";

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
    <Stack>
      <TextField value={spotifyUrl()}  label="Prompt" onChange={(event, value) => {
        setSpotifyUrl(value);
      }}/>
      <Show when={!isDownloading()} fallback={<CircularProgress color="success" />}>
        <Button 
          fullWidth 
          variant="outlined" 
          onClick={downloadUrl} 
          disabled={isDownloading() || spotifyUrl().length == 0}>Download</Button>
      </Show>
    </Stack>
    
  )
}

export default SpotifyDownload;