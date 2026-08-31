import { List, X } from "@phosphor-icons/react";
import { type ReactNode, useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import type { SiteData } from "../types";

export interface SiteShellProps {
  data: SiteData;
  children: ReactNode;
}

function useScrollReveal(): void {
  const location = useLocation();
  useEffect(() => {
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) return;
    const elements = document.querySelectorAll(".reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -30px 0px" }
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [location.pathname]);
}

function useClientMetadata(pathname: string, data: SiteData): void {
  useEffect(() => {
    const branch = data.branches.find((item) => pathname === `/branches/${item.slug}`);
    const event = data.events.find((item) => pathname === `/events/${item.slug}`);
    const media = data.media.find((item) => pathname === `/media/${item.slug}`);
    const routeTitles: Record<string, string> = {
      "/": `${data.settings.name} | Official Website`,
      "/about": `About Us | ${data.settings.shortName}`,
      "/branches": `Branches | ${data.settings.shortName}`,
      "/media": `Media | ${data.settings.shortName}`,
      "/events": `Events | ${data.settings.shortName}`,
      "/contact": `Contact Us | ${data.settings.shortName}`,
      "/privacy": `Privacy Policy | ${data.settings.shortName}`,
      "/terms": `Website Terms | ${data.settings.shortName}`,
    };
    const title =
      branch?.name ??
      event?.title ??
      media?.title ??
      routeTitles[pathname] ??
      `Page Not Found | ${data.settings.shortName}`;
    const description =
      branch?.description ?? event?.description ?? media?.description ?? data.settings.description;
    document.title = title;
    updateMeta("name", "description", description);
    updateMeta("property", "og:title", title);
    updateMeta("property", "og:description", description);
    let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = `${window.location.origin}${pathname === "/" ? "" : pathname}`;
    document.getElementById("pcfs-route-schema")?.remove();
    const schema = document.createElement("script");
    schema.id = "pcfs-route-schema";
    schema.type = "application/ld+json";
    schema.text = JSON.stringify(
      event
        ? {
            "@context": "https://schema.org",
            "@type": "Event",
            name: event.title,
            description: event.description,
            startDate: event.startAt,
            endDate: event.endAt,
            location: { "@type": "Place", name: event.venue },
          }
        : {
            "@context": "https://schema.org",
            "@type": "Church",
            name: data.settings.name,
            description: data.settings.description,
          }
    );
    document.head.appendChild(schema);
  }, [data, pathname]);
}

function updateMeta(attribute: "name" | "property", key: string, content: string): void {
  let element = document.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.content = content;
}

export function SiteShell({ data, children }: SiteShellProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  useScrollReveal();

  useEffect(() => {
    setMenuOpen(false);
    window.scrollTo?.({ top: 0, behavior: "auto" });
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useClientMetadata(location.pathname, data);
  const nav = [
    ["/", "Home"],
    ["/about", "About Us"],
    ["/branches", "Branches"],
    ["/media", "Media"],
    ["/events", "Events"],
  ];
  return (
    <div className="site-shell">
      <header className={scrolled ? "site-header scrolled" : "site-header"}>
        <Link className="brand" to="/" aria-label="Paradise City of Faith Sanctuary home">
          <img src="/images/PCFS LOGO.png" alt="PCFS logo" />
          <span>{data.settings.name}</span>
        </Link>
        <button
          className="menu-toggle"
          type="button"
          aria-expanded={menuOpen}
          aria-controls="site-navigation"
          onClick={() => setMenuOpen((value) => !value)}
        >
          {menuOpen ? <X aria-hidden /> : <List aria-hidden />}
          <span className="sr-only">Toggle navigation</span>
        </button>
        <nav
          id="site-navigation"
          className={menuOpen ? "site-nav is-open" : "site-nav"}
          aria-label="Primary navigation"
        >
          {nav.map(([to, label]) => (
            <NavLink key={to} to={to} end={to === "/"}>
              {label}
            </NavLink>
          ))}
          <Link className="button button-small" to="/contact">
            Contact Us
          </Link>
        </nav>
      </header>
      <main>{children}</main>
      <footer className="site-footer">
        <div className="footer-brand">
          <img src="/images/PCFS LOGO.png" alt="" />
          <div>
            <strong>{data.settings.name}</strong>
            <p>Building effective people for Kingdom assignment.</p>
          </div>
        </div>
        <div>
          <h2>Quick links</h2>
          <Link to="/about">About Us</Link>
          <Link to="/branches">Branches</Link>
          <Link to="/media">Media</Link>
          <Link to="/events">Events</Link>
        </div>
        <div>
          <h2>Connect</h2>
          <Link to="/contact">Contact Us</Link>
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Website Terms</Link>
        </div>
        <p className="copyright">
          © 2026 Paradise City of Faith Sanctuary. Official assets and contact details pending final handover.
        </p>
      </footer>
    </div>
  );
}
