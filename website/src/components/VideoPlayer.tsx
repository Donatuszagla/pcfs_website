import { useState } from "react";
import {
  Play,
  DownloadSimple,
  ShareNetwork,
  Check,
  ArrowSquareOut,
  CornersOut,
  CornersIn,
  VideoCamera,
  YoutubeLogo,
} from "@phosphor-icons/react";
import type { MediaItem } from "../types";

export interface VideoPlayerProps {
  item: MediaItem;
}

export function VideoPlayer({ item }: VideoPlayerProps) {
  const [isPlayingDirect, setIsPlayingDirect] = useState(false);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [copied, setCopied] = useState(false);

  const url = item.externalUrl || "";

  // Direct video file check (.mp4, .webm, .mov, /uploads/, etc.)
  const isDirectVideo =
    !!url &&
    (/\.(mp4|webm|mov|m4v|ogv)(\?.*)?$/i.test(url) ||
      url.includes("/uploads/") ||
      url.startsWith("/"));

  // YouTube detection
  const isYouTube =
    !!url && (url.includes("youtube.com") || url.includes("youtu.be"));

  const getYouTubeEmbedUrl = (rawUrl: string) => {
    const match = rawUrl.match(
      /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/
    );
    return match
      ? `https://www.youtube.com/embed/${match[1]}?autoplay=1&rel=0&modestbranding=1`
      : rawUrl;
  };

  // Vimeo detection
  const isVimeo = !!url && url.includes("vimeo.com");
  const getVimeoEmbedUrl = (rawUrl: string) => {
    const match = rawUrl.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^/]*)\/videos\/|)(\d+)/);
    return match ? `https://player.vimeo.com/video/${match[1]}?autoplay=1` : rawUrl;
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className={`video-teaching-player-card ${isTheaterMode ? "theater-mode" : ""}`}>
      {/* 16:9 Cinema Stage */}
      <div className="video-cinema-stage">
        {isDirectVideo ? (
          /* Direct HTML5 Video Player */
          <div className="direct-video-wrapper">
            {!isPlayingDirect ? (
              <div
                className="video-poster-overlay"
                onClick={() => setIsPlayingDirect(true)}
                role="button"
                tabIndex={0}
                aria-label={`Play video: ${item.title}`}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") setIsPlayingDirect(true);
                }}
              >
                <img
                  src={item.image || "/images/2.jpg"}
                  alt={item.title}
                  className="video-poster-img"
                />
                <div className="video-poster-scrim" />
                <div className="video-center-play-circle">
                  <Play size={38} weight="fill" />
                </div>
                <div className="video-poster-badge">
                  <VideoCamera size={14} weight="bold" />
                  <span>Watch Teaching · Direct Stream</span>
                </div>
              </div>
            ) : (
              <video
                key={url}
                src={url}
                controls
                autoPlay
                playsInline
                poster={item.image}
                className="native-html5-video"
              >
                Your browser does not support HTML5 video playback.
              </video>
            )}
          </div>
        ) : isYouTube ? (
          /* YouTube Embed Player */
          <div className="iframe-video-wrapper">
            <iframe
              src={getYouTubeEmbedUrl(url)}
              title={item.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="embedded-video-iframe"
            />
          </div>
        ) : isVimeo ? (
          /* Vimeo Embed Player */
          <div className="iframe-video-wrapper">
            <iframe
              src={getVimeoEmbedUrl(url)}
              title={item.title}
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              className="embedded-video-iframe"
            />
          </div>
        ) : url ? (
          /* Generic Video or Direct Link Fallback */
          <div className="generic-video-wrapper">
            <img
              src={item.image || "/images/2.jpg"}
              alt={item.title}
              className="video-poster-img"
            />
            <div className="video-poster-scrim" />
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="video-open-external-large-btn"
            >
              <Play size={32} weight="fill" />
              <span>Watch Teaching Stream</span>
            </a>
          </div>
        ) : (
          /* Pending Upload Placeholder */
          <div className="video-pending-wrapper">
            <img
              src={item.image || "/images/2.jpg"}
              alt={item.title}
              className="video-poster-img blurred"
            />
            <div className="video-pending-message">
              <VideoCamera size={42} />
              <h3>Video Stream Pending</h3>
              <p>The media team is currently processing the broadcast recording for this teaching.</p>
            </div>
          </div>
        )}
      </div>

      {/* Video Action Toolbar */}
      <div className="video-player-toolbar">
        <div className="video-toolbar-left">
          {/* Direct Download button */}
          {url && isDirectVideo && (
            <a
              href={url}
              download
              target="_blank"
              rel="noreferrer"
              className="video-toolbar-btn primary"
              title="Download full video file"
            >
              <DownloadSimple size={18} weight="bold" />
              <span>Download Video</span>
            </a>
          )}

          {/* External Source Link */}
          {url && (
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="video-toolbar-btn secondary"
              title={isYouTube ? "Watch on YouTube" : "Open external video link"}
            >
              {isYouTube ? (
                <>
                  <YoutubeLogo size={20} weight="fill" style={{ color: "#ff0000" }} />
                  <span>Watch on YouTube</span>
                </>
              ) : (
                <>
                  <ArrowSquareOut size={18} />
                  <span>{isDirectVideo ? "Direct Stream URL" : "Open Stream"}</span>
                </>
              )}
            </a>
          )}

          {/* Theater Mode Toggle */}
          <button
            type="button"
            className="video-toolbar-btn mode-btn"
            onClick={() => setIsTheaterMode(!isTheaterMode)}
            title={isTheaterMode ? "Standard View" : "Theater View (Wide)"}
          >
            {isTheaterMode ? (
              <>
                <CornersIn size={18} />
                <span>Default View</span>
              </>
            ) : (
              <>
                <CornersOut size={18} />
                <span>Theater Mode</span>
              </>
            )}
          </button>
        </div>

        {/* Share Button */}
        <div className="video-toolbar-right">
          <button
            type="button"
            className="video-toolbar-btn share-btn"
            onClick={handleShare}
            title="Copy teaching link to share"
          >
            {copied ? (
              <>
                <Check size={18} weight="bold" style={{ color: "#10b981" }} />
                <span style={{ color: "#10b981" }}>Link Copied!</span>
              </>
            ) : (
              <>
                <ShareNetwork size={18} />
                <span>Share Teaching</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
