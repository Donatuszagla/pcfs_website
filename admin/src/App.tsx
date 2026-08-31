import { Archive, Article, Buildings, CalendarDots, CaretRight, Church, EnvelopeSimple, ImageSquare, List, SignOut, Sparkle, SpinnerGap, UsersThree, X } from "@phosphor-icons/react";
import { useEffect, useState, type FormEvent } from "react";
import { Link, Navigate, NavLink, Route, Routes, useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "./auth";
import { graphqlRequest, operations, type ContentKind, type ContentRecord } from "./graphql";

const contentSections: { kind: ContentKind; label: string; icon: typeof Article }[] = [
  { kind: "PAGE", label: "Pages", icon: Article }, { kind: "EVENT", label: "Events", icon: CalendarDots }, { kind: "MEDIA", label: "Media", icon: ImageSquare }, { kind: "BRANCH", label: "Branches", icon: Buildings }, { kind: "LEADER", label: "Leaders", icon: UsersThree }, { kind: "MINISTRY", label: "Ministries", icon: Sparkle }, { kind: "SUBMISSION", label: "Enquiries", icon: EnvelopeSimple },
];

export function App() {
  const auth = useAuth();
  if (auth.loading) return <FullScreenStatus label="Restoring secure session…" />;
  if (!auth.actor) return <Routes><Route path="*" element={<Login />} /></Routes>;
  return <AdminShell><Routes><Route path="/" element={<Dashboard />} /><Route path="/content/:kind" element={<ContentList />} /><Route path="/content/:kind/:id" element={<ContentEditor />} /><Route path="*" element={<Navigate to="/" replace />} /></Routes></AdminShell>;
}

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    const form = new FormData(event.currentTarget);
    try { await login(String(form.get("email")), String(form.get("password"))); navigate("/"); } catch (caught) { setError(caught instanceof Error ? caught.message : "Login failed"); } finally { setBusy(false); }
  }
  return <main className="login-page"><section className="login-brand"><img src="/logo-placeholder.png" alt="Temporary PCFS logo" /><p>Paradise City of Faith Sanctuary</p><h1>Manage the ministry’s digital home.</h1><p>Publish messages, events, branches and church updates from one secure place.</p></section><section className="login-panel"><form className="login-card" onSubmit={submit}><span className="eyebrow">PCFS ADMINISTRATION</span><h2>Welcome back</h2><p>Use your authorised administrator account.</p>{error && <div className="alert error" role="alert">{error}</div>}<label>Email<input name="email" type="email" autoComplete="username" required /></label><label>Password<input name="password" type="password" autoComplete="current-password" minLength={12} required /></label><button className="button primary" disabled={busy}>{busy ? <><SpinnerGap className="spin" /> Signing in…</> : "Sign in securely"}</button><small>Accounts are created by a Super Administrator. Password recovery is managed internally.</small></form></section></main>;
}

function AdminShell({ children }: { children: React.ReactNode }) {
  const { actor, logout } = useAuth();
  const location = useLocation();
  const [drawer, setDrawer] = useState(false);
  useEffect(() => setDrawer(false), [location.pathname]);
  return <div className="admin-layout"><aside className={drawer ? "sidebar open" : "sidebar"}><div className="sidebar-brand"><Church weight="fill" /><span><strong>PCFS</strong><small>Administration</small></span><button className="icon-button mobile-close" onClick={() => setDrawer(false)} aria-label="Close navigation"><X /></button></div><nav><NavLink to="/" end><Sparkle />Overview</NavLink>{contentSections.map(({ kind, label, icon: Icon }) => <NavLink key={kind} to={`/content/${kind.toLowerCase()}`}><Icon />{label}</NavLink>)}</nav><div className="sidebar-user"><span>{actor?.email}</span><small>{actor?.role.replaceAll("_", " ")}</small><button onClick={() => void logout()}><SignOut />Sign out</button></div></aside><div className="admin-main"><header className="topbar"><button className="icon-button menu-button" onClick={() => setDrawer(true)} aria-label="Open navigation"><List /></button><div><span className="eyebrow">CONTENT MANAGEMENT</span><strong>Paradise City of Faith Sanctuary</strong></div><a href="http://localhost:4173" target="_blank" rel="noreferrer" className="button secondary">View website</a></header><main className="admin-content">{children}</main></div>{drawer && <button className="drawer-scrim" onClick={() => setDrawer(false)} aria-label="Close navigation" />}</div>;
}

