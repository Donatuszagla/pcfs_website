import {
  BookOpenText,
  CalendarDots,
  CaretLeft,
  CaretRight,
  Church,
  Flame,
  HouseLine,
  List,
  MagnifyingGlass,
  MapPin,
  Megaphone,
  Play,
  UsersThree,
  X,
} from "@phosphor-icons/react";
import { type FormEvent, type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink, Route, Routes, useLocation, useParams } from "react-router-dom";
import type { Branch, Event, MediaItem, SiteData } from "./types";

const pillars = [
  { title: "Holy Spirit", description: "Our prominent member and source of power for ministry.", Icon: Flame },
  { title: "Word Based", description: "A Bible-believing and teaching ministry.", Icon: BookOpenText },
  { title: "Leadership", description: "Identifying, training, building and growing ministry-minded leaders.", Icon: UsersThree },
  { title: "Soul Winning", description: "A mission-conscious church committed to reaching people for Christ.", Icon: Megaphone },
  { title: "Family", description: "A family related by the blood of Jesus Christ.", Icon: HouseLine },
];

export interface AppProps {
  data: SiteData;
}

export function App({ data }: AppProps) {
  return (
    <SiteShell data={data}>
      <Routes>
        <Route path="/" element={<HomePage data={data} />} />
        <Route path="/about" element={<AboutPage data={data} />} />
        <Route path="/branches" element={<BranchesPage branches={data.branches} />} />
        <Route path="/branches/:slug" element={<BranchDetailPage branches={data.branches} />} />
        <Route path="/media" element={<MediaPage media={data.media} />} />
        <Route path="/media/:slug" element={<MediaDetailPage media={data.media} />} />
        <Route path="/events" element={<EventsPage events={data.events} />} />
        <Route path="/events/:slug" element={<EventDetailPage events={data.events} />} />
        <Route path="/contact" element={<ContactPage data={data} />} />
        <Route path="/privacy" element={<PolicyPage kind="privacy" />} />
        <Route path="/terms" element={<PolicyPage kind="terms" />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </SiteShell>
  );
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

function SiteShell({ data, children }: { data: SiteData; children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  useScrollReveal();

  useEffect(() => { setMenuOpen(false); window.scrollTo?.({ top: 0, behavior: "auto" }); }, [location.pathname]);
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useClientMetadata(location.pathname, data);
  const nav = [
    ["/", "Home"], ["/about", "About Us"], ["/branches", "Branches"], ["/media", "Media"], ["/events", "Events"],
  ];
  return (
    <div className="site-shell">
      <header className={scrolled ? "site-header scrolled" : "site-header"}>
        <Link className="brand" to="/" aria-label="Paradise City of Faith Sanctuary home">
          <img src="/images/PCFS LOGO.png" alt="PCFS logo" />
          <span>{data.settings.name}</span>
        </Link>
        <button className="menu-toggle" type="button" aria-expanded={menuOpen} aria-controls="site-navigation" onClick={() => setMenuOpen((value) => !value)}>
          {menuOpen ? <X aria-hidden /> : <List aria-hidden />}<span className="sr-only">Toggle navigation</span>
        </button>
        <nav id="site-navigation" className={menuOpen ? "site-nav is-open" : "site-nav"} aria-label="Primary navigation">
          {nav.map(([to, label]) => <NavLink key={to} to={to} end={to === "/"}>{label}</NavLink>)}
          <Link className="button button-small" to="/contact">Contact Us</Link>
        </nav>
      </header>
      <main>{children}</main>
      <footer className="site-footer">
        <div className="footer-brand"><img src="/images/PCFS LOGO.png" alt="" /><div><strong>{data.settings.name}</strong><p>Building effective people for Kingdom assignment.</p></div></div>
        <div><h2>Quick links</h2><Link to="/about">About Us</Link><Link to="/branches">Branches</Link><Link to="/media">Media</Link><Link to="/events">Events</Link></div>
        <div><h2>Connect</h2><Link to="/contact">Contact Us</Link><Link to="/privacy">Privacy Policy</Link><Link to="/terms">Website Terms</Link></div>
        <p className="copyright">© 2026 Paradise City of Faith Sanctuary. Official assets and contact details pending final handover.</p>
      </footer>
    </div>
  );
}

function useClientMetadata(pathname: string, data: SiteData): void {
  useEffect(() => {
    const branch = data.branches.find((item) => pathname === `/branches/${item.slug}`);
    const event = data.events.find((item) => pathname === `/events/${item.slug}`);
    const media = data.media.find((item) => pathname === `/media/${item.slug}`);
    const routeTitles: Record<string, string> = { "/": `${data.settings.name} | Official Website`, "/about": `About Us | ${data.settings.shortName}`, "/branches": `Branches | ${data.settings.shortName}`, "/media": `Media | ${data.settings.shortName}`, "/events": `Events | ${data.settings.shortName}`, "/contact": `Contact Us | ${data.settings.shortName}`, "/privacy": `Privacy Policy | ${data.settings.shortName}`, "/terms": `Website Terms | ${data.settings.shortName}` };
    const title = branch?.name ?? event?.title ?? media?.title ?? routeTitles[pathname] ?? `Page Not Found | ${data.settings.shortName}`;
    const description = branch?.description ?? event?.description ?? media?.description ?? data.settings.description;
    document.title = title;
    updateMeta("name", "description", description);
    updateMeta("property", "og:title", title);
    updateMeta("property", "og:description", description);
    let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement("link"); canonical.rel = "canonical"; document.head.appendChild(canonical); }
    canonical.href = `${window.location.origin}${pathname === "/" ? "" : pathname}`;
    document.getElementById("pcfs-route-schema")?.remove();
    const schema = document.createElement("script");
    schema.id = "pcfs-route-schema"; schema.type = "application/ld+json";
    schema.text = JSON.stringify(event ? { "@context": "https://schema.org", "@type": "Event", name: event.title, description: event.description, startDate: event.startAt, endDate: event.endAt, location: { "@type": "Place", name: event.venue } } : { "@context": "https://schema.org", "@type": "Church", name: data.settings.name, description: data.settings.description });
    document.head.appendChild(schema);
  }, [data, pathname]);
}

function updateMeta(attribute: "name" | "property", key: string, content: string): void {
  let element = document.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
  if (!element) { element = document.createElement("meta"); element.setAttribute(attribute, key); document.head.appendChild(element); }
  element.content = content;
}

function HeroSlider({ data }: { data: SiteData }) {
  const backgroundImages = useMemo(() => [
    "/images/0.jpg",
    "/images/1.jpg",
    "/images/2.jpg",
    "/images/3.jpg",
    "/images/4.jpg",
    "/images/5.jpg",
    "/images/6.jpg",
    "/images/7.jpg",
    "/images/8.jpg",
    "/images/9.jpg",
  ], []);

  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % backgroundImages.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [backgroundImages.length]);

  return (
    <section className="hero-slider" aria-label="Welcome Hero Slideshow">
      {backgroundImages.map((image, index) => (
        <div key={image} className={index === current ? "hero-slide active" : "hero-slide"}>
          <div className="hero-bg" style={{ backgroundImage: `url('${image}')` }} />
          <div className="hero-overlay" />
        </div>
      ))}
      <div className="hero-content page-rail">
        <h1>Welcome to<br />Paradise City of<br />Faith Sanctuary</h1>
        <p className="hero-subtitle">{data.settings.description}</p>
        <div className="button-row">
          <Link className="button" to="/contact">Plan a Visit</Link>
          <Link className="button button-outline" to="/about">Explore PCFS</Link>
        </div>
      </div>
    </section>
  );
}

function HomePage({ data }: { data: SiteData }) {
  const featuredEvent = data.events.find((event) => event.featured) ?? data.events[0];
  const featuredMedia = data.media.find((item) => item.featured) ?? data.media[0];
  const featuredBranch = data.branches[0];
  return (
    <>
      <HeroSlider data={data} />
      {featuredEvent && <section className="event-ribbon page-rail reveal" aria-labelledby="featured-event-title"><div className="event-badge">RFMC<br />2026</div><div><span>Upcoming event</span><h2 id="featured-event-title">{featuredEvent.theme}</h2><strong>18–20 September 2026</strong></div><img src={featuredEvent.image} alt="Temporary event photography of a congregation worshipping" /></section>}
      <section className="mandate-grid page-rail section-space reveal">
        <div><p className="eyebrow">Our mandate</p><h2>Raising people for Kingdom assignment</h2><p>{data.settings.description}</p></div>
        <div><p className="eyebrow">Our vision</p><h2>Go and raise me a people</h2><p>{data.settings.vision}</p></div>
      </section>
      <section className="pillars section-space reveal" aria-labelledby="pillars-title">
        <div className="page-rail"><h2 id="pillars-title">The Five Pillars of Our Ministry</h2><div className="pillar-list">{pillars.map(({ title, description, Icon }) => <article key={title}><span className="pillar-icon"><Icon size={38} weight="regular" aria-hidden /></span><h3>{title}</h3><p>{description}</p></article>)}</div></div>
      </section>
      <section className="preview-grid page-rail section-space reveal">
        <article><h2>Meet Our Spiritual Heads</h2><div className="leader-preview">{data.leaders.slice(0, 2).map((leader) => <div key={leader.id}><span><img src={leader.portrait ?? leader.image ?? "/images/logo-placeholder.png"} alt={leader.name} /></span><p><strong>{leader.name}</strong><small>{leader.title}</small></p></div>)}</div><Link className="button button-compact" to="/about#leadership">Learn More</Link></article>
        {featuredMedia && <article><h2>Latest Teaching</h2><Link className="image-card" to={`/media/${featuredMedia.slug}`}><img src={featuredMedia.image} alt="Open Bible on a church lectern" /><span className="play-icon"><Play weight="fill" aria-hidden /></span></Link><p>Watch, listen and grow with sound doctrine that transforms lives and builds destiny.</p><Link className="button button-compact" to="/media">Explore Teachings</Link></article>}
        {featuredBranch && <article><h2>Our Branches</h2><Link className="image-card" to={`/branches/${featuredBranch.slug}`}><img src={featuredBranch.image} alt="Temporary branch building photography" /><span className="temporary-label">Temporary image</span></Link><p>Find a Paradise City of Faith Sanctuary branch near you and connect with a thriving community.</p><Link className="button button-compact" to="/branches">Find a Branch</Link></article>}
      </section>
      <section className="invitation reveal"><div className="page-rail"><h2>You’re Invited</h2><p>Whether you are exploring faith or looking for a church home, you are welcome here.</p><div className="button-row centered"><Link className="button" to="/contact">Plan a Visit</Link><Link className="button button-outline" to="/about">Explore PCFS</Link></div></div></section>
    </>
  );
}

function AboutPage({ data }: { data: SiteData }) {
  return (
    <PageLayout eyebrow="About PCFS" title="Building effective people for Kingdom assignment" intro={data.settings.description}>
      <section className="statement-grid"><article><span>Vision</span><h2>{data.settings.vision}</h2></article><article><span>Mission</span><h2>{data.settings.mission}</h2></article></section>
      <section className="content-section"><p className="eyebrow">What grounds us</p><h2>Our pillars</h2><div className="compact-grid">{pillars.map(({ title, description, Icon }) => <article key={title}><Icon size={32} aria-hidden /><h3>{title}</h3><p>{description}</p></article>)}</div></section>
      <section id="leadership" className="content-section"><p className="eyebrow">Leadership</p><h2>Our spiritual heads</h2><div className="leader-grid">{data.leaders.map((leader) => <article key={leader.id}><span className="portrait-placeholder">{(leader.image || leader.portrait) ? <img src={leader.image ?? leader.portrait} alt={leader.name} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "inherit" }} /> : <UsersThree size={64} aria-hidden />}</span><h3>{leader.name}</h3><strong>{leader.title}</strong><p>{leader.bio}</p></article>)}</div></section>
      <section className="content-section"><p className="eyebrow">Growing generations</p><h2>Ministries</h2><div className="compact-grid">{data.ministries.map((ministry) => <article key={ministry.id}><h3>{ministry.name}</h3><strong>{ministry.audience}</strong><p>{ministry.description}</p></article>)}</div></section>
    </PageLayout>
  );
}

