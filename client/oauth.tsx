/* @refresh reload */
import { render } from "solid-js/web";
import { GlobalContextProvider } from "./global/store";
// import App from "./App";
import Oauth from "./src/views/Oauth";

render(() => (
<GlobalContextProvider>
  <Oauth />
</GlobalContextProvider>
), document.getElementById("root")!);
