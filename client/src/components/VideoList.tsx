import { For, Show, createEffect, createMemo, createResource } from "solid-js";
import { useGlobalContext } from "../global/store";
import { Grid, Stack } from "@suid/material";
import VideoCard from "./VideoCard";



const VideoList = (props) => {
  const {apiCall} = useGlobalContext();
  const fetchVideoList = async () => await apiCall('/video/list', 'GET', {}, {});
  const [videos, {mutate, refetch}] = createResource<Video[]>(fetchVideoList);

  const groupVideosByDate = (videoList: Video[]): Map<string, Video[]> => {
    const groups = new Map<string, Video[]>();
    const now = new Date();
    videoList.forEach((video) => {
      const publishedAt = new Date(video.publishedAt);
      if (publishedAt > now) {
        const dateString = publishedAt.toISOString().slice(0, 10);
        const existingGroup = groups.get(dateString);
        if (existingGroup) {
          existingGroup.push(video);
        } else {
          groups.set(dateString, [video]);
        }
      }
    });
    return groups;
  };

  const sortGroupedVideos = (groups: Map<string, Video[]>): [string, Video[]][] => {
    return Array.from(groups.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  };

  const upcomingVids = createMemo(() => {
    if (videos.loading) return [];
    const groupedVideos = groupVideosByDate(videos());
    return sortGroupedVideos(groupedVideos);
  });

  return (
    <Show when={!videos.loading} fallback={<div>Loading...</div>}>
      <Grid container justifyContent="space-evenly">
        <For each={Array.from(upcomingVids())}>{([date, vidGroup]) => 
          <Stack spacing={2}>
            <h2>{date}</h2>
            <For each={vidGroup}>{(vid) => 
              <VideoCard video={vid}/>
            }</For>
          </Stack>
        }</For>
      </Grid>
    </Show>
  );
};


export default VideoList;