import { useEffect, useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { SiteShell } from "./components/SiteShell";
import { loadSiteData } from "./data";
import { AboutPage } from "./pages/AboutPage";
import { BranchDetailPage } from "./pages/BranchDetailPage";
import { BranchesPage } from "./pages/BranchesPage";
import { ContactPage } from "./pages/ContactPage";
import { EventDetailPage } from "./pages/EventDetailPage";
import { EventsPage } from "./pages/EventsPage";
import { HomePage } from "./pages/HomePage";
import { MediaDetailPage } from "./pages/MediaDetailPage";
import { MediaPage } from "./pages/MediaPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { PolicyPage } from "./pages/PolicyPage";
import type { SiteData } from "./types";
import { logger } from "./utils/logger";

export interface AppProps {
  data: SiteData;
}

export function App({ data: initialData }: AppProps) {
  const [data, setData] = useState<SiteData>(initialData);
  const location = useLocation();

  useEffect(() => {
    logger.action(`Navigated to: ${location.pathname}${location.search}`);
  }, [location.pathname, location.search]);

  useEffect(() => {
    loadSiteData()
      .then((latest) => setData(latest))
      .catch((err) => {
        logger.error("Failed refreshing site data on mount", err);
      });
  }, []);

  return (
    <SiteShell data={data}>
      <Routes>
        <Route path="/" element={<HomePage data={data} />} />
        <Route path="/about" element={<AboutPage data={data} />} />
        <Route path="/branches" element={<BranchesPage branches={data.branches} />} />
        <Route path="/branches/:slug" element={<BranchDetailPage branches={data.branches} />} />
        <Route path="/media" element={<MediaPage media={data.media} />} />
        <Route path="/media/:slug" element={<MediaDetailPage media={data.media} />} />
        <Route path="/events" element={<EventsPage events={data.events} />} />
        <Route path="/events/:slug" element={<EventDetailPage events={data.events} />} />
        <Route path="/contact" element={<ContactPage data={data} />} />
        <Route path="/privacy" element={<PolicyPage kind="privacy" />} />
        <Route path="/terms" element={<PolicyPage kind="terms" />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </SiteShell>
  );
}
