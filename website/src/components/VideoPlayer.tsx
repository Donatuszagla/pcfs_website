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

export function extractYouTubeId(raw: string): string | null {
  if (!raw) return null;
  let str = raw.trim();

  // If user pasted iframe embed snippet: <iframe ... src="https://..."
  const iframeMatch = str.match(/src=["']([^"']+)["']/i);
  if (iframeMatch) str = iframeMatch[1].trim();

  // Match all YouTube URL variants including live streams and shorts
  const patterns = [
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/|live\/))([\w-]{11})/i,
    /(?:youtube-nocookie\.com\/embed\/)([\w-]{11})/i,
    /^([\w-]{11})$/,
  ];
  for (const pattern of patterns) {
    const match = str.match(pattern);
    if (match && match[1]) return match[1];
  }
  return null;
}

export function VideoPlayer({ item }: VideoPlayerProps) {
  const [isPlayingDirect, setIsPlayingDirect] = useState(false);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [copied, setCopied] = useState(false);

  // Check all possible fields where video URL might be stored
  const rawUrl = (
    item.externalUrl ||
    (item as any).mediaUrl ||
    (item as any).videoUrl ||
    (item as any).url ||
    ""
  ).trim();

  // Normalize URL (strip iframe wrapper if present, add https if needed)
  let normalizedUrl = rawUrl;
  const iframeMatch = rawUrl.match(/src=["']([^"']+)["']/i);
  if (iframeMatch) {
    normalizedUrl = iframeMatch[1].trim();
  } else if (
    !normalizedUrl.startsWith("http://") &&
    !normalizedUrl.startsWith("https://") &&
    !normalizedUrl.startsWith("/") &&
    (normalizedUrl.includes("youtube.com") ||
      normalizedUrl.includes("youtu.be") ||
      normalizedUrl.includes("vimeo.com"))
  ) {
    normalizedUrl = "https://" + normalizedUrl;
  }

  // YouTube detection
  const youtubeId = extractYouTubeId(rawUrl);
  const isYouTube = !!youtubeId;
  const youtubeEmbedUrl = youtubeId
    ? `https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1`
    : "";

  // Vimeo detection
  const isVimeo = !isYouTube && !!normalizedUrl && normalizedUrl.includes("vimeo.com");
  const getVimeoEmbedUrl = (raw: string) => {
    const match = raw.match(
      /vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^/]*)\/videos\/|)(\d+)/
    );
    return match ? `https://player.vimeo.com/video/${match[1]}?autoplay=1` : raw;
  };

  // Direct video file check (.mp4, .webm, .mov, /uploads/, etc.)
  const isDirectVideo =
    !isYouTube &&
    !isVimeo &&
    !!normalizedUrl &&
    (/\.(mp4|webm|mov|m4v|ogv)(\?.*)?$/i.test(normalizedUrl) ||
      normalizedUrl.includes("/uploads/") ||
      normalizedUrl.startsWith("/"));

  // Best available poster image
  const displayPoster =
    item.image ||
    (youtubeId ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg` : "/images/2.jpg");

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
                  src={displayPoster}
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
                key={normalizedUrl}
                src={normalizedUrl}
                controls
                autoPlay
                playsInline
                poster={displayPoster}
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
              key={youtubeEmbedUrl}
              src={youtubeEmbedUrl}
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
              src={getVimeoEmbedUrl(normalizedUrl)}
              title={item.title}
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              className="embedded-video-iframe"
            />
          </div>
        ) : normalizedUrl ? (
          /* Generic Video or Direct Link Fallback */
          <div className="generic-video-wrapper">
            <img
              src={displayPoster}
              alt={item.title}
              className="video-poster-img"
            />
            <div className="video-poster-scrim" />
            <a
              href={normalizedUrl}
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
              src={displayPoster}
              alt={item.title}
              className="video-poster-img blurred"
            />
            <div className="video-pending-message">
              <VideoCamera size={42} />
              <h3>Video Stream Pending</h3>
              <p>
                The broadcast recording for this teaching is currently being processed by the PCFS
                media team.
              </p>
              <a
                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(
                  `PCFS ${item.title} ${item.speaker || ""}`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="button secondary micro"
                style={{
                  marginTop: "14px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "8px 16px",
                }}
              >
                <YoutubeLogo size={18} weight="fill" style={{ color: "#ff0000" }} />
                <span>Search on YouTube PCFS Channel</span>
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Video Action Toolbar */}
      <div className="video-player-toolbar">
        <div className="video-toolbar-left">
          {/* Direct Download button */}
          {normalizedUrl && isDirectVideo && (
            <a
              href={normalizedUrl}
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
          {(normalizedUrl || isYouTube) && (
            <a
              href={
                isYouTube && youtubeId
                  ? `https://www.youtube.com/watch?v=${youtubeId}`
                  : normalizedUrl
              }
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
