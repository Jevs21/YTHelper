import { For, Show, createResource } from "solid-js";
import { useGlobalContext } from "../global/store";
import { Grid, Stack } from "@suid/material";
import VideoCard from "./VideoCard";

const VideoList = (props) => {
  const {apiCall} = useGlobalContext();
  const fetchVideoList = async () => await apiCall('/video/list', 'GET', {}, {});
  const [videos, {mutate, refetch}] = createResource(fetchVideoList);
  return (
    <Show when={!videos.loading} fallback={<div>Loading...</div>}>
      <Grid container justifyContent="space-evenly">
        <For each={videos()}>{(vid) => 
          <VideoCard video={vid}/>
        }</For>
      </Grid>
    </Show>
  )
}

export default VideoList;