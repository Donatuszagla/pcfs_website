import "@fontsource/inter/400.css";
import "@fontsource/inter/600.css";
import "@fontsource/manrope/700.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App } from "./App";
import { AuthProvider } from "./auth";
import { logger } from "./utils/logger";
import "./styles.css";

// Global error handlers to capture unhandled client exceptions
window.addEventListener("error", (event) => {
  logger.error("Uncaught DOM/Window Error", event.error || event.message, {
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
  });
});

window.addEventListener("unhandledrejection", (event) => {
  logger.error("Unhandled Promise Rejection", event.reason);
});

logger.info("PCFS Admin Application Initialized");

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
