import { useGlobalContext } from "../global/store";
import { Button, Stack, Typography } from  "@suid/material";
import { createSignal, onMount, lazy } from "solid-js";
import StagnantVideos from "../components/StagnantVideos";

const Index = () => {
  const { apiCall, navigate, uuid } = useGlobalContext();
  const authButton = async () => {
    const res = await apiCall('/user/login');
    window.open(res.url, '_blank').focus();
  }

  const checkAuth = async () => (await apiCall('/user/is_logged', 'GET', { uuid: uuid() }));
  const [isAuth, setIsAuth] = createSignal(false);
  onMount(async () => {
    const res = await checkAuth();
    setIsAuth(res.authenticated);
    if (!res.authenticated) {
      const redirect = await apiCall('/user/login');
      window.open(redirect.url, '_blank').focus();
    }

    setInterval(async () => {
      const res = await checkAuth();
      setIsAuth(res.authenticated);
      if (!res.authenticated) {
        const redirect = await apiCall('/user/login');
        window.open(redirect.url, '_blank').focus();
      }
    }, 10000);
  });

  return (
    <Stack minHeight="100vh" width="100vw" justifyContent="center" alignItems="center" overflow="sroll">
      <Show 
        when={isAuth()}
        fallback={<Button onClick={async () => await authButton()}>Authenticate</Button>}>
          <Typography variant="h1" color="primary">Home</Typography>
          <StagnantVideos />
      </Show>
    </Stack>
  )
}

export default Index;
