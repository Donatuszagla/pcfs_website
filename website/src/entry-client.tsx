import "@fontsource/inter/400.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/manrope/700.css";
import { StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App } from "./App";
import { fallbackSiteData } from "./data";
import "./styles.css";

hydrateRoot(
  document.getElementById("root")!,
  <StrictMode>
    <BrowserRouter>
      <App data={window.__PCFS_DATA__ ?? fallbackSiteData} />
    </BrowserRouter>
  </StrictMode>,
);
