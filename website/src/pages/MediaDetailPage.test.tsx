// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeAll, afterEach, describe, expect, it, vi } from "vitest";
import { MediaDetailPage } from "./MediaDetailPage";
import { fallbackSiteData } from "../data";

beforeAll(() => {
  window.scrollTo = vi.fn();
});

afterEach(() => {
  cleanup();
});

describe("MediaDetailPage Watch/Listen Teaching Experience", () => {
  it("renders direct video teaching with cinema video player and download link", () => {
    render(
      <MemoryRouter initialEntries={["/media/apostolic-authority-spiritual-warfare"]}>
        <Routes>
          <Route
            path="/media/:slug"
            element={<MediaDetailPage media={fallbackSiteData.media} />}
          />
        </Routes>
      </MemoryRouter>
    );

    // Main page title (h1) and speaker
    expect(
      screen.getByRole("heading", { name: "Apostolic Authority & Spiritual Warfare", level: 1 })
    ).toBeInTheDocument();
    expect(screen.getAllByText("Rev. David Komlagah").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Video Teaching").length).toBeGreaterThan(0);

    // Direct playback prompt overlay
    expect(screen.getByText(/Watch Teaching · Direct Stream/i)).toBeInTheDocument();

    // Action toolbar buttons
    expect(screen.getByRole("link", { name: /Download Video/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Theater Mode/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Share Teaching/i })).toBeInTheDocument();
  });

  it("renders direct audio sermon with custom luxury audio player and scrubber", () => {
    render(
      <MemoryRouter initialEntries={["/media/the-mystery-of-divine-guidance"]}>
        <Routes>
          <Route
            path="/media/:slug"
            element={<MediaDetailPage media={fallbackSiteData.media} />}
          />
        </Routes>
      </MemoryRouter>
    );

    // Main page title (h1) and metadata
    expect(
      screen.getByRole("heading", { name: "The Mystery of Divine Guidance", level: 1 })
    ).toBeInTheDocument();
    expect(screen.getAllByText("Rev. Dr. Seth Lartey").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Audio Sermon").length).toBeGreaterThan(0);

    // Audio controls
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Play Sermon" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Rewind 15 seconds" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Forward 15 seconds" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Change playback speed" })).toBeInTheDocument();

    // Download and Share links
    expect(screen.getByRole("link", { name: /Download Audio/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Share Sermon/i })).toBeInTheDocument();
  });

  it("renders embedded YouTube video player when external link is provided", () => {
    render(
      <MemoryRouter initialEntries={["/media/growing-through-sound-doctrine"]}>
        <Routes>
          <Route
            path="/media/:slug"
            element={<MediaDetailPage media={fallbackSiteData.media} />}
          />
        </Routes>
      </MemoryRouter>
    );

    expect(
      screen.getByRole("heading", { name: "Growing Through Sound Doctrine", level: 1 })
    ).toBeInTheDocument();

    // YouTube iframe should be present
    const iframe = screen.getByTitle("Growing Through Sound Doctrine");
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute("src", expect.stringContaining("youtube.com/embed/dQw4w9WgXcQ"));

    // Watch on YouTube button should also be available
    expect(screen.getByRole("link", { name: /Watch on YouTube/i })).toBeInTheDocument();
  });
});
