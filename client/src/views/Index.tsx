import { useGlobalContext } from "../global/store";
import { Button, Stack, Typography } from  "@suid/material";
import { createSignal, onMount, lazy } from "solid-js";
import StagnantVideos from "../components/StagnantVideos";

const Index = () => {
  const { apiCall, navigate } = useGlobalContext();
  const authButton = async () => {
    const res = await apiCall('/user/login');
    window.open(res.url, '_blank').focus();
  }

  const checkAuth = async () => (await apiCall('/user/is_logged'));
  const [isAuth, setIsAuth] = createSignal(false);
  onMount(async () => {
    checkAuth().then(res => {
      setIsAuth(res.authenticated);
    });

    setInterval(async () => {
      checkAuth().then(res => {
        setIsAuth(res.authenticated);
      });
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
