import "@fontsource/inter/400.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/manrope/700.css";
import { StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App } from "./App";
import { fallbackSiteData } from "./data";
import { logger } from "./utils/logger";
import "./styles.css";

// Global error handlers for website client
window.addEventListener("error", (event) => {
  logger.error("Uncaught Client Error", event.error || event.message, {
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
  });
});

window.addEventListener("unhandledrejection", (event) => {
  logger.error("Unhandled Promise Rejection", event.reason);
});

logger.info("PCFS Website Client Hydrating");

hydrateRoot(
  document.getElementById("root")!,
  <StrictMode>
    <BrowserRouter>
      <App data={window.__PCFS_DATA__ ?? fallbackSiteData} />
    </BrowserRouter>
  </StrictMode>,
);
