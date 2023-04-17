import { Box, Card, Stack, Typography } from "@suid/material";
import { createSignal, createEffect, createResource, onMount, For, Show } from "solid-js";

const VideoCard = (props) => {
  const { video } = props;
  const cardWidth = "350px";
  onMount(() => {
    console.log("Mounted VideoCard")
    console.log(video);
  });
  return (
    <Box maxWidth={cardWidth} py={1}>
      <Card>
        <Stack spacing={1} maxWidth={cardWidth}>
          <img src={video.thumbnailUrl} style={{
            "width": cardWidth,
            "height": "auto"
          }}/>
          <Typography align="center" p={1}>{video.title}</Typography>
          <Typography variant="body2"p={1}>{video.description}</Typography>

        </Stack>
      </Card>
    </Box>
  );
}

export default VideoCard;