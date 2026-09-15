import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarBlank,
  User,
  BookOpenText,
  Clock,
  Sparkle,
  Church,
} from "@phosphor-icons/react";
import { AudioPlayer } from "../components/AudioPlayer";
import { VideoPlayer } from "../components/VideoPlayer";
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

  const isVideo =
    item.type === "VIDEO" ||
    (!!item.externalUrl &&
      (/\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(item.externalUrl) ||
        item.externalUrl.includes("youtube.com") ||
        item.externalUrl.includes("youtu.be") ||
        item.externalUrl.includes("vimeo.com")));

  const isAudio =
    item.type === "AUDIO" ||
    (!!item.externalUrl &&
      (/\.(mp3|m4a|wav|aac|ogg)(\?.*)?$/i.test(item.externalUrl) ||
        item.externalUrl.includes("soundcloud.com")));

  // Find related sermons / teachings (excluding current item)
  const relatedMedia = media
    .filter((entry) => entry.id !== item.id && entry.category === "Sermons")
    .slice(0, 3);

  return (
    <PageLayout
      eyebrow={`${item.category || "Media"} · ${
        item.type === "AUDIO" ? "Audio Sermon" : item.type === "VIDEO" ? "Video Teaching" : "Photo"
      }`}
      title={item.title}
      intro={item.speaker ? `A sermon message by ${item.speaker}` : undefined}
    >
      <div className="teaching-page-container">
        {/* Navigation Breadcrumb */}
        <div className="teaching-breadcrumb-bar">
          <Link to="/media" className="teaching-back-link">
            <ArrowLeft size={16} weight="bold" />
            <span>Back to All Teachings & Sermons</span>
          </Link>
          <div className="teaching-meta-pills">
            <span className="teaching-category-pill">{item.category || "Sermons"}</span>
            <span className={`teaching-format-pill ${isVideo ? "video" : isAudio ? "audio" : "photo"}`}>
              {isVideo ? "Video Teaching" : isAudio ? "Audio Sermon" : "Photo"}
            </span>
          </div>
        </div>

        {/* Hero Speaker & Date Banner */}
        <div className="teaching-speaker-strip">
          <div className="teaching-speaker-left">
            <div className="teaching-speaker-avatar">
              <User size={24} weight="bold" />
            </div>
            <div>
              <span className="teaching-speaker-label">Preacher / Speaker</span>
              <strong className="teaching-speaker-name">
                {item.speaker || "PCFS Apostolic Ministry"}
              </strong>
            </div>
          </div>

          <div className="teaching-speaker-right">
            {item.publishedAt && (
              <div className="teaching-meta-stat">
                <CalendarBlank size={18} />
                <span>{formatDate(item.publishedAt)}</span>
              </div>
            )}
            <div className="teaching-meta-stat">
              <Clock size={18} />
              <span>Full Message</span>
            </div>
          </div>
        </div>

        {/* PRIMARY PLAYER SHOWCASE STAGE */}
        <section className="teaching-player-section" aria-label="Media Player">
          {isVideo ? (
            <VideoPlayer item={item} />
          ) : isAudio ? (
            <AudioPlayer item={item} />
          ) : (
            /* Photo item view */
            <div className="teaching-photo-showcase">
              <img src={item.image} alt={item.title} className="teaching-photo-img" />
              {item.externalUrl && (
                <div style={{ marginTop: "16px", textAlign: "center" }}>
                  <a
                    href={item.externalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="button primary"
                  >
                    Open Full Resolution
                  </a>
                </div>
              )}
            </div>
          )}
        </section>

        {/* MESSAGE NOTES & SPEAKER DETAILS GRID */}
        <section className="teaching-details-grid">
          {/* Left Column: Message Summary & Key Takeaways */}
          <div className="teaching-notes-column">
            <article className="teaching-notes-card">
              <div className="card-header-with-icon">
                <BookOpenText size={24} className="accent-icon" />
                <h3>About This Message</h3>
              </div>
              {item.description ? (
                item.description.split(/\n+/).map((para, i) => (
                  <p key={i} className="teaching-full-description">
                    {para}
                  </p>
                ))
              ) : (
                <p className="teaching-full-description">
                  Watch or listen to this inspiring teaching from the PCFS pulpit.
                </p>
              )}

              <div className="teaching-takeaways-box">
                <h4>
                  <Sparkle size={18} weight="fill" className="accent-gold" /> Key Spiritual Pillars
                </h4>
                <ul>
                  <li>Rooted in the unwavering truth of God's Word and Apostolic doctrine.</li>
                  <li>Equipping believers for kingdom impact, prayer life, and victorious living.</li>
                  <li>Encouraging fellowship and spiritual maturity across all PCFS branches.</li>
                </ul>
              </div>
            </article>
          </div>

          {/* Right Column: Preacher Profile & Church Invitation */}
          <aside className="teaching-sidebar-column">
            <div className="teaching-preacher-card">
              <div className="preacher-badge">
                <Church size={20} />
                <span>Paradise City of Faith Sanctuary</span>
              </div>
              <h4>Ministry & Teaching</h4>
              <p>
                PCFS messages are delivered under apostolic unction to build, edify, and strengthen
                the body of Christ with sound biblical doctrine.
              </p>
              <Link to="/branches" className="button button-compact" style={{ width: "100%" }}>
                Find a Branch Near You
              </Link>
            </div>

            <div className="teaching-help-box">
              <h4>Need Prayer or Counseling?</h4>
              <p>
                Our pastoral team is available to stand with you in faith. Reach out through our
                contact ministry.
              </p>
              <Link to="/contact" className="sermon-action-link" style={{ marginTop: "8px", display: "inline-block" }}>
                Contact Ministry Office →
              </Link>
            </div>
          </aside>
        </section>

        {/* MORE TEACHINGS & SERMONS RECOMMENDATIONS */}
        {relatedMedia.length > 0 && (
          <section className="teaching-related-section">
            <div className="section-header-compact">
              <div>
                <span className="eyebrow">Continue Growing</span>
                <h3>More Sermons & Teachings</h3>
              </div>
              <Link to="/media" className="button secondary button-compact">
                View All Sermons →
              </Link>
            </div>

            <div className="cards-grid">
              {relatedMedia.map((rel) => (
                <article className="content-card sermon-card" key={rel.id}>
                  <div className="sermon-card-img-wrapper">
                    <img src={rel.image} alt={rel.title} />
                    <span className="sermon-type-badge">
                      {rel.type === "AUDIO" ? "Audio Sermon" : "Video Teaching"}
                    </span>
                  </div>
                  <div>
                    <span>{rel.category || "Sermon"}</span>
                    <h2>{rel.title}</h2>
                    <p>
                      <User size={15} />
                      {rel.speaker}
                    </p>
                    {rel.publishedAt && (
                      <p style={{ fontSize: "13px", marginTop: "4px" }}>
                        <CalendarBlank size={15} />
                        {formatDate(rel.publishedAt)}
                      </p>
                    )}
                    <Link to={`/media/${rel.slug}`} className="sermon-action-link">
                      {rel.type === "AUDIO" ? "Listen to Sermon" : "Watch Teaching"} →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </PageLayout>
  );
}
