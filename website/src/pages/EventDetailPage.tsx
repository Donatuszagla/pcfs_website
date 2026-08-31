import { CalendarDots, MapPin } from "@phosphor-icons/react";
import { Link, useParams } from "react-router-dom";
import { PageLayout } from "../components/PageLayout";
import type { Event } from "../types";
import { formatDateRange } from "../utils/formatters";
import { NotFoundPage } from "./NotFoundPage";

export interface EventDetailPageProps {
  events: Event[];
}

export function EventDetailPage({ events }: EventDetailPageProps) {
  const { slug } = useParams();
  const event = events.find((item) => item.slug === slug);
  if (!event) return <NotFoundPage />;
  return (
    <PageLayout eyebrow={event.title} title={event.theme} intro={event.description}>
      <div className="detail-grid">
        <img src={event.image} alt="Temporary event worship photography" />
        <div>
          <p>
            <CalendarDots aria-hidden />
            {formatDateRange(event.startAt, event.endAt)}
          </p>
          <p>
            <MapPin aria-hidden />
            {event.venue}
          </p>
          <h2>Speakers</h2>
          <ul>
            {event.speakers.map((speaker) => (
              <li key={speaker}>{speaker}</li>
            ))}
          </ul>
          {event.registrationUrl ? (
            <a className="button" href={event.registrationUrl}>
              Register
            </a>
          ) : (
            <Link className="button" to="/contact">
              Ask about this event
            </Link>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
