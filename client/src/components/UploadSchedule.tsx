import { For, Show, createResource, createSignal } from "solid-js";
import { useGlobalContext } from "../global/store";
import StackRowCentered from "./StackRowCentered";
import { Box, Button, CircularProgress, Popover, Stack, Typography } from "@suid/material";

const UploadBox = (props) => {
  const [anchorEl, setAnchorEl] = createSignal(null);
  const handlePopoverOpen = (event: { currentTarget: Element }) => {
    setAnchorEl(event.currentTarget);
  };
  const handlePopoverClose = () => {
    setAnchorEl(null);
  };
  const open = () => Boolean(anchorEl());
  return (
    <>
      <Box 
        aria-owns={open() ? "mouse-over-popover" : undefined}
        aria-haspopup="true"
        onMouseEnter={handlePopoverOpen}
        onMouseLeave={handlePopoverClose}
        height="20px"  
        width="20px"
        backgroundColor={(props.uploads > 0) ? (props.uploads > 2) ? "yellow" : "green" : "red"}
        borderRadius="2px"></Box>
    <Popover
          id="mouse-over-popover"
          sx={{ pointerEvents: "none" }}
          open={open()}
          anchorEl={anchorEl()}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "left",
          }}
          onClose={handlePopoverClose}
          disableRestoreFocus
        >
          <Typography sx={{ p: 1 }}>{props.uploads} Uploads on {props.dateStr}</Typography>
        </Popover>
    </>
  );
}

const UploadSchedule = () => {
  const { apiCall } = useGlobalContext();
  const fetchUploadSchedule = async () => await apiCall('/video/getUploadSchedule');
  const [schedule, { mutate, refetch }] = createResource(fetchUploadSchedule);

  return (
    <StackRowCentered justifyContent="space-evenly">
      <Show when={!schedule.loading} fallback={<CircularProgress/>}>
        <For each={schedule()}>{(day, i) =>
          <Stack spacing={1}>
            <Typography>{i()}</Typography>
            <UploadBox dateStr={day.date} uploads={day.schedule[0]}/>
            <UploadBox dateStr={day.date} uploads={day.schedule[1]}/>
            <UploadBox dateStr={day.date} uploads={day.schedule[2]}/>
          </Stack>
        }</For>
      </Show>
    </StackRowCentered>
  );
}

export default UploadSchedule;