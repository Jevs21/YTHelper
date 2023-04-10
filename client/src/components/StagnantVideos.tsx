import { useGlobalContext } from "../global/store";
import { Button, Grid, Stack, Typography } from  "@suid/material";
import { createSignal, createEffect, createResource, onMount, For, Show } from "solid-js";
import VideoCard from "./VideoCard";

const StagnantVideos = () => {
  const { apiCall, navigate } = useGlobalContext();
  const fetchStagnantVideos = async () => (await apiCall('/youtube/get_stagnant_videos'));
  const [vidList, {mutate, refetch}] = createResource(fetchStagnantVideos);
  onMount(() => {
    console.log("Mounted StagnantVideos")
    if (!vidList.loading) {
      console.log("StagnantVids:")
      console.log(vidList());
    }
  })

  createEffect(() => {
    console.log("Effect StagnantVideos")
    if (!vidList.loading) {
      console.log("StagnantVids:")
      console.log(vidList());
    }
  })
  return (
    <Show when={!vidList.loading} fallback={<></>}>
      <Typography variant="h1" color="primary">Stagnant Videos</Typography>
      <Grid item container width={"100vw"} spacing={2}>
        <For each={vidList().list}>{(video, i) => {
          if (i() > 30) return <></>;
          // console.log(video);
          return <Grid item container xs={12} sm={6} md={4} lg={3}><VideoCard video={video}/></Grid>
        }}</For>
      </Grid>
    </Show>
  );
}

export default StagnantVideos;