function BranchesPage({ branches }: { branches: Branch[] }) {
  const [region, setRegion] = useState("All");
  const regions = ["All", ...new Set(branches.map((branch) => branch.region))];
  const visible = region === "All" ? branches : branches.filter((branch) => branch.region === region);
  return (
    <PageLayout eyebrow="Find your place" title="PCFS branches" intro="Explore active branches and connect with the Paradise City of Faith Sanctuary family near you.">
      <div className="filter-bar"><label htmlFor="region">Region</label><select id="region" value={region} onChange={(event) => setRegion(event.target.value)}>{regions.map((value) => <option key={value}>{value}</option>)}</select></div>
      <div className="cards-grid">{visible.map((branch) => <article className="content-card" key={branch.id}><img src={branch.image} alt="Temporary branch building photography" /><div><span>{branch.region}</span><h2>{branch.name}</h2><p><MapPin aria-hidden />{branch.city} · {branch.location}</p><Link to={`/branches/${branch.slug}`}>View branch</Link></div></article>)}</div>
    </PageLayout>
  );
}

function BranchDetailPage({ branches }: { branches: Branch[] }) {
  const { slug } = useParams();
  const branch = branches.find((item) => item.slug === slug);
  if (!branch) return <NotFoundPage />;
  return <PageLayout eyebrow={branch.region} title={branch.name} intro={branch.description}><div className="detail-grid"><img src={branch.image} alt="Temporary branch building photography" /><div><h2>Visit this branch</h2><p><MapPin aria-hidden />{branch.location}</p><p>{branch.serviceTimes ?? "Service times pending confirmation."}</p>{branch.directionsUrl ? <a className="button" href={branch.directionsUrl}>Get directions</a> : <Link className="button" to="/contact">Ask for directions</Link>}</div></div></PageLayout>;
}

