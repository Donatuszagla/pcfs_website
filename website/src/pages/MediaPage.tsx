import {
  MagnifyingGlass,
  Microphone,
  Images,
  Play,
  FilmStrip,
  Camera,
  CalendarBlank,
  User,
} from "@phosphor-icons/react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { EmptyState } from "../components/EmptyState";
import { PageLayout } from "../components/PageLayout";
import { Pagination } from "../components/Pagination";
import { PhoneGalleryViewer } from "../components/PhoneGalleryViewer";
import type { MediaItem } from "../types";
import { formatDate } from "../utils/formatters";

export interface MediaPageProps {
  media: MediaItem[];
}

type MainTab = "All" | "Sermons" | "Gallery";
type GalleryFilter = "All" | "Photos" | "Videos";

export function MediaPage({ media }: MediaPageProps) {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<MainTab>("All");
  const [galleryFilter, setGalleryFilter] = useState<GalleryFilter>("All");
  const [galleryViewerIndex, setGalleryViewerIndex] = useState<number | null>(null);

  // Pagination states
  const [sermonPage, setSermonPage] = useState(1);
  const sermonsPerPage = 6;
  const [galleryPage, setGalleryPage] = useState(1);
  const galleryPerPage = 12;

  // Reset pagination when search, tabs, or filter change
  useEffect(() => {
    setSermonPage(1);
    setGalleryPage(1);
  }, [search, activeTab, galleryFilter]);

  // Categorize media into Sermons vs Gallery
  const isSermon = (item: MediaItem) => {
    const cat = (item.category || "").toLowerCase();
    return (
      cat.includes("sermon") ||
      cat.includes("teaching") ||
      cat.includes("preach") ||
      cat.includes("message") ||
      item.type === "AUDIO"
    );
  };

  const isGallery = (item: MediaItem) => {
    const cat = (item.category || "").toLowerCase();
    return (
      cat.includes("gallery") ||
      cat.includes("photo") ||
      cat.includes("picture") ||
      cat.includes("event") ||
      item.type === "PHOTO" ||
      (!isSermon(item) && item.type === "VIDEO")
    );
  };

  // Sermons collection
  const allSermons = useMemo(() => media.filter(isSermon), [media]);

  // Gallery collection (Photos & Videos)
  const allGallery = useMemo(
    () => media.filter((item) => isGallery(item) || item.category === "Gallery"),
    [media]
  );

  // Filtered by search & active tabs
  const filteredSermons = useMemo(() => {
    return allSermons.filter((item) =>
      `${item.title} ${item.speaker} ${item.description} ${item.externalUrl || ""}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [allSermons, search]);

  const filteredGallery = useMemo(() => {
    return allGallery.filter((item) => {
      const matchesSearch = `${item.title} ${item.speaker} ${item.description} ${item.externalUrl || ""}`
        .toLowerCase()
        .includes(search.toLowerCase());
      if (!matchesSearch) return false;

      if (galleryFilter === "Photos") return item.type === "PHOTO";
      if (galleryFilter === "Videos") return item.type === "VIDEO";
      return true;
    });
  }, [allGallery, search, galleryFilter]);

  // Handle opening phone gallery lightbox
  function openGalleryViewer(item: MediaItem) {
    const idx = filteredGallery.findIndex((i) => i.id === item.id);
    setGalleryViewerIndex(idx >= 0 ? idx : 0);
  }

  return (
    <PageLayout
      eyebrow="Media & Resources"
      title="Paradise City Media Hub"
      intro="Listen to life-transforming sermons and explore our church photo & video gallery."
    >
      {/* Primary Filter Tabs: All / Sermons / Gallery */}
      <div className="media-tab-bar">
        <button
          type="button"
          className={`media-tab-btn ${activeTab === "All" ? "active" : ""}`}
          onClick={() => setActiveTab("All")}
        >
          All Media ({media.length})
        </button>
        <button
          type="button"
          className={`media-tab-btn ${activeTab === "Sermons" ? "active" : ""}`}
          onClick={() => setActiveTab("Sermons")}
        >
          <Microphone size={18} />
          Sermons ({allSermons.length})
        </button>
        <button
          type="button"
          className={`media-tab-btn ${activeTab === "Gallery" ? "active" : ""}`}
          onClick={() => setActiveTab("Gallery")}
        >
          <Images size={18} />
          Gallery ({allGallery.length})
        </button>
      </div>

      {/* Search & Sub-filter Controls */}
      <div className="search-bar" style={{ marginTop: "24px" }}>
        <MagnifyingGlass aria-hidden />
        <label className="sr-only" htmlFor="media-search">
          Search media
        </label>
        <input
          id="media-search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={
            activeTab === "Sermons"
              ? "Search sermons by title, preacher or scripture…"
              : activeTab === "Gallery"
              ? "Search photos and videos by event or keyword…"
              : "Search all sermons and gallery media…"
          }
        />

        {/* Gallery-specific sub-filter chips */}
        {activeTab === "Gallery" && (
          <div className="gallery-filter-chips">
            <button
              type="button"
              className={`filter-chip ${galleryFilter === "All" ? "active" : ""}`}
              onClick={() => setGalleryFilter("All")}
            >
              All ({allGallery.length})
            </button>
            <button
              type="button"
              className={`filter-chip ${galleryFilter === "Photos" ? "active" : ""}`}
              onClick={() => setGalleryFilter("Photos")}
            >
              <Camera size={14} />
              Photos ({allGallery.filter((i) => i.type === "PHOTO").length})
            </button>
            <button
              type="button"
              className={`filter-chip ${galleryFilter === "Videos" ? "active" : ""}`}
              onClick={() => setGalleryFilter("Videos")}
            >
              <FilmStrip size={14} />
              Videos ({allGallery.filter((i) => i.type === "VIDEO").length})
            </button>
          </div>
        )}
      </div>

      {/* VIEW: SERMONS ONLY */}
      {activeTab === "Sermons" && (
        <section className="sermons-section" style={{ marginTop: "32px" }}>
          {filteredSermons.length > 0 ? (
            <>
              <div className="cards-grid">
                {filteredSermons
                  .slice((sermonPage - 1) * sermonsPerPage, sermonPage * sermonsPerPage)
                  .map((item) => (
                    <article className="content-card sermon-card" key={item.id}>
                      <div className="sermon-card-img-wrapper">
                        <img src={item.image} alt={item.title} />
                        <span className="sermon-type-badge">
                          {item.type === "AUDIO" ? "Audio Sermon" : "Video Teaching"}
                        </span>
                      </div>
                      <div>
                        <span>{item.category || "Sermon"}</span>
                        <h2>{item.title}</h2>
                        <p>
                          <User size={15} />
                          {item.speaker}
                        </p>
                        {item.publishedAt && (
                          <p style={{ fontSize: "13px", marginTop: "4px" }}>
                            <CalendarBlank size={15} />
                            {formatDate(item.publishedAt)}
                          </p>
                        )}
                        <Link to={`/media/${item.slug}`} className="sermon-action-link">
                          {item.type === "AUDIO" ? "Listen to Sermon" : "Watch Teaching"} →
                        </Link>
                      </div>
                    </article>
                  ))}
              </div>

              <Pagination
                currentPage={sermonPage}
                totalItems={filteredSermons.length}
                pageSize={sermonsPerPage}
                onPageChange={setSermonPage}
              />
            </>
          ) : (
            <EmptyState title="No sermons found" body="Try searching for another sermon title or preacher." />
          )}
        </section>
      )}

      {/* VIEW: GALLERY ONLY (Phone Gallery Experience) */}
      {activeTab === "Gallery" && (
        <section className="gallery-section" style={{ marginTop: "32px" }}>
          {filteredGallery.length > 0 ? (
            <>
              <div className="phone-gallery-grid">
                {filteredGallery
                  .slice((galleryPage - 1) * galleryPerPage, galleryPage * galleryPerPage)
                  .map((item) => (
                    <div
                      key={item.id}
                      className="phone-gallery-tile"
                      onClick={() => openGalleryViewer(item)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === "Enter" && openGalleryViewer(item)}
                      aria-label={`Open ${item.title}`}
                    >
                      <img src={item.image} alt={item.title} loading="lazy" />

                      {/* Video Play badge overlay */}
                      {item.type === "VIDEO" && (
                        <div className="gallery-tile-video-badge">
                          <Play size={14} weight="fill" />
                          <span>VIDEO</span>
                        </div>
                      )}

                      {/* Hover Caption Pill */}
                      <div className="gallery-tile-caption">
                        <h4>{item.title}</h4>
                        {item.speaker && <small>{item.speaker}</small>}
                      </div>
                    </div>
                  ))}
              </div>

              <Pagination
                currentPage={galleryPage}
                totalItems={filteredGallery.length}
                pageSize={galleryPerPage}
                onPageChange={setGalleryPage}
              />
            </>
          ) : (
            <EmptyState
              title="No gallery items found"
              body="Try another search term or switch to another filter."
            />
          )}
        </section>
      )}

      {/* VIEW: ALL MEDIA (Shows both Sermons and Phone Gallery) */}
      {activeTab === "All" && (
        <div className="all-media-layout" style={{ marginTop: "36px", display: "flex", flexDirection: "column", gap: "52px" }}>
          {/* Sermons Spotlight */}
          <section>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "20px" }}>
              <div>
                <span style={{ color: "var(--blue)", fontSize: "13px", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em" }}>
                  Sound Doctrine & Ministry
                </span>
                <h2 style={{ font: "700 28px/1.2 'Manrope', sans-serif", margin: "4px 0 0" }}>
                  Recent Sermons & Teachings
                </h2>
              </div>
              <button
                type="button"
                className="button secondary micro"
                onClick={() => setActiveTab("Sermons")}
              >
                View all sermons ({allSermons.length}) →
              </button>
            </div>

            {filteredSermons.length > 0 ? (
              <div className="cards-grid">
                {filteredSermons.slice(0, 3).map((item) => (
                  <article className="content-card sermon-card" key={item.id}>
                    <div className="sermon-card-img-wrapper">
                      <img src={item.image} alt={item.title} />
                      <span className="sermon-type-badge">
                        {item.type === "AUDIO" ? "Audio Sermon" : "Video Teaching"}
                      </span>
                    </div>
                    <div>
                      <span>{item.category || "Sermon"}</span>
                      <h2>{item.title}</h2>
                      <p>
                        <User size={15} />
                        {item.speaker}
                      </p>
                      <Link to={`/media/${item.slug}`} className="sermon-action-link">
                        {item.type === "AUDIO" ? "Listen to Sermon" : "Watch Teaching"} →
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p style={{ color: "var(--muted)" }}>No sermons matching query.</p>
            )}
          </section>

          {/* Phone Gallery Spotlight */}
          <section>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "20px" }}>
              <div>
                <span style={{ color: "var(--blue)", fontSize: "13px", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em" }}>
                  Church Life & Conferences
                </span>
                <h2 style={{ font: "700 28px/1.2 'Manrope', sans-serif", margin: "4px 0 0" }}>
                  Photo & Video Gallery
                </h2>
              </div>
              <button
                type="button"
                className="button secondary micro"
                onClick={() => setActiveTab("Gallery")}
              >
                Open full phone gallery ({allGallery.length}) →
              </button>
            </div>

            {filteredGallery.length > 0 ? (
              <div className="phone-gallery-grid">
                {filteredGallery.slice(0, 8).map((item) => (
                  <div
                    key={item.id}
                    className="phone-gallery-tile"
                    onClick={() => openGalleryViewer(item)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && openGalleryViewer(item)}
                    aria-label={`Open ${item.title}`}
                  >
                    <img src={item.image} alt={item.title} loading="lazy" />

                    {item.type === "VIDEO" && (
                      <div className="gallery-tile-video-badge">
                        <Play size={14} weight="fill" />
                        <span>VIDEO</span>
                      </div>
                    )}

                    <div className="gallery-tile-caption">
                      <h4>{item.title}</h4>
                      {item.speaker && <small>{item.speaker}</small>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: "var(--muted)" }}>No gallery items matching query.</p>
            )}
          </section>
        </div>
      )}

      {/* Fullscreen Phone Gallery Lightbox Component */}
      {galleryViewerIndex !== null && (
        <PhoneGalleryViewer
          items={filteredGallery}
          initialIndex={galleryViewerIndex}
          onClose={() => setGalleryViewerIndex(null)}
        />
      )}
    </PageLayout>
  );
}
