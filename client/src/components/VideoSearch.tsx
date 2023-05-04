import { Box, Grid, Stack, TextField, Typography } from "@suid/material";
import { For, createMemo, createResource, createSignal, onMount } from "solid-js";
import { useGlobalContext } from "../global/store";
import StackRowCentered from "./StackRowCentered";


const VideoSearch = (props) => {
  const { apiCall } = useGlobalContext();
  const [query, setQuery] = createSignal("");

  const fetchVideos = async () => await apiCall('/video/list');
  const [videos, {mutate, refetch}] = createResource<Video[]>(fetchVideos);

  function stringSimilarity(a, b) {
    if (a === b) {
      return 1;
    }
    const queryChars = new Set(a.toLowerCase());
    const title_str = b.split("(")[0].toLowerCase();
    let count = 0;
    for (let c of queryChars) {
      if (title_str.includes(c)) {
        count += 1;
      }
    }

    for (let q_word of a.split(" ")) {
      if (!title_str.includes(q_word)) {
        return 0
      }
    }

    return count / a.length;
  
    // const titleChars = new Set(b.toLowerCase());
    // const uniqueChars = new Set([...queryChars, ...titleChars]);
  
    // let matchingChars = 0;
  
    // queryChars.forEach(char => {
    //   if (titleChars.has(char)) {
    //     matchingChars++;
    //   }
    // });
  
    // return matchingChars / uniqueChars.size;
  }
  
  
  const artistCounts = createMemo(() => {
    if (!videos.loading) {
      let counts = {}
      const vlist = videos();
      for (let v of vlist) {
        const t_split = v.title.split(" - ");
        if (t_split.length == 2) {
          const artist = t_split[0]
          console.log(artist)
          if (artist in counts) {
            counts[artist].count += 1
            counts[artist].views += v.views
          } else {
            counts[artist] = { views: v.views , count: 1 }
          }
        } else {
          console.log("Title parse eror")
          console.log(v);
        }
      }

      let arr = [];
      for (let key in counts) {
        arr.push({ artist: key, count: counts[key].count, views: counts[key].views })
      }
      // arr.sort((a, b) => a.artist.replace(" ", "").toLowerCase() - b.artist.replace(" ", "").toLowerCase())
      // arr.sort((a, b) => b.views - a.views)
      arr.sort((a, b) => (b.views / b.count) - (a.views / a.count))
      return arr;
    }

    return [];
  });

  const searchResults = createMemo<Video[]>(() => {
    const q = query();
    
    if (q.length > 0) {
      let res = [];
      const vlist = videos();
      for (let v of vlist) {
        const title_sim = stringSimilarity(q, v.title);
        const desc_sim  = stringSimilarity(q, v.description);
        console.log("Similarities", title_sim, desc_sim);  
        if (title_sim > 0.5 || desc_sim > 0.5) {
          res.push(v);
        }
      }
      return res;
    }

    return [];
  });
  return (
    <Stack width="100%" spacing={2}>
      <TextField value={query()} onChange={(e) => setQuery(e.target.value)} fullWidth variant="outlined"/>
      <Grid container spacing={2}>
        { 
          query().length == 0 &&
          <For each={artistCounts()}>{(a, i) =>
            <Grid item xs={3}>
              <StackRowCentered justifyContent="space-between">
                <Typography paddingLeft={3}>{a.artist}</Typography>
                <Typography paddingRight={3}>{a.views} / ({a.count}) [{(a.views / a.count).toFixed(0)}]</Typography>
              </StackRowCentered>
            </Grid>
          }</For>
        }
        { 
          query().length > 0 &&
          <For each={searchResults()}>{(vid, i) =>
            <Grid item xs={3}>
              <StackRowCentered justifyContent="center">
                <StackRowCentered justifyContent="space-between">
                  <Typography paddingLeft={3}>{vid.title}</Typography>
                  <Typography paddingRight={3}>{vid.views}</Typography>
                </StackRowCentered>
              </StackRowCentered>
            </Grid>
          }</For>
        }
      </Grid>
    </Stack>
  )
}

export default VideoSearch;