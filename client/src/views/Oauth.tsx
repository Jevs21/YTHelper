import { onMount } from "solid-js";
import { useGlobalContext } from "../global/store";

const Oauth = () => {
  const { setUuid } = useGlobalContext();
  onMount(() => {
    const urlParams = new URLSearchParams(window.location.search);
    console.log(urlParams)
  })
  return (<>TEST</>);
};

export default Oauth;