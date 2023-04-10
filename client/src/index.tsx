/* @refresh reload */
import { Router } from "@solidjs/router";
import { render } from "solid-js/web";
import { GlobalContextProvider } from "./global/store";
import App from "./App";

render(() => (
<Router>
  <GlobalContextProvider>
    <App />
  </GlobalContextProvider>
</Router>
), document.getElementById("root")!);
