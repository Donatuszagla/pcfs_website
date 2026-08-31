import { EmptyState } from "../components/EmptyState";
import { EventCard } from "../components/EventCard";
import { PageLayout } from "../components/PageLayout";
import type { Event } from "../types";

export interface EventsPageProps {
  events: Event[];
}

export function EventsPage({ events }: EventsPageProps) {
  const now = new Date("2026-08-30T00:00:00+00:00");
  const upcoming = events.filter((event) => new Date(event.endAt) >= now);
  const past = events.filter((event) => new Date(event.endAt) < now);
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
