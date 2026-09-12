import { useParams } from "react-router-dom";
import { PageLayout } from "../components/PageLayout";
import type { MediaItem } from "../types";
import { formatDate } from "../utils/formatters";
import { NotFoundPage } from "./NotFoundPage";

export interface MediaDetailPageProps {
  media: MediaItem[];
}

export function MediaDetailPage({ media }: MediaDetailPageProps) {
  const { slug } = useParams();
  const item = media.find((entry) => entry.slug === slug);
  if (!item) return <NotFoundPage />;

  const isAudioFile = !!item.externalUrl && (item.type === "AUDIO" || /\.(mp3|m4a|wav|aac|ogg)(\?.*)?$/i.test(item.externalUrl));

  return (
    <PageLayout eyebrow={`${item.category} · ${item.type}`} title={item.title} intro={item.description}>
      <div className="detail-grid">
        <img src={item.image} alt={item.title || "Media cover image"} />
        <div>
          <h2>{item.speaker}</h2>
          <p>{formatDate(item.publishedAt)}</p>
          {item.externalUrl ? (
            <div className="media-player-container">
              {isAudioFile && (
                <div style={{ margin: "1rem 0" }}>
                  <audio controls src={item.externalUrl} style={{ width: "100%", maxWidth: "420px", display: "block" }}>
                    Your browser does not support the audio element.
                  </audio>
                </div>
              )}
              <a className="button" href={item.externalUrl} target="_blank" rel="noreferrer">
                {isAudioFile ? "Download / Open Audio" : "Open media"}
              </a>
            </div>
          ) : (
            <p className="notice">Official media link pending upload.</p>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