function MediaPage({ media }: { media: MediaItem[] }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const categories = ["All", ...new Set(media.map((item) => item.category))];
  const visible = useMemo(() => media.filter((item) => (category === "All" || item.category === category) && `${item.title} ${item.speaker}`.toLowerCase().includes(search.toLowerCase())), [category, media, search]);
  return (
    <PageLayout eyebrow="Teachings and resources" title="Paradise City Media Hub" intro="Search sermons, teachings, videos and audio shared by PCFS.">
      <div className="search-bar"><MagnifyingGlass aria-hidden /><label className="sr-only" htmlFor="media-search">Search media</label><input id="media-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by title or speaker" /><label className="sr-only" htmlFor="media-category">Category</label><select id="media-category" value={category} onChange={(event) => setCategory(event.target.value)}>{categories.map((value) => <option key={value}>{value}</option>)}</select></div>
      {visible.length ? <div className="cards-grid">{visible.map((item) => <article className="content-card" key={item.id}><img src={item.image} alt="Open Bible on a church lectern" /><div><span>{item.category} · {item.type}</span><h2>{item.title}</h2><p>{item.speaker}</p><Link to={`/media/${item.slug}`}>Open media</Link></div></article>)}</div> : <EmptyState title="No media found" body="Try another title, speaker or category." />}
    </PageLayout>
  );
}

