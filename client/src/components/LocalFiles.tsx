import { Button, Stack, Typography } from "@suid/material"
import { For, Show, createEffect, createResource, createSignal, onMount } from "solid-js";
import { useGlobalContext } from "../global/store";
import StackRowCentered from "./StackRowCentered";
import ButtonEl from "./ButtonEl";

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

  const generateAudio = async () => {
    const res = await apiCall('/generator/audio');
  }

  const generateVideo = async () => {
    const res = await apiCall('/generator/video');
  }

  const clearLocalFiles = async () => {
    const res = await apiCall('/local/clear');
  }
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
      <StackRowCentered>
        <Typography>Audio</Typography>
        <ButtonEl onClick={generateAudio}>Generate</ButtonEl>
      </StackRowCentered>
      <For each={audioF()}>{(file) =>
        <div>{file.name}</div>
      }</For>
      <StackRowCentered>
        <Typography>Video</Typography>
        <ButtonEl onClick={generateVideo}>Generate</ButtonEl>
      </StackRowCentered>
      <For each={videoF()}>{(file) =>
        <div>{file.name}</div>
      }</For>

      <ButtonEl
        fullWidth
        onClick={clearLocalFiles}
      >Clear Local Files</ButtonEl>
    </Stack>
  )
}

export default LocalFiles;