function Dashboard() {
  const cards = [{ label: "Pages", value: "12", detail: "Core public routes", icon: Article, href: "/content/page" }, { label: "Upcoming events", value: "1", detail: "RFMC 2026 featured", icon: CalendarDots, href: "/content/event" }, { label: "Branches", value: "5", detail: "Across two regions", icon: Buildings, href: "/content/branch" }, { label: "Enquiries", value: "—", detail: "Open the live inbox", icon: EnvelopeSimple, href: "/content/submission" }];
  return <><PageTitle eyebrow="OVERVIEW" title="Good to see you." description="Review the church’s public content and move drafts through to publication." /><div className="stat-grid">{cards.map(({ icon: Icon, ...card }) => <Link to={card.href} className="stat-card" key={card.label}><span className="stat-icon"><Icon weight="duotone" /></span><strong>{card.value}</strong><span>{card.label}</span><small>{card.detail}</small><CaretRight /></Link>)}</div><section className="panel"><div className="panel-heading"><div><span className="eyebrow">PUBLISHING CHECKLIST</span><h2>Before the site goes live</h2></div></div><div className="checklist"><p><span>1</span>Replace all temporary church and branch photography.</p><p><span>2</span>Confirm service times, telephone numbers and social links.</p><p><span>3</span>Approve official leader biographies and portraits.</p><p><span>4</span>Review the temporary privacy and terms copy with counsel.</p></div></section></>;
}