function MediaDetailPage({ media }: { media: MediaItem[] }) {
  const { slug } = useParams();
  const item = media.find((entry) => entry.slug === slug);
  if (!item) return <NotFoundPage />;
  return <PageLayout eyebrow={`${item.category} · ${item.type}`} title={item.title} intro={item.description}><div className="detail-grid"><img src={item.image} alt="Open Bible on a church lectern" /><div><h2>{item.speaker}</h2><p>{formatDate(item.publishedAt)}</p>{item.externalUrl ? <a className="button" href={item.externalUrl} rel="noreferrer">Open media</a> : <p className="notice">Official media link pending upload.</p>}</div></div></PageLayout>;
}

function EventsPage({ events }: { events: Event[] }) {
  const now = new Date("2026-08-30T00:00:00+00:00");
  const upcoming = events.filter((event) => new Date(event.endAt) >= now);
  const past = events.filter((event) => new Date(event.endAt) < now);
  return <PageLayout eyebrow="Gather with us" title="PCFS events" intro="Discover upcoming programmes and revisit past events.">{upcoming.length ? <><h2>Upcoming events</h2><div className="cards-grid">{upcoming.map((event) => <EventCard key={event.id} event={event} />)}</div></> : <EmptyState title="No upcoming events" body="New programmes will appear here as soon as they are published." />}{past.length > 0 && <><h2 className="subsection-heading">Past events</h2><div className="cards-grid">{past.map((event) => <EventCard key={event.id} event={event} />)}</div></>}</PageLayout>;
}

function EventCard({ event }: { event: Event }) {
  return <article className="content-card"><img src={event.image} alt="Temporary event worship photography" /><div><span>{formatDateRange(event.startAt, event.endAt)}</span><h2>{event.title}: {event.theme}</h2><p><MapPin aria-hidden />{event.venue}</p><Link to={`/events/${event.slug}`}>View event</Link></div></article>;
}

function EventDetailPage({ events }: { events: Event[] }) {
  const { slug } = useParams();
  const event = events.find((item) => item.slug === slug);
  if (!event) return <NotFoundPage />;
  return <PageLayout eyebrow={event.title} title={event.theme} intro={event.description}><div className="detail-grid"><img src={event.image} alt="Temporary event worship photography" /><div><p><CalendarDots aria-hidden />{formatDateRange(event.startAt, event.endAt)}</p><p><MapPin aria-hidden />{event.venue}</p><h2>Speakers</h2><ul>{event.speakers.map((speaker) => <li key={speaker}>{speaker}</li>)}</ul>{event.registrationUrl ? <a className="button" href={event.registrationUrl}>Register</a> : <Link className="button" to="/contact">Ask about this event</Link>}</div></div></PageLayout>;
}

