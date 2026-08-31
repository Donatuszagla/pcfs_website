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
  return (
    <PageLayout eyebrow={`${item.category} · ${item.type}`} title={item.title} intro={item.description}>
      <div className="detail-grid">
        <img src={item.image} alt="Open Bible on a church lectern" />
        <div>
          <h2>{item.speaker}</h2>
          <p>{formatDate(item.publishedAt)}</p>
          {item.externalUrl ? (
            <a className="button" href={item.externalUrl} rel="noreferrer">
              Open media
            </a>
          ) : (
            <p className="notice">Official media link pending upload.</p>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
