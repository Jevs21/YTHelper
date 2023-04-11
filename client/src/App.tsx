import { ThemeProvider, Typography } from "@suid/material";
import { mainTheme } from "./global/theme";
import "./global/App.module.css"

import { Routes, Route } from '@solidjs/router';

import { createEffect, lazy, onMount } from "solid-js";
// import ViewContainer from "./views/ViewContainer";
import { useGlobalContext } from "./global/store";
// import { useGlobalContext } from "./global/store";
// import ViewContainer from "./views/ViewContainer";
// import { useGlobalContext } from "./global/store";

// const ViewContainer = lazy(() => import("./views/ViewContainer"));
const Index = lazy(() => import("./views/Index"));

// const Features = lazy(() => import("./views/Features"));
// const Pricing = lazy(() => import("./views/Pricing"));
// const About = lazy(() => import("./views/About"));
// const NotFound = lazy(() => import("./views/NotFound"));

export default function App() {
  const { setIsMobile } = useGlobalContext();

  // onMount(() => loadLocalStorage());
  const PageResize = () => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 900); // Set isMobile to true if screen width is less than 768px
    };
    window.addEventListener('resize', handleResize); // Add event listener for window resize
    handleResize(); // Call handleResize function on component mount to set initial value of isMobile
    return () => {
      window.removeEventListener('resize', handleResize); // Remove event listener on component unmount
    };
  }

  createEffect(() => PageResize());

  onMount(() => {
    // loadLocalStorage();
    console.log("Mounted")
    PageResize();
  })
  return (
    <ThemeProvider theme={mainTheme}>
      <div class="App">
        {/* <ViewContainer> */}
          <Routes>
            <Route path="/" component={Index} />
            {/* <Route path="/*" component={Index} /> */}
            {/* <Route path='/features' component={Features} />
            <Route path='/pricing' component={Pricing} />
            <Route path='/about' component={About} />
            <Route path='/*' component={NotFound} /> */}
          </Routes>
        {/* </ViewContainer> */}
      </div>
    </ThemeProvider>
  );
}