function ContactPage({ data }: { data: SiteData }) {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [captchaToken, setCaptchaToken] = useState(import.meta.env.DEV ? "dev-bypass" : "");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setStatus("sending");
    const form = new FormData(event.currentTarget);
    const input = Object.fromEntries(form.entries());
    try {
      const response = await fetch(import.meta.env.VITE_API_URL ?? "http://localhost:4000/graphql", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ query: `mutation SubmitContact($data: ContactInput!) { submitContact(data: $data) { accepted reference } }`, variables: { data: { ...input, captchaToken } } }) });
      const payload = await response.json() as { data?: { submitContact?: { accepted: boolean } }; errors?: unknown[] };
      if (!response.ok || !payload.data?.submitContact?.accepted) throw new Error("Submission failed");
      event.currentTarget.reset(); setStatus("success");
    } catch { setStatus("error"); }
  }
  return (
    <PageLayout eyebrow="We’d love to hear from you" title="Contact PCFS" intro="Ask a question, plan a visit or request information from the church communications team.">
      <div className="contact-grid"><form className="contact-form" onSubmit={submit}><label>Name<input name="name" required autoComplete="name" /></label><label>Email<input name="email" type="email" autoComplete="email" /></label><label>Phone<input name="phone" type="tel" autoComplete="tel" /></label><label>Subject<select name="subject" defaultValue="Plan a visit"><option>Plan a visit</option><option>General enquiry</option><option>Events</option><option>Media</option></select></label><label>Message<textarea name="message" required rows={6} /></label><TurnstileField onToken={setCaptchaToken} /><button className="button" disabled={status === "sending" || !captchaToken}>{status === "sending" ? "Sending…" : "Send enquiry"}</button>{status === "success" && <p role="status" className="form-success">Thank you. Your enquiry has been received.</p>}{status === "error" && <p role="alert" className="form-error">We could not send your enquiry. Please try again.</p>}</form><aside><h2>Visit and connect</h2><p>Official phone numbers, email addresses and service times are pending final approval.</p><p><MapPin aria-hidden />Headquarters: Accra, Sapeiman-Zinga near Free Ridge School</p><p><MapPin aria-hidden />Western Regional Branch: Takoradi, Mpintsin New Site</p>{data.settings.contactEmail && <a href={`mailto:${data.settings.contactEmail}`}>{data.settings.contactEmail}</a>}<div className="notice">Contact submissions are used only to respond to your enquiry and are not displayed publicly.</div></aside></div>
    </PageLayout>
  );
}

function TurnstileField({ onToken }: { onToken: (token: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const sitekey = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined;
    if (!sitekey || !ref.current) return;
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.onload = () => { if (window.turnstile && ref.current) window.turnstile.render(ref.current, { sitekey, callback: onToken }); };
    document.head.appendChild(script);
    return () => { script.remove(); };
  }, [onToken]);
  return <div ref={ref} className="captcha-field" aria-label="Spam protection" />;
}

function PolicyPage({ kind }: { kind: "privacy" | "terms" }) {
  const privacy = kind === "privacy";
  return <PageLayout eyebrow="Website information" title={privacy ? "Privacy Policy" : "Website Terms"} intro={privacy ? "How PCFS handles information submitted through this website." : "The terms governing use of this website."}><article className="prose"><h2>{privacy ? "Information we collect" : "Use of this website"}</h2><p>{privacy ? "The contact form collects the details you choose to provide so authorised church administrators can respond to your enquiry. Submissions are not published." : "Content is provided for church information and connection. Event, branch and contact details should be confirmed before travel or attendance."}</p><h2>Media and accuracy</h2><p>Temporary photography and pending content are explicitly marked. Official assets and final legal wording must be approved before production launch.</p><h2>Contact</h2><p>Official privacy and governance contact details will be inserted before launch.</p></article></PageLayout>;
}

function NotFoundPage() {
  return <section className="not-found page-rail"><span>404</span><h1>We couldn’t find that page.</h1><p>The page may have moved or may not yet be published.</p><Link className="button" to="/">Return home</Link></section>;
}

function PageLayout({ eyebrow, title, intro, children }: { eyebrow: string; title: string; intro: string; children: ReactNode }) {
  return <><header className="page-hero"><div className="page-rail"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p>{intro}</p></div></header><div className="page-rail page-content">{children}</div></>;
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return <div className="empty-state"><Church size={44} aria-hidden /><h2>{title}</h2><p>{body}</p></div>;
}

function formatDate(value: string) { return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Africa/Accra" }).format(new Date(value)); }
function formatDateRange(startAt: string, endAt: string) { return `${formatDate(startAt)} – ${formatDate(endAt)}`; }
