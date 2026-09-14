import { useState, useRef } from "react";
import { CloudArrowUp, FilmStrip, Image as ImageIcon, Trash, X, CheckCircle, WarningCircle, SpinnerGap } from "@phosphor-icons/react";
import { uploadMediaFile } from "../utils/upload";
import { graphqlRequest, operations } from "../graphql";
import { slugify } from "../utils/helpers";
import { logger } from "../utils/logger";

interface QueueItem {
  id: string;
  file: File;
  previewUrl: string;
  title: string;
  isVideo: boolean;
  size: number;
  status: "pending" | "uploading" | "success" | "error";
  errorMessage?: string;
  uploadedUrl?: string;
}

export function BatchMediaUploader({
  accessToken,
  onClose,
  onComplete,
}: {
  accessToken?: string;
  onClose: () => void;
  onComplete: () => void;
}) {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [category, setCategory] = useState<"Gallery" | "Sermons">("Gallery");
  const [albumTag, setAlbumTag] = useState("");
  const [publishImmediately, setPublishImmediately] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleFilesAdded(filesList: FileList | File[]) {
    const files = Array.from(filesList);
    if (!files.length) return;

    const newItems: QueueItem[] = files.map((file) => {
      const isVideo = file.type.startsWith("video/") || /\.(mp4|webm|mov|mkv|ogg|3gp)$/i.test(file.name);
      const cleanTitle = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]+/g, " ").trim();
      const capitalizedTitle = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);

      return {
        id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        file,
        previewUrl: file.type.startsWith("image/") ? URL.createObjectURL(file) : "",
        title: capitalizedTitle,
        isVideo,
        size: file.size,
        status: "pending",
      };
    });

    setQueue((prev) => [...prev, ...newItems]);
  }

  function removeItem(id: string) {
    setQueue((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((i) => i.id !== id);
    });
  }

  function updateItemTitle(id: string, title: string) {
    setQueue((prev) => prev.map((item) => (item.id === id ? { ...item, title } : item)));
  }

  async function startBatchUpload() {
    if (!queue.length || isProcessing) return;
    setIsProcessing(true);

    let completedCount = 0;
    const totalCount = queue.length;

    for (let i = 0; i < queue.length; i++) {
      const item = queue[i];
      if (item.status === "success") {
        completedCount++;
        continue;
      }

      // Mark current item as uploading
      setQueue((prev) => prev.map((it) => (it.id === item.id ? { ...it, status: "uploading" } : it)));

      try {
        // Step 1: Upload file to Cloudflare R2 / Storage
        logger.action(`Batch uploading [${i + 1}/${totalCount}]: "${item.file.name}"`);
        const uploadResult = await uploadMediaFile(item.file, item.title, accessToken);

        // Step 2: Create MEDIA database record via GraphQL
        const cleanSlug = `${slugify(item.title)}-${Date.now().toString(36).slice(-4)}`;
        const mediaValues: Record<string, any> = {
          title: item.title,
          slug: cleanSlug,
          type: item.isVideo ? "VIDEO" : "PHOTO",
          category,
          speaker: albumTag.trim() || (category === "Gallery" ? "PCFS Gallery" : "PCFS Media Ministry"),
          description: albumTag.trim() ? `${albumTag.trim()} — ${item.title}` : item.title,
          image: item.isVideo ? "/images/rfmc-worship.png" : uploadResult.url,
          externalUrl: uploadResult.url,
          publishedAt: new Date().toISOString(),
          status: publishImmediately ? "PUBLISHED" : "DRAFT",
          featured: false,
        };

        await graphqlRequest(operations.save, { data: { kind: "MEDIA", values: mediaValues } }, accessToken);

        // Mark as success
        setQueue((prev) =>
          prev.map((it) =>
            it.id === item.id ? { ...it, status: "success", uploadedUrl: uploadResult.url } : it
          )
        );
        completedCount++;
        setOverallProgress(Math.round((completedCount / totalCount) * 100));
      } catch (err: any) {
        logger.error(`Batch upload error for ${item.file.name}:`, err);
        setQueue((prev) =>
          prev.map((it) =>
            it.id === item.id ? { ...it, status: "error", errorMessage: err.message || "Failed" } : it
          )
        );
      }
    }

    setIsProcessing(false);
    logger.success(`Batch upload finished: ${completedCount}/${totalCount} media uploaded`);
    setTimeout(() => {
      onComplete();
    }, 800);
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const pendingOrSuccessCount = queue.filter((i) => i.status === "success").length;

  return (
    <div className="modal-dialog batch-media-modal" style={{ maxWidth: "880px", width: "95%" }}>
      <header className="modal-header">
        <div className="modal-header-title">
          <CloudArrowUp size={28} />
          <div>
            <h2>Upload Plenty Pictures & Videos</h2>
            <p>Select multiple church pictures and videos to batch upload directly into the website media gallery.</p>
          </div>
        </div>
        <button type="button" className="button icon-only secondary" onClick={onClose} disabled={isProcessing}>
          <X size={20} />
        </button>
      </header>

      <div className="modal-body" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Batch Configuration Settings */}
        <div className="batch-settings-bar" style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: "16px", padding: "16px", background: "var(--surface-soft, #f4f6fa)", borderRadius: "8px" }}>
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "6px" }}>Filter Category</label>
            <div style={{ display: "flex", gap: "8px" }}>
              <button
                type="button"
                className={`button micro ${category === "Gallery" ? "primary" : "secondary"}`}
                onClick={() => setCategory("Gallery")}
                disabled={isProcessing}
              >
                🖼️ Gallery
              </button>
              <button
                type="button"
                className={`button micro ${category === "Sermons" ? "primary" : "secondary"}`}
                onClick={() => setCategory("Sermons")}
                disabled={isProcessing}
              >
                🎙️ Sermons
              </button>
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 700, marginBottom: "6px" }}>Event / Album Tag (Optional)</label>
            <input
              className="form-control"
              style={{ fontSize: "13px", padding: "6px 10px" }}
              value={albumTag}
              onChange={(e) => setAlbumTag(e.target.value)}
              placeholder="e.g. RFMC 2026 / Sunday Service"
              disabled={isProcessing}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
            <label className="form-checkbox-group" style={{ margin: 0, fontSize: "13px" }}>
              <input
                type="checkbox"
                checked={publishImmediately}
                onChange={(e) => setPublishImmediately(e.target.checked)}
                disabled={isProcessing}
              />
              <span>Publish immediately</span>
            </label>
          </div>
        </div>

        {/* Multi-file Dropzone */}
        <div
          className={`file-dropzone ${dragOver ? "drag-over" : ""}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            if (e.dataTransfer.files?.length) handleFilesAdded(e.dataTransfer.files);
          }}
          onClick={() => fileInputRef.current?.click()}
          style={{ cursor: "pointer", padding: "28px 16px", border: "2px dashed #9aa6dc", borderRadius: "8px", textAlign: "center" }}
        >
          <CloudArrowUp size={36} style={{ color: "var(--blue, #0b31d8)", margin: "0 auto 8px", display: "block" }} />
          <strong>Drop multiple pictures & videos here, or click to browse</strong>
          <p style={{ margin: "6px 0 0", fontSize: "12px", color: "var(--muted, #667085)" }}>
            Select up to 50 files at once (JPEG, PNG, WebP, MP4, WebM, MOV, etc.).
          </p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*"
            style={{ display: "none" }}
            onChange={(e) => e.target.files && handleFilesAdded(e.target.files)}
          />
        </div>

        {/* Queue Preview List */}
        {queue.length > 0 && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <strong>Queue: {queue.length} file{queue.length !== 1 ? "s" : ""} selected</strong>
              {!isProcessing && (
                <button type="button" className="button micro danger" onClick={() => setQueue([])}>
                  Clear all
                </button>
              )}
            </div>

            <div className="batch-queue-list" style={{ maxHeight: "320px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "8px", paddingRight: "4px" }}>
              {queue.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "8px 12px",
                    background: "white",
                    border: "1px solid var(--line, #e2e8f0)",
                    borderRadius: "6px",
                  }}
                >
                  {/* Thumbnail / Type badge */}
                  <div style={{ width: "48px", height: "48px", borderRadius: "4px", overflow: "hidden", background: "#edf2f7", display: "grid", placeItems: "center", flexShrink: 0 }}>
                    {item.previewUrl ? (
                      <img src={item.previewUrl} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : item.isVideo ? (
                      <FilmStrip size={24} style={{ color: "#0b31d8" }} />
                    ) : (
                      <ImageIcon size={24} style={{ color: "#64748b" }} />
                    )}
                  </div>

                  {/* Title & info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <input
                      className="form-control"
                      style={{ fontSize: "13px", padding: "4px 8px", width: "100%" }}
                      value={item.title}
                      onChange={(e) => updateItemTitle(item.id, e.target.value)}
                      disabled={isProcessing}
                      placeholder="Title"
                    />
                    <div style={{ display: "flex", gap: "10px", marginTop: "4px", fontSize: "11px", color: "#64748b" }}>
                      <span style={{ fontWeight: 600, color: item.isVideo ? "#7c3aed" : "#0284c7" }}>
                        {item.isVideo ? "VIDEO" : "PHOTO"}
                      </span>
                      <span>{formatSize(item.size)}</span>
                      <span>{item.file.name}</span>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div style={{ flexShrink: 0 }}>
                    {item.status === "uploading" && (
                      <span style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--blue)", fontSize: "12px" }}>
                        <SpinnerGap className="spin" size={16} /> Uploading…
                      </span>
                    )}
                    {item.status === "success" && (
                      <span style={{ display: "flex", alignItems: "center", gap: "4px", color: "#16a34a", fontSize: "12px", fontWeight: 600 }}>
                        <CheckCircle size={16} /> Uploaded
                      </span>
                    )}
                    {item.status === "error" && (
                      <span style={{ display: "flex", alignItems: "center", gap: "4px", color: "#dc2626", fontSize: "12px" }} title={item.errorMessage}>
                        <WarningCircle size={16} /> Failed
                      </span>
                    )}
                    {item.status === "pending" && !isProcessing && (
                      <button
                        type="button"
                        className="button micro icon-only secondary"
                        onClick={() => removeItem(item.id)}
                        title="Remove from queue"
                      >
                        <Trash size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Progress Bar */}
        {isProcessing && (
          <div style={{ marginTop: "10px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px" }}>
              <span>Uploading media ({pendingOrSuccessCount} of {queue.length} completed)...</span>
              <span>{overallProgress}%</span>
            </div>
            <div style={{ width: "100%", height: "8px", background: "#e2e8f0", borderRadius: "4px", overflow: "hidden" }}>
              <div
                style={{
                  width: `${overallProgress}%`,
                  height: "100%",
                  background: "var(--blue, #0b31d8)",
                  transition: "width 0.3s ease",
                }}
              />
            </div>
          </div>
        )}
      </div>

      <footer className="modal-footer" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button type="button" className="button secondary" onClick={onClose} disabled={isProcessing}>
          Cancel
        </button>

        <button
          type="button"
          className="button primary"
          onClick={startBatchUpload}
          disabled={!queue.length || isProcessing}
        >
          {isProcessing ? (
            <>
              <SpinnerGap className="spin" size={16} style={{ marginRight: "6px" }} />
              Uploading {queue.length} items…
            </>
          ) : (
            `Upload All (${queue.length} items)`
          )}
        </button>
      </footer>
    </div>
  );
}
