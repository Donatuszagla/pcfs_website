import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Article,
  Buildings,
  CalendarDots,
  CaretRight,
  EnvelopeSimple,
  ImageSquare,
  UsersThree,
  Sparkle,
  ArrowsClockwise,
  WarningCircle,
  ShieldCheck,
} from "@phosphor-icons/react";
import { PageTitle } from "../components/UI";
import { useAuth } from "../auth";
import { graphqlRequest, operations, type DashboardStats } from "../graphql";
import { logger } from "../utils/logger";

export function DashboardPage() {
  const { accessToken } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchStats = useCallback(
    async (isManualRefresh = false) => {
      if (isManualRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const data = await graphqlRequest<{ dashboardStats: DashboardStats }>(
          operations.dashboardStats,
          undefined,
          accessToken
        );
        setStats(data.dashboardStats);
        setLastUpdated(new Date());
        logger.info("Admin dashboard statistics synchronized with database");
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to load database counts";
        setError(msg);
        logger.error("Failed to load dashboard statistics", err);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [accessToken]
  );

  useEffect(() => {
    void fetchStats(false);
  }, [fetchStats]);

  const cards = [
    {
      label: "Branches",
      value: stats !== null ? stats.branches : "—",
      detail:
        stats !== null
          ? stats.branchRegionsCount === 1
            ? "1 regional jurisdiction"
            : `Across ${stats.branchRegionsCount} regions`
          : "Fetching branches…",
      icon: Buildings,
      href: "/content/branch",
      accent: "var(--blue)",
    },
    {
      label: "Upcoming events",
      value: stats !== null ? stats.upcomingEvents : "—",
      detail: stats !== null ? `${stats.events} total scheduled in database` : "Fetching events…",
      icon: CalendarDots,
      href: "/content/event",
      accent: "#7c3aed",
    },
    {
      label: "Media & Sermons",
      value: stats !== null ? stats.media : "—",
      detail:
        stats !== null
          ? `${stats.sermons} sermons · ${stats.gallery} gallery items`
          : "Fetching media items…",
      icon: ImageSquare,
      href: "/content/media",
      accent: "#0284c7",
    },
    {
      label: "Inbox Enquiries",
      value: stats !== null ? stats.enquiries : "—",
      detail:
        stats !== null
          ? stats.pendingEnquiries > 0
            ? `${stats.pendingEnquiries} pending response`
            : "All enquiries cleared"
          : "Fetching inbox…",
      icon: EnvelopeSimple,
      href: "/content/submission",
      badge: stats && stats.pendingEnquiries > 0 ? `${stats.pendingEnquiries} pending` : undefined,
      accent: stats && stats.pendingEnquiries > 0 ? "#ea580c" : "#16a34a",
    },
    {
      label: "Church Leaders",
      value: stats !== null ? stats.leaders : "—",
      detail: "Pastors, elders & leadership",
      icon: UsersThree,
      href: "/content/leader",
      accent: "#0d9488",
    },
    {
      label: "Ministries",
      value: stats !== null ? stats.ministries : "—",
      detail: "Active church departments",
      icon: Sparkle,
      href: "/content/ministry",
      accent: "#d97706",
    },
    {
      label: "Published Pages",
      value: stats !== null ? stats.pages : "—",
      detail: "Core public routes",
      icon: Article,
      href: "/content/page",
      accent: "#2563eb",
    },
    {
      label: "Admin Accounts",
      value: stats !== null ? stats.users : "—",
      detail: "Authorized administrators",
      icon: ShieldCheck,
      href: "/content/page",
      accent: "#475569",
    },
  ];

  return (
    <>
      <PageTitle
        eyebrow="OVERVIEW"
        title="Good to see you."
        description="Real-time counts directly from the church database, reflecting all live branches, events, media teachings, and submissions."
        action={
          <div className="dashboard-actions">
            {lastUpdated && (
              <span className="live-pill" title={`Synchronized with database at ${lastUpdated.toLocaleTimeString()}`}>
                <span className="live-dot" />
                Live Database
              </span>
            )}
            <button
              type="button"
              className="button secondary refresh-btn"
              onClick={() => void fetchStats(true)}
              disabled={refreshing || loading}
              aria-label="Refresh database counts"
            >
              <ArrowsClockwise className={refreshing ? "spin" : ""} weight="bold" />
              <span>{refreshing ? "Refreshing…" : "Refresh counts"}</span>
            </button>
          </div>
        }
      />

      {error && (
        <div className="alert error" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <WarningCircle size={20} weight="bold" />
            <span>{error}</span>
          </div>
          <button type="button" className="button secondary" onClick={() => void fetchStats(true)} style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}>
            Retry
          </button>
        </div>
      )}

      {stats && stats.pendingEnquiries > 0 && (
        <div className="overview-notice">
          <div className="overview-notice-content">
            <EnvelopeSimple size={24} weight="duotone" />
            <div>
              <strong>{stats.pendingEnquiries} pending visitor {stats.pendingEnquiries === 1 ? "enquiry" : "enquiries"}</strong>
              <p>You have new messages from church website visitors awaiting staff follow-up.</p>
            </div>
          </div>
          <Link to="/content/submission" className="button primary" style={{ whiteSpace: "nowrap" }}>
            Open Inbox &rarr;
          </Link>
        </div>
      )}

      <div className="stat-grid">
        {cards.map(({ icon: Icon, badge, accent, ...card }) => (
          <Link to={card.href} className={`stat-card ${loading && !stats ? "stat-card-loading" : ""}`} key={card.label}>
            <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "flex-start" }}>
              <span className="stat-icon" style={accent ? { color: accent, background: `${accent}15` } : undefined}>
                <Icon weight="duotone" />
              </span>
              {badge && <span className="stat-card-badge">{badge}</span>}
            </div>
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

