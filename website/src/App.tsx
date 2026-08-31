import { Route, Routes } from "react-router-dom";
import { SiteShell } from "./components/SiteShell";
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

export interface AppProps {
  data: SiteData;
}

export function App({ data }: AppProps) {
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
