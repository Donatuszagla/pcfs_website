import { MapPin } from "@phosphor-icons/react";
import { Link } from "react-router-dom";
import type { Event } from "../types";
import { formatDateRange } from "../utils/formatters";

export interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  return (
    <article className="content-card">
      <img src={event.image} alt="Temporary event worship photography" />
      <div>
        <span>{formatDateRange(event.startAt, event.endAt)}</span>
        <h2>
          {event.title}: {event.theme}
        </h2>
        <p>
          <MapPin aria-hidden />
          {event.venue}
        </p>
        <Link to={`/events/${event.slug}`}>View event</Link>
      </div>
    </article>
  );
}
