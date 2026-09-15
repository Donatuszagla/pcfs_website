import { useEffect, useState } from "react";
import { YoutubeLogo, VideoCamera, FileArrowUp, LinkSimple, CheckCircle, Sparkle } from "@phosphor-icons/react";
import { FilePickerControl } from "./FilePickerControl";

export interface MediaSourcePickerProps {
  type: "VIDEO" | "AUDIO" | "PHOTO";
  externalUrl: string;
  image: string;
  onChangeExternalUrl: (url: string, autoThumbnail?: string) => void;
  onChangeImage: (url: string) => void;
  accessToken?: string;
}

export function extractYouTubeId(raw: string): string | null {
  if (!raw) return null;
  let str = raw.trim();
  const iframeMatch = str.match(/src=["']([^"']+)["']/i);
  if (iframeMatch) str = iframeMatch[1].trim();

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

export function normalizeMediaUrl(input: string): string {
  let str = input.trim();
  const iframeMatch = str.match(/src=["']([^"']+)["']/i);
  if (iframeMatch) str = iframeMatch[1].trim();

  if (
    !str.startsWith("http://") &&
    !str.startsWith("https://") &&
    !str.startsWith("/") &&
    (str.includes("youtube.com") || str.includes("youtu.be") || str.includes("vimeo.com") || str.includes("soundcloud.com"))
  ) {
    str = "https://" + str;
  }
  return str;
}

export function MediaSourcePicker({
  type,
  externalUrl,
  image,
  onChangeExternalUrl,
  onChangeImage,
  accessToken,
}: MediaSourcePickerProps) {
  // Determine default mode: if it's already a direct file path, select upload mode; otherwise link mode
  const isDirectUpload =
    !!externalUrl && (externalUrl.includes("/uploads/") || /\.(mp4|webm|mov|mp3|m4a|wav)(\?.*)?$/i.test(externalUrl));

  const [videoMode, setVideoMode] = useState<"link" | "upload">(isDirectUpload ? "upload" : "link");
  const [audioMode, setAudioMode] = useState<"upload" | "link">(isDirectUpload ? "upload" : "link");

  // Keep mode in sync when externalUrl changes (e.g. when opening a saved draft)
  useEffect(() => {
    if (externalUrl) {
      const isUpload = externalUrl.includes("/uploads/") || /\.(mp4|webm|mov|mp3|m4a|wav)(\?.*)?$/i.test(externalUrl);
      setVideoMode(isUpload ? "upload" : "link");
      setAudioMode(isUpload ? "upload" : "link");
    }
  }, [externalUrl]);

  const youtubeId = extractYouTubeId(externalUrl);
  const isYouTube = !!youtubeId;

  const handleUrlInput = (raw: string) => {
    const clean = normalizeMediaUrl(raw);
    const ytId = extractYouTubeId(clean);
    const autoThumb = ytId && !image ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : undefined;
    onChangeExternalUrl(clean, autoThumb);
  };

  const handleApplyYouTubeThumbnail = () => {
    if (youtubeId) {
      onChangeImage(`https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`);
    }
  };

  if (type === "VIDEO") {
    return (
      <div className="form-group span-2" style={{ background: "#f8faff", padding: "16px", borderRadius: "10px", border: "1px solid var(--line)" }}>
        <label style={{ fontWeight: 700, display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
          <VideoCamera size={20} color="var(--blue)" />
          <span>Video Teaching Source</span>
        </label>

        {/* Mode Switcher Tabs */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "14px" }}>
          <button
            type="button"
            className={`button micro ${videoMode === "link" ? "primary" : "secondary"}`}
            onClick={() => setVideoMode("link")}
            style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <YoutubeLogo size={18} weight={videoMode === "link" ? "fill" : "regular"} />
            <span>Paste Video Link (YouTube / Vimeo)</span>
          </button>
          <button
            type="button"
            className={`button micro ${videoMode === "upload" ? "primary" : "secondary"}`}
            onClick={() => setVideoMode("upload")}
            style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <FileArrowUp size={18} />
            <span>Upload Video File (MP4, WebM)</span>
          </button>
        </div>

        {videoMode === "link" ? (
          <div>
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                className="form-control"
                style={{ flex: 1 }}
                value={externalUrl || ""}
                onChange={(e) => handleUrlInput(e.target.value)}
                placeholder="Paste YouTube link: https://www.youtube.com/watch?v=... or https://youtu.be/..."
              />
              {externalUrl && (
                <button
                  type="button"
                  className="button secondary micro"
                  onClick={() => onChangeExternalUrl("")}
                >
                  Clear
                </button>
              )}
            </div>

            {/* Live YouTube Preview Box */}
            {isYouTube && youtubeId && (
              <div style={{ marginTop: "14px", background: "white", padding: "14px", borderRadius: "8px", border: "1px solid #dbeafe" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px", flexWrap: "wrap", gap: "8px" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#15803d", fontWeight: 700, fontSize: "13px" }}>
                    <CheckCircle size={18} weight="fill" />
                    <span>Valid YouTube Video Detected (ID: {youtubeId})</span>
                  </span>
                  <button
                    type="button"
                    className="button secondary micro"
                    onClick={handleApplyYouTubeThumbnail}
                    style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}
                    title="Set this video's high-res YouTube thumbnail as the cover photo"
                  >
                    <Sparkle size={16} weight="fill" color="#f59e0b" />
                    <span>Use YouTube Thumbnail as Cover Image</span>
                  </button>
                </div>
                <div style={{ position: "relative", width: "100%", maxWidth: "480px", aspectRatio: "16 / 9", borderRadius: "6px", overflow: "hidden" }}>
                  <iframe
                    src={`https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1`}
                    title="YouTube video preview"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{ width: "100%", height: "100%", border: 0 }}
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          <FilePickerControl
            label=""
            value={externalUrl || ""}
            onChange={onChangeExternalUrl}
            accept="video/mp4,video/webm,video/quicktime,video/ogg"
            accessToken={accessToken}
            placeholder="Upload video file (MP4, WebM up to 500 MB)..."
          />
        )}
      </div>
    );
  }

  if (type === "AUDIO") {
    return (
      <div className="form-group span-2" style={{ background: "#f8faff", padding: "16px", borderRadius: "10px", border: "1px solid var(--line)" }}>
        <label style={{ fontWeight: 700, display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
          <span>Audio Sermon Source</span>
        </label>

        {/* Mode Switcher Tabs */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "14px" }}>
          <button
            type="button"
            className={`button micro ${audioMode === "upload" ? "primary" : "secondary"}`}
            onClick={() => setAudioMode("upload")}
            style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <FileArrowUp size={18} />
            <span>Upload Audio File (MP3, M4A, WAV)</span>
          </button>
          <button
            type="button"
            className={`button micro ${audioMode === "link" ? "primary" : "secondary"}`}
            onClick={() => setAudioMode("link")}
            style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
          >
            <LinkSimple size={18} />
            <span>Audio Stream Link (SoundCloud / Stream URL)</span>
          </button>
        </div>

        {audioMode === "upload" ? (
          <FilePickerControl
            label=""
            value={externalUrl || ""}
            onChange={onChangeExternalUrl}
            accept="audio/mpeg,audio/mp3,audio/wav,audio/x-m4a,audio/m4a,audio/aac,audio/ogg"
            accessToken={accessToken}
            placeholder="Upload audio file (MP3, M4A up to 500 MB)..."
          />
        ) : (
          <input
            className="form-control"
            value={externalUrl || ""}
            onChange={(e) => handleUrlInput(e.target.value)}
            placeholder="Paste audio stream link (SoundCloud, podcast RSS audio, or direct URL)..."
          />
        )}
      </div>
    );
  }

  // PHOTO type
  return (
    <FilePickerControl
      label="Photo / Gallery Picture File"
      value={externalUrl || ""}
      onChange={onChangeExternalUrl}
      accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
      accessToken={accessToken}
      placeholder="Upload high-resolution photo..."
    />
  );
}