function ContentList() {
  const { kind: rawKind = "page" } = useParams();
  const kind = rawKind.toUpperCase() as ContentKind;
  const section = contentSections.find((item) => item.kind === kind);
  const { accessToken } = useAuth();
  const [records, setRecords] = useState<ContentRecord[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState("");
  useEffect(() => {
    setStatus("loading");
    graphqlRequest<{ adminRecords: ContentRecord[] }>(operations.records, { data: { kind, search: search || undefined, limit: 100 } }, accessToken).then(({ adminRecords }) => { setRecords(adminRecords); setStatus("ready"); }).catch((caught) => { setError(caught instanceof Error ? caught.message : "Could not load content"); setStatus("error"); });
  }, [accessToken, kind, search]);
  const editable = !["SUBMISSION", "USER"].includes(kind);
  return <><PageTitle eyebrow="CONTENT" title={section?.label ?? kind} description={`Manage ${section?.label.toLowerCase() ?? "records"}, publishing state and public visibility.`} action={editable ? <Link className="button primary" to={`/content/${rawKind}/new`}>Create new</Link> : undefined} /><div className="toolbar"><label className="search-field"><span className="sr-only">Search</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={`Search ${section?.label.toLowerCase() ?? "content"}…`} /></label></div>{status === "loading" && <InlineStatus label="Loading content…" />}{status === "error" && <div className="alert error" role="alert">{error}</div>}{status === "ready" && records.length === 0 && <EmptyState kind={section?.label ?? kind} editable={editable} href={`/content/${rawKind}/new`} />}{status === "ready" && records.length > 0 && <div className="record-list">{records.map((record) => <Link to={`/content/${rawKind}/${record.id}`} className="record-row" key={record.id}><div><strong>{recordLabel(record)}</strong><small>{recordSecondary(record)}</small></div><span className={`status-badge ${record.status?.toLowerCase()}`}>{record.status ?? "RECEIVED"}</span><time>{formatDate(record.updatedAt ?? record.createdAt)}</time><CaretRight /></Link>)}</div>}</>;
}

function ContentEditor() {
  const { kind: rawKind = "page", id = "new" } = useParams();
  const kind = rawKind.toUpperCase() as ContentKind;
  const { accessToken } = useAuth();
  const navigate = useNavigate();
  const [record, setRecord] = useState<ContentRecord>();
  const [json, setJson] = useState("{}\n");
  const [status, setStatus] = useState<"loading" | "ready" | "saving" | "error">(id === "new" ? "ready" : "loading");
  const [message, setMessage] = useState("");
  useEffect(() => {
    if (id === "new") return;
    graphqlRequest<{ adminRecords: ContentRecord[] }>(operations.records, { data: { kind, limit: 100 } }, accessToken).then(({ adminRecords }) => { const found = adminRecords.find((item) => item.id === id); if (!found) throw new Error("Record not found"); setRecord(found); setJson(`${JSON.stringify(found.values, null, 2)}\n`); setStatus("ready"); }).catch((caught) => { setMessage(caught instanceof Error ? caught.message : "Could not load record"); setStatus("error"); });
  }, [accessToken, id, kind]);
  async function save() { setStatus("saving"); setMessage(""); try { const values = JSON.parse(json) as Record<string, unknown>; const { saveContent } = await graphqlRequest<{ saveContent: ContentRecord }>(operations.save, { data: { kind, id: id === "new" ? undefined : id, values } }, accessToken); setRecord(saveContent); setJson(`${JSON.stringify(saveContent.values, null, 2)}\n`); setStatus("ready"); setMessage("Changes saved as a draft."); if (id === "new") navigate(`/content/${rawKind}/${saveContent.id}`, { replace: true }); } catch (caught) { setStatus("error"); setMessage(caught instanceof Error ? caught.message : "Could not save changes"); } }
  async function transition(operation: string, verb: string) { if (!record) return; setStatus("saving"); try { const result = await graphqlRequest<Record<string, ContentRecord>>(operation, { data: { kind, id: record.id } }, accessToken); const updated = Object.values(result)[0]; setRecord(updated); setMessage(`${verb} successfully.`); setStatus("ready"); } catch (caught) { setMessage(caught instanceof Error ? caught.message : `Could not ${verb.toLowerCase()}`); setStatus("error"); } }
  if (kind === "SUBMISSION") return <SubmissionDetail record={record} status={status} message={message} accessToken={accessToken} />;
  return <><PageTitle eyebrow={id === "new" ? "NEW RECORD" : "EDIT RECORD"} title={id === "new" ? `Create ${rawKind}` : recordLabel(record)} description="Structured JSON is used here to preserve the typed section model. A field-specific editor can be added without changing the API contract." action={<button className="button primary" onClick={() => void save()} disabled={status === "saving"}>{status === "saving" ? "Saving…" : "Save draft"}</button>} />{message && <div className={status === "error" ? "alert error" : "alert success"} role="status">{message}</div>}<section className="panel editor-panel"><label>Record data<textarea className="json-editor" value={json} onChange={(event) => setJson(event.target.value)} spellCheck={false} aria-describedby="json-help" /></label><small id="json-help">Fields are validated by the backend model. Slugs must be unique.</small><div className="editor-actions"><button className="button secondary" onClick={() => void transition(operations.publish, "Published")} disabled={!record || status === "saving"}>Publish</button><button className="button danger" onClick={() => void transition(operations.archive, "Archived")} disabled={!record || status === "saving"}><Archive />Archive</button></div></section></>;
}

function SubmissionDetail({ record, status, message, accessToken }: { record?: ContentRecord; status: string; message: string; accessToken?: string }) {
  const [result, setResult] = useState(message);
  if (status === "loading") return <InlineStatus label="Loading enquiry…" />;
  if (!record) return <div className="alert error">{message || "Enquiry not found"}</div>;
  const values = record.values;
  return <><PageTitle eyebrow="ENQUIRY" title={String(values.subject ?? "Website enquiry")} description={`Reference ${String(values.reference ?? record.id)}`} action={values.notificationStatus === "FAILED" ? <button className="button primary" onClick={async () => { await graphqlRequest(operations.retryContact, { data: { id: record.id } }, accessToken); setResult("Email delivery retried."); }}>Retry email</button> : undefined} />{result && <div className="alert success">{result}</div>}<section className="panel enquiry"><dl><dt>From</dt><dd>{String(values.name ?? "—")}</dd><dt>Email</dt><dd>{String(values.email ?? "—")}</dd><dt>Phone</dt><dd>{String(values.phone ?? "—")}</dd><dt>Notification</dt><dd>{String(values.notificationStatus ?? "—")}</dd></dl><h2>Message</h2><p>{String(values.message ?? "")}</p></section></>;
}

function PageTitle({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: React.ReactNode }) { return <header className="page-title"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div>{action}</header>; }
function FullScreenStatus({ label }: { label: string }) { return <main className="full-status"><SpinnerGap className="spin" /><p>{label}</p></main>; }
function InlineStatus({ label }: { label: string }) { return <div className="inline-status" role="status"><SpinnerGap className="spin" />{label}</div>; }
function EmptyState({ kind, editable, href }: { kind: string; editable: boolean; href: string }) { return <section className="empty-state"><Sparkle weight="duotone" /><h2>No {kind.toLowerCase()} found</h2><p>{editable ? "Create the first record or adjust your search." : "New submissions will appear here automatically."}</p>{editable && <Link className="button primary" to={href}>Create new</Link>}</section>; }
function recordLabel(record?: ContentRecord): string { if (!record) return "Loading…"; const values = record.values; return String(values.title ?? values.name ?? values.reference ?? values.email ?? "Untitled record"); }
function recordSecondary(record: ContentRecord): string { return String(record.values.slug ?? record.values.region ?? record.values.notificationStatus ?? record.kind.replaceAll("_", " ")); }
function formatDate(value?: string): string { return value ? new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value)) : "—"; }
