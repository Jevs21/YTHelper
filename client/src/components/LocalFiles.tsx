import { Stack, Typography } from "@suid/material"
import { For, Show, createEffect, createResource, createSignal, onMount } from "solid-js";
import { useGlobalContext } from "../global/store";

const LocalFiles = (props) => {
  const { apiCall } = useGlobalContext();
  const fetchFiles = async () => await apiCall('/local/list/');
  const [rawF, setRawF] = createSignal([]);
  const [metaF, setMetaF] = createSignal([]);
  const [audioF, setAudioF] = createSignal([]);
  const [videoF, setVideoF] = createSignal([]);
  
  onMount(async () => {
    const files = await fetchFiles();
    setRawF(files.raw);
    setMetaF(files.meta);
    setAudioF(files.audio);
    setVideoF(files.video);

    setInterval(async () => {
      const files = await fetchFiles();
      setRawF(files.raw);
      setMetaF(files.meta);
      setAudioF(files.audio);
      setVideoF(files.video);
    }, 1000);
  });

  // createEffect(() => {
  //   console.log(files());
  // });
  return (
    <Stack spacing={1}>
      <Typography>Raw</Typography>
      <For each={rawF()}>{(file) =>
        <div>{file.name}</div>
      }</For>
      <Typography>Meta</Typography>
      <For each={metaF()}>{(file) =>
        <div>{file.name}</div>
      }</For>
      <Typography>Audio</Typography>
      <For each={audioF()}>{(file) =>
        <div>{file.name}</div>
      }</For>
      <Typography>Video</Typography>
      <For each={videoF()}>{(file) =>
        <div>{file.name}</div>
      }</For>

    </Stack>
  )
}

export default LocalFiles;