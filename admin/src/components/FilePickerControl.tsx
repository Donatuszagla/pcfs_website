import { useRef, useState } from "react";
import { CloudArrowUp, SpinnerGap } from "@phosphor-icons/react";
import { uploadMediaFile } from "../utils/upload";
import { logger } from "../utils/logger";

export function FilePickerControl({
  value,
  onChange,
  label,
  accept = "image/jpeg,image/png,image/webp,image/avif",
  accessToken,
  placeholder = "Upload image or enter URL...",
}: {
  value: string;
  onChange: (url: string) => void;
  label: string;
  accept?: string;
  accessToken?: string;
  placeholder?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isAudio = accept.includes("audio") || (!!value && /\.(mp3|m4a|wav|aac|ogg)(\?.*)?$/i.test(value));
  const maxSizeBytes = isAudio ? 200 * 1024 * 1024 : 10 * 1024 * 1024;
  const maxSizeLabel = isAudio ? "200 MB" : "10 MB";

  async function handleFileSelect(file: File) {
    if (!file) return;
    setError("");
    logger.action(`File selected for upload: "${file.name}" (${(file.size / 1024).toFixed(1)} KB, type: ${file.type || "unknown"})`);

    if (file.size > maxSizeBytes) {
      const msg = `File is too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Maximum allowed size is ${maxSizeLabel}.`;
      logger.warn("FilePicker", msg);
      setError(msg);
      return;
    }

    setUploading(true);
    try {
      const cleanName = file.name.replace(/\.[^/.]+$/, "").trim() || "Asset";
      const res = await uploadMediaFile(file, cleanName, accessToken);
      logger.success(`Asset uploaded successfully: ${res.url}`);
      onChange(res.url);
    } catch (err) {
      logger.error("File upload failed", err);
      setError(err instanceof Error ? err.message : "Failed to upload file");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="form-group span-2">
      <label>{label}</label>

      {value ? (
        <div className="file-preview-card">
          {isAudio ? (
            <div style={{ padding: "0.5rem 0", width: "100%" }}>
              <audio controls src={value} style={{ width: "100%", display: "block" }}>
                Your browser does not support the audio element.
              </audio>
            </div>
          ) : (
            <img src={value} alt="Uploaded media preview" onError={(e) => (e.currentTarget.style.display = "none")} />
          )}
          <div className="file-preview-info">
            <span className="file-preview-url">{value}</span>
            <small>✓ Asset stored on Cloudflare R2</small>
          </div>
          <div className="file-preview-actions">
            <button type="button" className="button secondary micro" onClick={() => fileInputRef.current?.click()}>
              Replace file
            </button>
            <button type="button" className="button danger micro" onClick={() => onChange("")}>
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div
          className={`file-dropzone ${dragOver ? "drag-over" : ""} ${uploading ? "uploading" : ""}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            if (e.dataTransfer.files?.[0]) handleFileSelect(e.dataTransfer.files[0]);
          }}
          onClick={() => fileInputRef.current?.click()}
        >
          {uploading ? (
            <div className="dropzone-state">
              <SpinnerGap className="spin dropzone-icon" />
              <span>Uploading to Cloudflare R2...</span>
            </div>
          ) : (
            <div className="dropzone-state">
              <CloudArrowUp className="dropzone-icon" />
              <div>
                <strong>Click to choose a file or drag & drop here</strong>
                <p>
                  {isAudio
                    ? `Uploads directly to Cloudflare R2 (MP3, M4A, WAV up to ${maxSizeLabel})`
                    : `Uploads directly to Cloudflare R2 (JPEG, PNG, WebP, AVIF up to ${maxSizeLabel})`}
                </p>
              </div>
              <button type="button" className="button secondary micro">Browse file</button>
            </div>
          )}
        </div>
      )}

      {error && <div className="alert error micro" role="alert">{error}</div>}

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        style={{ display: "none" }}
        onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
      />

      <details className="url-fallback-details">
        <summary>Or paste direct URL</summary>
        <input
          className="form-control"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      </details>
    </div>
  );
}
