import { useEffect, useRef, useState } from "react";
import {
  CaretLeft,
  CaretRight,
  CornersOut,
  CornersIn,
  DownloadSimple,
  Play,
  X,
  CalendarBlank,
  User,
} from "@phosphor-icons/react";
import type { MediaItem } from "../types";
import { formatDate } from "../utils/formatters";

export interface PhoneGalleryViewerProps {
  items: MediaItem[];
  initialIndex: number;
  onClose: () => void;
}

export function PhoneGalleryViewer({ items, initialIndex, onClose }: PhoneGalleryViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const activeThumbRef = useRef<HTMLButtonElement>(null);
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  const currentItem = items[currentIndex];

  const goNext = () => {
    setIsZoomed(false);
    setCurrentIndex((prev) => (prev + 1 < items.length ? prev + 1 : 0));
  };

  const goPrev = () => {
    setIsZoomed(false);
    setCurrentIndex((prev) => (prev - 1 >= 0 ? prev - 1 : items.length - 1));
  };

  // Lock body scroll while open
  useEffect(() => {
    const originalStyle = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") goNext();
      else if (e.key === "ArrowLeft") goPrev();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [items.length]);

  // Scroll active thumbnail into center of filmstrip
  useEffect(() => {
    if (activeThumbRef.current) {
      activeThumbRef.current.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [currentIndex]);

  // Touch swipe handling
  function handleTouchStart(e: React.TouchEvent) {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartXRef.current === null || touchStartYRef.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartXRef.current;
    const deltaY = e.changedTouches[0].clientY - touchStartYRef.current;

    // Horizontal swipe
    if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX > 0) goPrev();
      else goNext();
    }
    // Vertical swipe down to close
    else if (deltaY > 90 && Math.abs(deltaY) > Math.abs(deltaX)) {
      onClose();
    }

    touchStartXRef.current = null;
    touchStartYRef.current = null;
  }

  function toggleFullscreen() {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  }

  if (!currentItem) return null;

  const isVideo =
    currentItem.type === "VIDEO" ||
    (!!currentItem.externalUrl && /\.(mp4|webm|mov|ogg)(\?.*)?$/i.test(currentItem.externalUrl));
  const isDirectVideoFile =
    !!currentItem.externalUrl && /\.(mp4|webm|mov|ogg)(\?.*)?$/i.test(currentItem.externalUrl);
  const isYouTube =
    !!currentItem.externalUrl && /youtube\.com|youtu\.be/i.test(currentItem.externalUrl);

  const getYouTubeEmbedUrl = (url: string) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=1&rel=0` : url;
  };

  return (
    <div
      ref={containerRef}
      className="phone-gallery-overlay"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      role="dialog"
      aria-modal="true"
      aria-label="Phone Gallery Fullscreen Viewer"
    >
      {/* Top Header Bar */}
      <div className="phone-gallery-header">
        <div className="phone-gallery-header-left">
          <span className="gallery-counter-pill">
            {currentIndex + 1} / {items.length}
          </span>
          <span className={`gallery-type-pill ${isVideo ? "video" : "photo"}`}>
            {isVideo ? "VIDEO" : "PHOTO"}
          </span>
          <div className="gallery-title-wrapper">
            <h3 className="gallery-header-title">{currentItem.title}</h3>
            <div className="gallery-header-meta">
              {currentItem.speaker && (
                <span>
                  <User size={13} /> {currentItem.speaker}
                </span>
              )}
              {currentItem.publishedAt && (
                <span>
                  <CalendarBlank size={13} /> {formatDate(currentItem.publishedAt)}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="phone-gallery-header-actions">
          {currentItem.externalUrl && (
            <a
              href={currentItem.externalUrl}
              target="_blank"
              rel="noreferrer"
              className="gallery-icon-btn"
              title="Open full resolution / source"
            >
              <DownloadSimple size={20} />
            </a>
          )}
          <button
            type="button"
            className="gallery-icon-btn"
            onClick={toggleFullscreen}
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? <CornersIn size={20} /> : <CornersOut size={20} />}
          </button>
          <button
            type="button"
            className="gallery-icon-btn close-btn"
            onClick={onClose}
            title="Close gallery (Esc)"
          >
            <X size={22} />
          </button>
        </div>
      </div>

      {/* Main Stage Viewport */}
      <div className="phone-gallery-viewport">
        {/* Floating Chevrons */}
        <button
          type="button"
          className="gallery-nav-btn prev-btn"
          onClick={goPrev}
          aria-label="Previous item (Left Arrow)"
        >
          <CaretLeft size={28} />
        </button>

        <div className="phone-gallery-media-canvas">
          {isVideo ? (
            <div className="gallery-video-container">
              {isDirectVideoFile ? (
                <video
                  key={currentItem.externalUrl}
                  controls
                  autoPlay
                  playsInline
                  src={currentItem.externalUrl}
                  className="gallery-video-player"
                >
                  Your browser does not support the video element.
                </video>
              ) : isYouTube ? (
                <iframe
                  key={currentItem.externalUrl}
                  src={getYouTubeEmbedUrl(currentItem.externalUrl!)}
                  title={currentItem.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="gallery-video-iframe"
                />
              ) : (
                <div className="gallery-video-fallback">
                  <img
                    src={currentItem.image || "/images/rfmc-worship.png"}
                    alt={currentItem.title}
                    className="gallery-img-preview"
                  />
                  <a
                    href={currentItem.externalUrl || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="gallery-play-large-btn"
                  >
                    <Play size={36} weight="fill" />
                    <span>Watch Video</span>
                  </a>
                </div>
              )}
            </div>
          ) : (
            <img
              key={currentItem.image}
              src={currentItem.image}
              alt={currentItem.title}
              className={`gallery-main-img ${isZoomed ? "zoomed" : ""}`}
              onDoubleClick={() => setIsZoomed((z) => !z)}
              title="Double click to toggle zoom"
            />
          )}

          {currentItem.description && (
            <div className="gallery-caption-overlay">
              <p>{currentItem.description}</p>
            </div>
          )}
        </div>

        <button
          type="button"
          className="gallery-nav-btn next-btn"
          onClick={goNext}
          aria-label="Next item (Right Arrow)"
        >
          <CaretRight size={28} />
        </button>
      </div>

      {/* Bottom Filmstrip Carousel */}
      <div className="phone-gallery-filmstrip-tray">
        <div className="phone-gallery-filmstrip">
          {items.map((item, index) => {
            const isItemActive = index === currentIndex;
            const isItemVideo = item.type === "VIDEO";
            return (
              <button
                key={item.id || index}
                ref={isItemActive ? activeThumbRef : null}
                type="button"
                className={`filmstrip-thumb ${isItemActive ? "active" : ""}`}
                onClick={() => {
                  setIsZoomed(false);
                  setCurrentIndex(index);
                }}
                title={item.title}
              >
                <img src={item.image} alt={item.title} />
                {isItemVideo && (
                  <span className="filmstrip-video-indicator">
                    <Play size={10} weight="fill" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
