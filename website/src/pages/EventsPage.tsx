import { EmptyState } from "../components/EmptyState";
import { EventCard } from "../components/EventCard";
import { PageLayout } from "../components/PageLayout";
import type { Event } from "../types";

export interface EventsPageProps {
  events: Event[];
}

export function EventsPage({ events }: EventsPageProps) {
  const now = new Date();
  /** An event is "upcoming/ongoing" when it has not yet ended.
   *  Falls back to startAt when endAt is missing or clearly swapped (endAt < startAt). */
  const upcoming = events.filter((event) => {
    const end = event.endAt ? new Date(event.endAt) : null;
    const start = event.startAt ? new Date(event.startAt) : null;
    const validEnd = end && !isNaN(end.getTime()) ? end : null;
    const validStart = start && !isNaN(start.getTime()) ? start : null;
    // If endAt is before startAt, dates are likely swapped — use startAt
    const effectiveEnd = validEnd && validStart && validEnd < validStart ? validStart : validEnd;
    if (effectiveEnd) return effectiveEnd >= now;
    if (validStart) return validStart >= now;
    return true;
  });
  const past = events.filter((event) => {
    const end = event.endAt ? new Date(event.endAt) : null;
    const start = event.startAt ? new Date(event.startAt) : null;
    const validEnd = end && !isNaN(end.getTime()) ? end : null;
    const validStart = start && !isNaN(start.getTime()) ? start : null;
    const effectiveEnd = validEnd && validStart && validEnd < validStart ? validStart : validEnd;
    if (effectiveEnd) return effectiveEnd < now;
    if (validStart) return validStart < now;
    return false;
  });
  return (
    <PageLayout
      eyebrow="Gather with us"
      title="PCFS events"
      intro="Discover upcoming programmes and revisit past events."
    >
      {upcoming.length ? (
        <>
          <h2>Upcoming events</h2>
          <div className="cards-grid">
            {upcoming.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </>
      ) : (
        <EmptyState
          title="No upcoming events"
          body="New programmes will appear here as soon as they are published."
        />
      )}
      {past.length > 0 && (
        <>
          <h2 className="subsection-heading">Past events</h2>
          <div className="cards-grid">
            {past.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </>
      )}
    </PageLayout>
  );
}
