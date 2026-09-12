import { Link } from "react-router-dom";
import { Article, Buildings, CalendarDots, CaretRight, EnvelopeSimple } from "@phosphor-icons/react";
import { PageTitle } from "../components/UI";

export function DashboardPage() {
  const cards = [
    { label: "Pages", value: "12", detail: "Core public routes", icon: Article, href: "/content/page" },
    { label: "Upcoming events", value: "1", detail: "RFMC 2026 featured", icon: CalendarDots, href: "/content/event" },
    { label: "Branches", value: "5", detail: "Across two regions", icon: Buildings, href: "/content/branch" },
    { label: "Enquiries", value: "—", detail: "Open the live inbox", icon: EnvelopeSimple, href: "/content/submission" },
  ];

  return (
    <>
      <PageTitle eyebrow="OVERVIEW" title="Good to see you." description="Review the church’s public content and move drafts through to publication." />
      <div className="stat-grid">
        {cards.map(({ icon: Icon, ...card }) => (
          <Link to={card.href} className="stat-card" key={card.label}>
            <span className="stat-icon">
              <Icon weight="duotone" />
            </span>
            <strong>{card.value}</strong>
            <span>{card.label}</span>
            <small>{card.detail}</small>
            <CaretRight />
          </Link>
        ))}
      </div>
      <section className="panel">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">OPERATIONAL CHECKLIST</span>
            <h2>CMS Management Overview</h2>
          </div>
        </div>
        <div className="checklist">
          <p><span>1</span>Upload sermon audio broadcasts & event photos via Cloudflare R2 file manager.</p>
          <p><span>2</span>Monitor website enquiry inbox and contact form submissions.</p>
          <p><span>3</span>Maintain branch service schedules, regional events, and leader profiles.</p>
          <p><span>4</span>Review published media teachings and upcoming ministry broadcasts.</p>
        </div>
      </section>
    </>
  );
}
