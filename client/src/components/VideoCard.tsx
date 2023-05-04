import { Box, Card, CircularProgress, Stack, Typography } from "@suid/material";
import { createSignal, createEffect, createResource, onMount, For, Show } from "solid-js";
import ModalEl from "./ModalEl";
import { useGlobalContext } from "../global/store";
import ButtonEl from "./ButtonEl";
import StackRowCentered from "./StackRowCentered";

const VideoCard = (props) => {
  const { apiCall } = useGlobalContext();
  const [open, setOpen] = createSignal(false);
  const [isRescheduling, setIsRescheduling] = createSignal(false);
  const [dt, setDt] = createSignal(null);
  const { video } = props;
  const cardWidth = "250px";
  onMount(() => {
    console.log("Mounted VideoCard")
    console.log(video);
  });

  const prepReschedule = async () => {
    setOpen(true);
    const res = await apiCall("/video/getNextPublishDate");
    setDt(res.dt);
  }

  const reschedule = async () => {
    if (dt() == null) return;
    setIsRescheduling(true);
    const res = await apiCall("/video/setPublishDate", "POST", {}, { videoId: video.videoId, date: dt() });
    console.log(res);
    setIsRescheduling(false);
    setOpen(false);
  }

  return (
    <>
      <Box maxWidth={cardWidth} py={1} onClick={prepReschedule}>
        <Card>
          <Stack spacing={1} maxWidth={cardWidth}>
            <img src={video.thumbnailUrl} style={{
              "width": cardWidth,
              "height": "auto"
            }}/>
            <Typography align="center" variant="h3" p={1}>{video.title}</Typography>
            <Typography variant="body2" p={1}>{video.publishedAt}</Typography>
            <Typography variant="body2" p={1}>{video.views}</Typography>
          </Stack>
        </Card>
      </Box>
      <ModalEl open={open()} onClose={() => setOpen(false)}>
        <Typography align="center" variant="h2">Reschedule Video</Typography>
        <Show when={!isRescheduling()} fallback={<CircularProgress/>}>
          <Typography align="center" variant="h3">Reschedule video to next slot?</Typography>
          {dt() != null && <Typography align="center" variant="h3">Next slot: {dt()}</Typography>}
        </Show>
        <StackRowCentered spacing={1}>
          <ButtonEl fullWidth color="error" onClick={() => {
            setOpen(false);
            setDt(null);
          }}>Cancel</ButtonEl>
          <ButtonEl fullWidth onClick={reschedule}>Confirm</ButtonEl>
        </StackRowCentered>
      </ModalEl>
    </>
  );
}

export default VideoCard;