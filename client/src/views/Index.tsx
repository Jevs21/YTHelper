import { useGlobalContext } from "../global/store";
import { Button, Stack, Typography } from  "@suid/material";
import { createSignal, onMount, lazy } from "solid-js";
import { useParams, useSearchParams } from "@solidjs/router";
import StagnantVideos from "../components/StagnantVideos";

const Index = () => {
  const { apiCall, navigate, uuid, setUuid } = useGlobalContext();
  const authButton = async () => {
    const res = await apiCall('/user/login');
    window.open(res.url).focus();
  }

  const [spotifyUrl, setSpotifyUrl] = createSignal('');

  const checkAuth = async () => (await apiCall('/user/is_logged', 'GET', { uuid: uuid() }));
  const [isAuth, setIsAuth] = createSignal(false);
  onMount(async () => {
    if (localStorage.getItem('uuid')) {
      setUuid(localStorage.getItem('uuid'));
    }

    const [params, setParams] = useSearchParams();
    console.log({ ...params });
    for (const key in params) {
      console.log(key, params[key]);
    }

    if (params.code) {
      console.log("Code found, logging in...")
      const user = await apiCall('/user/oauth2callback', 'POST', {}, { code: params.code });
      console.log(user);
      if (user) {
        setUuid(user.id);
        localStorage.setItem('uuid', user.id);
      }
    }

    const res = await checkAuth();
    setIsAuth(res.authenticated);
    // if (!res.authenticated) {
    //   const redirect = await apiCall('/user/login');
    //   window.open(redirect.url, '_blank').focus();
    // }

    setInterval(async () => {
      const res = await checkAuth();
      setIsAuth(res.authenticated);
      // if (!res.authenticated) {
      //   const redirect = await apiCall('/user/login');
      //   window.open(redirect.url, '_blank').focus();
      // }
    }, 10000);
  });

  return (
    // <Stack minHeight="100vh" width="100vw" justifyContent="center" alignItems="center" overflow="sroll">
    //   <Show 
    //     when={isAuth()}
    //     fallback={<Button onClick={async () => await authButton()}>Authenticate</Button>}>
    //       <Typography variant="h1" color="primary">Home</Typography>
    //       <StagnantVideos />
    //   </Show>
    // </Stack>

    <Stack minHeight="100vh" width="100vw" alignItems="center">
      <Typography align="center" p={4} variant="h1" color="primary">YT Helper</Typography>



      <Stack minHeight="100vh" width="80vw" spacing={3} overflow="scroll">
        <Typography align="center" p={2} variant="h2" color="primary">Input</Typography>
        {/* <Card>
          <Typography p={2} variant="body1" fontWeight={500} color="primary">Prompt Template</Typography>
          <FormControl fullWidth>
            <Select 
              id="template-select"
              value={selTemplate()} 
              onChange={handleSelectChange}>
                <MenuItem value={0}>None</MenuItem>
                <For each={templates}>{(t, i) =>
                  <MenuItem value={i() + 1}>{t.name}</MenuItem>
                }</For>
            </Select>
          </FormControl>
          <Show when={selTemplate() > 0}>
            <For each={templates[selTemplate() - 1].options}>{(o, i) =>
              <StackRowCentered paddingX={1} spacing={2}>
                <Checkbox onChange={() => toggleOption(o)}/>
                <Typography variant="body2">{o}</Typography>
              </StackRowCentered>
            }</For>
          </Show>
        </Card> */}

        <TextField value={spotifyUrl()} fullWidth label="Prompt" onChange={(event, value) => {
          setSpotifyUrl(value);
        }}/>
        {/* <TextField value={customContext()} fullWidth label="Context" onChange={(event, value) => {
          setCustomContext(value);
        }} /> */}
        
      </Stack>

    </Stack>
  )
}

export default Index;
