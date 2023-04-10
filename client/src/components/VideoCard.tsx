import { Card, Stack, Typography } from "@suid/material";
import { createSignal, createEffect, createResource, onMount, For, Show } from "solid-js";

const VideoCard = (props) => {
  const { video } = props;
  onMount(() => {
    console.log("Mounted VideoCard")
    console.log(video);
  });
  return (
    <Card>
      <Stack spacing={1} maxWidth={video.snippet.thumbnails.medium.width}>
        <img src={video.snippet.thumbnails.medium.url} style={{
          "width": video.snippet.thumbnails.medium.width,
          "height": video.snippet.thumbnails.medium.height
        }}/>
        <Typography align="center" p={1}>{video.snippet.title}</Typography>
        <Typography variant="body2"p={1}>{video.views} (7day)</Typography>

      </Stack>
    </Card>
  );
}

export default VideoCard;