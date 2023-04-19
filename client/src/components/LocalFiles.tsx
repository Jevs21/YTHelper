import { Box, Button, Card, CircularProgress, Modal, Stack, Typography } from "@suid/material"
import { For, Show, createEffect, createMemo, createResource, createSignal, onMount } from "solid-js";
import { useGlobalContext } from "../global/store";
import StackRowCentered from "./StackRowCentered";
import ButtonEl from "./ButtonEl";
import ModalEl from "./ModalEl";

const SubFileListTitle = (props) => (
  <Typography variant="h3" fontWeight={600}>{props.children}</Typography>
)
const SubFileList = (props) => (
  <Stack spacing={1} paddingBottom={2}>
    <Show when={props.list.length > 0} fallback={<Typography>No files!</Typography>}>
      <For each={props.list}>{(file, i) =>
        <Typography>{i() + 1} - {file.name}</Typography>
      }</For>
    </Show>
  </Stack>
);

const UploadButton = (props) => {
  const { apiCall } = useGlobalContext();
  const [open, setOpen] = createSignal(false);
  const [uploadMeta, setUploadMeta] = createSignal(null);
  const [isUploading, setIsUploading] = createSignal(false);
  const uploadFile = async () => {
    const res = await apiCall("/video/prepareUpload", "GET", { file: props.file });
    setUploadMeta(res);
    setOpen(!open());
  }
  const confirmUpload = async () => {
    setIsUploading(true);
    const res = await apiCall("/video/upload", "POST", {}, { file: props.file });
    console.log(res);
    setIsUploading(false);
    setOpen(false);
  }
  return (
    <>
      <StackRowCentered>
        <ButtonEl onClick={uploadFile}>Upload {props.file}</ButtonEl>
      </StackRowCentered>
      <ModalEl open={open()} onClose={() => setOpen(false)}>
        <Typography align="center" variant="h2">Upload Video</Typography>
        <Show when={uploadMeta() != null} fallback={<Typography>Loading...</Typography>}>

          <Show when={!isUploading()} fallback={<CircularProgress/>}>
            <StackRowCentered justifyContent="space-between">
              <Typography variant="h3">Title</Typography>
              <Typography>{uploadMeta().meta.title}</Typography>
            </StackRowCentered>

            <StackRowCentered justifyContent="space-between">
              <Typography variant="h3">Description</Typography>
              <Typography>{uploadMeta().meta.description}</Typography>
            </StackRowCentered>

            <StackRowCentered justifyContent="space-between">
              <Typography variant="h3">Tags</Typography>
              <Typography>{uploadMeta().meta.tags}</Typography>
            </StackRowCentered>

            <StackRowCentered justifyContent="space-between">
              <Typography variant="h3">Publish At</Typography>
              <Typography>{uploadMeta().meta.publish}</Typography>
            </StackRowCentered>

            <StackRowCentered justifyContent="space-between">
              <Typography variant="h3">Similar Vids</Typography>
              <Stack>
                <For each={uploadMeta().similar}>{(vid) =>
                  <Typography>{vid}</Typography>
                }</For>
              </Stack>
            </StackRowCentered>
          </Show>
          
          <StackRowCentered spacing={1}>
            <ButtonEl fullWidth color="error" onClick={() => setOpen(false)}>Cancel</ButtonEl>
            <ButtonEl fullWidth onClick={confirmUpload}>Upload</ButtonEl>
          </StackRowCentered>
        </Show>
      </ModalEl>
    </>
  )
}

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

  const [isGenAudio , setIsGenAudio] = createSignal(false);
  const generateAudio = async () => {
    setIsGenAudio(true);
    const res = await apiCall('/generator/audio');
    setIsGenAudio(false);
  }

  const [isGenVideo , setIsGenVideo] = createSignal(false);
  const generateVideo = async () => {
    setIsGenVideo(true);
    const res = await apiCall('/generator/video');
    setIsGenVideo(false);
  }

  const clearLocalFiles = async () => {
    const res = await apiCall('/local/clear');
  }
  
  const readyForUpload = createMemo(() => {
    let ready = [];
    for (const file of videoF()) {
      const name = file.name.split(".")[0];
      for (const meta of metaF()) {
        if (meta.name.split(".")[0] == name) {
          ready.push(name);
          break;
        }
      }
    }
    return ready;
  });
  return (
    <Stack direction="row" spacing={1}>
      <Card>
        <Stack p={2} minWidth={"30vw"} spacing={1}>
          <SubFileListTitle>Raw</SubFileListTitle>
          <SubFileList list={rawF()} />

          <SubFileListTitle>Meta</SubFileListTitle>
          <SubFileList list={metaF()} />

          <StackRowCentered spacing={3}>
            <SubFileListTitle>Audio</SubFileListTitle>
            <Show when={!isGenAudio()} fallback={<CircularProgress />} >
              <ButtonEl size="small" onClick={generateAudio}>Generate</ButtonEl>
            </Show>
          </StackRowCentered>
          <SubFileList list={audioF()} />

          <StackRowCentered spacing={3}>
            <SubFileListTitle>Video</SubFileListTitle>
            <Show when={!isGenVideo()} fallback={<CircularProgress />} >
              <ButtonEl size="small" onClick={generateVideo}>Generate</ButtonEl>
            </Show>
          </StackRowCentered>
          <SubFileList list={videoF()} />

          <ButtonEl
            fullWidth
            py={2}
            onClick={clearLocalFiles}
          >Clear Local Files</ButtonEl>
        </Stack>
      </Card>

      <Stack spacing={1}>
        <For each={readyForUpload()}>{(file) =>
          <UploadButton file={file} />
        }</For>
      </Stack>
    </Stack>
  )
}

export default LocalFiles;