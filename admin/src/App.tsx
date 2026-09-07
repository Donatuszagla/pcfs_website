import { Archive, Article, Buildings, CalendarDots, CaretRight, Church, CloudArrowUp, EnvelopeSimple, ImageSquare, List, SignOut, Sparkle, SpinnerGap, UsersThree, X } from "@phosphor-icons/react";
import { useEffect, useRef, useState, type FormEvent } from "react";
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
  return <main className="login-page"><section className="login-brand"><img src="/logo-placeholder.png" alt="Paradise City of Faith Sanctuary Logo" /><p>Paradise City of Faith Sanctuary</p><h1>Manage the ministry’s digital home.</h1><p>Publish messages, events, branches and church updates from one secure place.</p></section><section className="login-panel"><form className="login-card" onSubmit={submit}><span className="eyebrow">PCFS ADMINISTRATION</span><h2>Welcome back</h2><p>Use your authorised administrator account.</p>{error && <div className="alert error" role="alert">{error}</div>}<label>Email<input name="email" type="email" autoComplete="username" required /></label><label>Password<input name="password" type="password" autoComplete="current-password" minLength={12} required /></label><button className="button primary" disabled={busy}>{busy ? <><SpinnerGap className="spin" /> Signing in…</> : "Sign in securely"}</button><small>Accounts are created by a Super Administrator. Password recovery is managed internally.</small></form></section></main>;
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
  return <><PageTitle eyebrow="OVERVIEW" title="Good to see you." description="Review the church’s public content and move drafts through to publication." /><div className="stat-grid">{cards.map(({ icon: Icon, ...card }) => <Link to={card.href} className="stat-card" key={card.label}><span className="stat-icon"><Icon weight="duotone" /></span><strong>{card.value}</strong><span>{card.label}</span><small>{card.detail}</small><CaretRight /></Link>)}</div><section className="panel"><div className="panel-heading"><div><span className="eyebrow">OPERATIONAL CHECKLIST</span><h2>CMS Management Overview</h2></div></div><div className="checklist"><p><span>1</span>Upload sermon audio broadcasts & event photos via Cloudflare R2 file manager.</p><p><span>2</span>Monitor website enquiry inbox and contact form submissions.</p><p><span>3</span>Maintain branch service schedules, regional events, and leader profiles.</p><p><span>4</span>Review published media teachings and upcoming ministry broadcasts.</p></div></section></>;
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
  const [activeModalRecord, setActiveModalRecord] = useState<ContentRecord | "new" | null>(null);

  const fetchRecords = () => {
    setStatus("loading");
    graphqlRequest<{ adminRecords: ContentRecord[] }>(operations.records, { data: { kind, search: search || undefined, limit: 100 } }, accessToken)
      .then(({ adminRecords }) => { setRecords(adminRecords); setStatus("ready"); })
      .catch((caught) => { setError(caught instanceof Error ? caught.message : "Could not load content"); setStatus("error"); });
  };

  useEffect(() => {
    fetchRecords();
  }, [accessToken, kind, search]);

  const editable = !["SUBMISSION", "USER"].includes(kind);

  return (
    <>
      <PageTitle
        eyebrow="CONTENT"
        title={section?.label ?? kind}
        description={`Manage ${section?.label.toLowerCase() ?? "records"}, publishing state and public visibility.`}
        action={editable ? <button className="button primary" onClick={() => setActiveModalRecord("new")}>Create new</button> : undefined}
      />
      <div className="toolbar">
        <label className="search-field">
          <span className="sr-only">Search</span>
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={`Search ${section?.label.toLowerCase() ?? "content"}…`} />
        </label>
      </div>
      {status === "loading" && <InlineStatus label="Loading content…" />}
      {status === "error" && <div className="alert error" role="alert">{error}</div>}
      {status === "ready" && records.length === 0 && <EmptyState kind={section?.label ?? kind} editable={editable} onClickCreate={() => setActiveModalRecord("new")} />}
      {status === "ready" && records.length > 0 && (
        <div className="record-list">
          {records.map((record) => (
            <div
              className="record-row"
              key={record.id}
              onClick={() => editable ? setActiveModalRecord(record) : null}
              style={{ cursor: editable ? "pointer" : "default" }}
            >
              <div>
                <strong>{recordLabel(record)}</strong>
                <small>{recordSecondary(record)}</small>
              </div>
              <span className={`status-badge ${record.status?.toLowerCase()}`}>{record.status ?? "RECEIVED"}</span>
              <time>{formatDate(record.updatedAt ?? record.createdAt)}</time>
              <CaretRight />
            </div>
          ))}
        </div>
      )}

      {activeModalRecord && (
        <ContentModalWrapper
          kind={kind}
          record={activeModalRecord === "new" ? undefined : activeModalRecord}
          accessToken={accessToken}
          onClose={() => setActiveModalRecord(null)}
          onSuccess={() => {
            setActiveModalRecord(null);
            fetchRecords();
          }}
        />
      )}
    </>
  );
}

function ContentModalWrapper({
  kind,
  record,
  accessToken,
  onClose,
  onSuccess,
}: {
  kind: ContentKind;
  record?: ContentRecord;
  accessToken?: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [values, setValues] = useState<Record<string, any>>(record?.values || getDefaultValuesForKind(kind));
  const [status, setStatus] = useState<"ready" | "saving" | "error">("ready");
  const [message, setMessage] = useState("");

  async function handleSave(valuesToSave?: Record<string, any>) {
    setStatus("saving");
    setMessage("");
    try {
      const payloadValues = valuesToSave || values;
      const { saveContent } = await graphqlRequest<{ saveContent: ContentRecord }>(
        operations.save,
        { data: { kind, id: record?.id, values: payloadValues } },
        accessToken
      );
      setStatus("ready");
      setMessage("Changes saved as a draft.");
      onSuccess();
    } catch (caught) {
      setStatus("error");
      setMessage(caught instanceof Error ? caught.message : "Could not save changes");
    }
  }

  async function handleTransition(operation: string, verb: string) {
    if (!record) return;
    setStatus("saving");
    try {
      await graphqlRequest<Record<string, ContentRecord>>(operation, { data: { kind, id: record.id } }, accessToken);
      setMessage(`${verb} successfully.`);
      setStatus("ready");
      onSuccess();
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : `Could not ${verb.toLowerCase()}`);
      setStatus("error");
    }
  }

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <VisualRecordEditor
        kind={kind}
        record={record}
        values={values}
        onChangeValues={setValues}
        onSave={handleSave}
        onTransition={handleTransition}
        status={status}
        message={message}
        onClose={onClose}
      />
    </div>
  );
}

function ContentEditor() {
  const { kind: rawKind = "page", id = "new" } = useParams();
  const kind = rawKind.toUpperCase() as ContentKind;
  const { accessToken } = useAuth();
  const navigate = useNavigate();
  const [record, setRecord] = useState<ContentRecord>();
  const [values, setValues] = useState<Record<string, any>>({});
  const [status, setStatus] = useState<"loading" | "ready" | "saving" | "error">(id === "new" ? "ready" : "loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (id === "new") {
      setValues(getDefaultValuesForKind(kind));
      return;
    }
    graphqlRequest<{ adminRecords: ContentRecord[] }>(operations.records, { data: { kind, limit: 100 } }, accessToken)
      .then(({ adminRecords }) => {
        const found = adminRecords.find((item) => item.id === id);
        if (!found) throw new Error("Record not found");
        setRecord(found);
        setValues(found.values || {});
        setStatus("ready");
      })
      .catch((caught) => {
        setMessage(caught instanceof Error ? caught.message : "Could not load record");
        setStatus("error");
      });
  }, [accessToken, id, kind]);

  async function save(valuesToSave?: Record<string, any>) {
    setStatus("saving");
    setMessage("");
    try {
      const payloadValues = valuesToSave || values;
      const { saveContent } = await graphqlRequest<{ saveContent: ContentRecord }>(
        operations.save,
        { data: { kind, id: id === "new" ? undefined : id, values: payloadValues } },
        accessToken
      );
      setRecord(saveContent);
      setValues(saveContent.values || {});
      setStatus("ready");
      setMessage("Changes saved as a draft.");
      if (id === "new") navigate(`/content/${rawKind}/${saveContent.id}`, { replace: true });
    } catch (caught) {
      setStatus("error");
      setMessage(caught instanceof Error ? caught.message : "Could not save changes");
    }
  }

  async function transition(operation: string, verb: string) {
    if (!record) return;
    setStatus("saving");
    try {
      const result = await graphqlRequest<Record<string, ContentRecord>>(operation, { data: { kind, id: record.id } }, accessToken);
      const updated = Object.values(result)[0];
      setRecord(updated);
      setValues(updated.values || {});
      setMessage(`${verb} successfully.`);
      setStatus("ready");
    } catch (caught) {
      setMessage(caught instanceof Error ? caught.message : `Could not ${verb.toLowerCase()}`);
      setStatus("error");
    }
  }

  if (kind === "SUBMISSION") return <SubmissionDetail record={record} status={status} message={message} accessToken={accessToken} />;

  return (
    <div style={{ maxWidth: 840, margin: "0 auto" }}>
      <VisualRecordEditor
        kind={kind}
        record={record}
        values={values}
        onChangeValues={setValues}
        onSave={save}
        onTransition={transition}
        status={status}
        message={message}
        onClose={() => navigate(`/content/${rawKind}`)}
      />
    </div>
  );
}

function slugify(text: string): string {
  return text.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
}

function getDefaultValuesForKind(kind: ContentKind): Record<string, any> {
  switch (kind) {
    case "EVENT":
      return { title: "", slug: "", theme: "", venue: "", startAt: "", endAt: "", speakers: [], image: "", description: "", featured: false };
    case "BRANCH":
      return { name: "", slug: "", region: "Western", city: "", location: "", phone: "", email: "", description: "", image: "", order: 1 };
    case "LEADER":
      return { name: "", title: "", bio: "", portrait: "", order: 1 };
    case "MINISTRY":
      return { name: "", slug: "", audience: "", description: "", order: 1 };
    case "MEDIA":
      return { title: "", slug: "", type: "VIDEO", speaker: "", category: "Teaching", description: "", image: "", mediaUrl: "", featured: false };
    case "PAGE":
      return { title: "", slug: "", description: "", body: "" };
    default:
      return { title: "", slug: "", description: "" };
  }
}

function VisualRecordEditor({
  kind,
  record,
  values,
  onChangeValues,
  onSave,
  onTransition,
  status,
  message,
  onClose,
}: {
  kind: ContentKind;
  record?: ContentRecord;
  values: Record<string, any>;
  onChangeValues: (newValues: Record<string, any>) => void;
  onSave: (valuesToSave?: Record<string, any>) => Promise<void>;
  onTransition: (operation: string, verb: string) => Promise<void>;
  status: "loading" | "ready" | "saving" | "error";
  message: string;
  onClose?: () => void;
}) {
  const [editorMode, setEditorMode] = useState<"form" | "json">("form");
  const [jsonText, setJsonText] = useState(JSON.stringify(values, null, 2));

  useEffect(() => {
    setJsonText(JSON.stringify(values, null, 2));
  }, [values]);

  function updateField(field: string, val: any) {
    const updated = { ...values, [field]: val };
    if ((field === "title" || field === "name") && typeof val === "string") {
      if (!values.slug || values.slug === slugify(String(values.title || values.name || ""))) {
        updated.slug = slugify(val);
      }
    }
    onChangeValues(updated);
  }

  function handleJsonChange(raw: string) {
    setJsonText(raw);
    try {
      const parsed = JSON.parse(raw);
      onChangeValues(parsed);
    } catch {
      // Keep raw text until valid JSON
    }
  }

  const isSaving = status === "saving";

  return (
    <div className="modal-dialog">
      <header className="modal-header">
        <div className="modal-header-title">
          <Article />
          <div>
            <h2>{record ? `Edit ${kind.toLowerCase()}: ${recordLabel(record)}` : `Create new ${kind.toLowerCase()}`}</h2>
            <p>Fill out the administrative fields below to manage this content.</p>
          </div>
        </div>
        <div className="editor-mode-toggle">
          <button className={editorMode === "form" ? "active" : ""} onClick={() => setEditorMode("form")}>Visual Form</button>
          <button className={editorMode === "json" ? "active" : ""} onClick={() => setEditorMode("json")}>JSON Code</button>
        </div>
      </header>

      <div className="modal-body">
        {message && <div className={status === "error" ? "alert error" : "alert success"} role="status">{message}</div>}

        {editorMode === "json" ? (
          <div className="form-group">
            <label>Raw JSON Data</label>
            <textarea
              className="json-editor"
              value={jsonText}
              onChange={(e) => handleJsonChange(e.target.value)}
              spellCheck={false}
            />
          </div>
        ) : (
          <FormFieldsByKind kind={kind} values={values} updateField={updateField} />
        )}
      </div>

      <footer className="modal-footer">
        {onClose ? (
          <button className="button secondary" onClick={onClose} disabled={isSaving}>Cancel</button>
        ) : <div />}

        <div className="modal-footer-actions">
          {record && (
            <>
              <button className="button secondary" onClick={() => void onTransition(operations.publish, "Published")} disabled={isSaving}>Publish</button>
              <button className="button danger" onClick={() => void onTransition(operations.archive, "Archived")} disabled={isSaving}><Archive />Archive</button>
            </>
          )}
          <button className="button primary" onClick={() => void onSave(values)} disabled={isSaving}>
            {isSaving ? <><SpinnerGap className="spin" /> Saving…</> : "Save draft"}
          </button>
        </div>
      </footer>
    </div>
  );
}

async function uploadImage(file: File, alt: string, accessToken?: string): Promise<{ url: string; alt: string }> {
  const baseApi = (import.meta.env.VITE_API_URL ?? "http://localhost:4000/graphql").replace(/\/graphql\/?$/, "");
  const uploadEndpoint = `${baseApi}/api/uploads`;
  const formData = new FormData();
  formData.append("file", file);
  formData.append("alt", alt || file.name);

  const response = await fetch(uploadEndpoint, {
    method: "POST",
    headers: {
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: formData,
  });

  if (!response.ok) {
    const errJson = await response.json().catch(() => ({ error: "Upload failed" }));
    throw new Error(errJson.error || `Upload failed with status ${response.status}`);
  }

  const data = await response.json();
  return { url: data.asset.url, alt: data.asset.alt };
}

function FilePickerControl({
  value,
  onChange,
  label,
  accept = "image/jpeg,image/png,image/webp",
  accessToken,
  placeholder = "Upload image or enter URL...",
}: {
  value: string;
  onChange: (url: string) => void;
  label: string;
  accept?: string;
  accessToken?: string;
  placeholder?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileSelect(file: File) {
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const res = await uploadImage(file, file.name.replace(/\.[^/.]+$/, ""), accessToken);
      onChange(res.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload file");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="form-group span-2">
      <label>{label}</label>

      {value ? (
        <div className="file-preview-card">
          <img src={value} alt="Uploaded media preview" onError={(e) => (e.currentTarget.style.display = "none")} />
          <div className="file-preview-info">
            <span className="file-preview-url">{value}</span>
            <small>✓ Asset uploaded & stored on Cloudflare R2</small>
          </div>
          <div className="file-preview-actions">
            <button type="button" className="button secondary micro" onClick={() => fileInputRef.current?.click()}>
              Replace file
            </button>
            <button type="button" className="button danger micro" onClick={() => onChange("")}>
              Remove
            </button>
          </div>
        </div>
      ) : (
        <div
          className={`file-dropzone ${dragOver ? "drag-over" : ""} ${uploading ? "uploading" : ""}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            if (e.dataTransfer.files?.[0]) handleFileSelect(e.dataTransfer.files[0]);
          }}
          onClick={() => fileInputRef.current?.click()}
        >
          {uploading ? (
            <div className="dropzone-state">
              <SpinnerGap className="spin dropzone-icon" />
              <span>Uploading to Cloudflare R2...</span>
            </div>
          ) : (
            <div className="dropzone-state">
              <CloudArrowUp className="dropzone-icon" />
              <div>
                <strong>Click to choose a file or drag & drop here</strong>
                <p>Uploads directly to Cloudflare R2 (JPEG, PNG, WebP up to 10 MB)</p>
              </div>
              <button type="button" className="button secondary micro">Browse file</button>
            </div>
          )}
        </div>
      )}

      {error && <div className="alert error micro" role="alert">{error}</div>}

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        style={{ display: "none" }}
        onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
      />

      <details className="url-fallback-details">
        <summary>Or paste direct URL</summary>
        <input
          className="form-control"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      </details>
    </div>
  );
}

function FormFieldsByKind({
  kind,
  values,
  updateField,
}: {
  kind: ContentKind;
  values: Record<string, any>;
  updateField: (field: string, val: any) => void;
}) {
  const { accessToken } = useAuth();
  switch (kind) {
    case "EVENT":
      return (
        <div className="form-grid">
          <div className="form-group span-2">
            <label>Event Title <span className="required">*</span></label>
            <input className="form-control" value={values.title || ""} onChange={(e) => updateField("title", e.target.value)} placeholder="e.g. RFMC 2026 Conference" required />
          </div>

          <div className="form-group">
            <label>URL Slug <span className="required">*</span></label>
            <input className="form-control" value={values.slug || ""} onChange={(e) => updateField("slug", e.target.value)} placeholder="rfmc-2026" required />
          </div>

          <div className="form-group">
            <label>Theme</label>
            <input className="form-control" value={values.theme || ""} onChange={(e) => updateField("theme", e.target.value)} placeholder="e.g. FIGHT THE GOOD FIGHT!" />
          </div>

          <div className="form-group">
            <label>Start Date & Time</label>
            <input className="form-control" type="datetime-local" value={formatDatetimeLocal(values.startAt)} onChange={(e) => updateField("startAt", e.target.value ? new Date(e.target.value).toISOString() : "")} />
          </div>

          <div className="form-group">
            <label>End Date & Time</label>
            <input className="form-control" type="datetime-local" value={formatDatetimeLocal(values.endAt)} onChange={(e) => updateField("endAt", e.target.value ? new Date(e.target.value).toISOString() : "")} />
          </div>

          <div className="form-group span-2">
            <label>Venue / Location</label>
            <input className="form-control" value={values.venue || ""} onChange={(e) => updateField("venue", e.target.value)} placeholder="e.g. Church Auditorium, Mpintsin New Site" />
          </div>

          <div className="form-group span-2">
            <label>Speakers (comma separated)</label>
            <input className="form-control" value={Array.isArray(values.speakers) ? values.speakers.join(", ") : (values.speakers || "")} onChange={(e) => updateField("speakers", e.target.value.split(",").map(s => s.trim()))} placeholder="e.g. Pastor David Komlagah, Rev. Bernard Boayeg" />
          </div>

          <FilePickerControl
            label="Featured Event Image"
            value={values.image || ""}
            onChange={(url) => updateField("image", url)}
            accessToken={accessToken}
          />

          <div className="form-group span-2">
            <label>Event Description</label>
            <textarea className="form-textarea" value={values.description || ""} onChange={(e) => updateField("description", e.target.value)} placeholder="Full details about this event..." />
          </div>

          <div className="form-group span-2">
            <label className="form-checkbox-group">
              <input type="checkbox" checked={!!values.featured} onChange={(e) => updateField("featured", e.target.checked)} />
              <span>Feature this event on the homepage banner</span>
            </label>
          </div>
        </div>
      );

    case "BRANCH":
      return (
        <div className="form-grid">
          <div className="form-group">
            <label>Branch Name <span className="required">*</span></label>
            <input className="form-control" value={values.name || ""} onChange={(e) => updateField("name", e.target.value)} placeholder="e.g. Western Regional Branch" required />
          </div>

          <div className="form-group">
            <label>URL Slug <span className="required">*</span></label>
            <input className="form-control" value={values.slug || ""} onChange={(e) => updateField("slug", e.target.value)} placeholder="western-regional-takoradi" required />
          </div>

          <div className="form-group">
            <label>Region</label>
            <select className="form-select" value={values.region || "Western"} onChange={(e) => updateField("region", e.target.value)}>
              <option value="Western">Western Region</option>
              <option value="Greater Accra">Greater Accra Region</option>
              <option value="Ashanti">Ashanti Region</option>
              <option value="Central">Central Region</option>
              <option value="Eastern">Eastern Region</option>
              <option value="Volta">Volta Region</option>
              <option value="Northern">Northern Region</option>
            </select>
          </div>

          <div className="form-group">
            <label>City / Town</label>
            <input className="form-control" value={values.city || ""} onChange={(e) => updateField("city", e.target.value)} placeholder="e.g. Takoradi" />
          </div>

          <div className="form-group span-2">
            <label>Physical Address / Location</label>
            <input className="form-control" value={values.location || ""} onChange={(e) => updateField("location", e.target.value)} placeholder="e.g. Mpintsin New Site, High Tension Down" />
          </div>

          <div className="form-group">
            <label>Contact Phone</label>
            <input className="form-control" value={values.phone || ""} onChange={(e) => updateField("phone", e.target.value)} placeholder="+233..." />
          </div>

          <div className="form-group">
            <label>Contact Email</label>
            <input className="form-control" type="email" value={values.email || ""} onChange={(e) => updateField("email", e.target.value)} placeholder="branch@pcfs.org" />
          </div>

          <FilePickerControl
            label="Branch Photo"
            value={values.image || ""}
            onChange={(url) => updateField("image", url)}
            accessToken={accessToken}
          />

          <div className="form-group span-2">
            <label>Branch Description</label>
            <textarea className="form-textarea" value={values.description || ""} onChange={(e) => updateField("description", e.target.value)} placeholder="Overview of services and community..." />
          </div>
        </div>
      );

    case "LEADER":
      return (
        <div className="form-grid">
          <div className="form-group">
            <label>Leader Name <span className="required">*</span></label>
            <input className="form-control" value={values.name || ""} onChange={(e) => updateField("name", e.target.value)} placeholder="e.g. Rev. David Komlagah" required />
          </div>

          <div className="form-group">
            <label>Title / Position <span className="required">*</span></label>
            <input className="form-control" value={values.title || ""} onChange={(e) => updateField("title", e.target.value)} placeholder="e.g. Head Pastor, Takoradi Branch" required />
          </div>

          <FilePickerControl
            label="Leader Portrait Photo"
            value={values.portrait || values.image || ""}
            onChange={(url) => { updateField("portrait", url); updateField("image", url); }}
            accessToken={accessToken}
          />

          <div className="form-group span-2">
            <label>Biography</label>
            <textarea className="form-textarea" value={values.bio || ""} onChange={(e) => updateField("bio", e.target.value)} placeholder="Leader biography and ministry journey..." />
          </div>
        </div>
      );

    case "MINISTRY":
      return (
        <div className="form-grid">
          <div className="form-group">
            <label>Ministry Name <span className="required">*</span></label>
            <input className="form-control" value={values.name || ""} onChange={(e) => updateField("name", e.target.value)} placeholder="e.g. Kiddie Ministry International" required />
          </div>

          <div className="form-group">
            <label>URL Slug <span className="required">*</span></label>
            <input className="form-control" value={values.slug || ""} onChange={(e) => updateField("slug", e.target.value)} placeholder="kiddie-ministry" required />
          </div>

          <div className="form-group span-2">
            <label>Target Audience / Age Group</label>
            <input className="form-control" value={values.audience || ""} onChange={(e) => updateField("audience", e.target.value)} placeholder="e.g. Ages 1–5" />
          </div>

          <div className="form-group span-2">
            <label>Ministry Description</label>
            <textarea className="form-textarea" value={values.description || ""} onChange={(e) => updateField("description", e.target.value)} placeholder="Ministry goals, activities, and vision..." />
          </div>
        </div>
      );

    case "MEDIA":
      return (
        <div className="form-grid">
          <div className="form-group span-2">
            <label>Media Title <span className="required">*</span></label>
            <input className="form-control" value={values.title || ""} onChange={(e) => updateField("title", e.target.value)} placeholder="e.g. Growing Through Sound Doctrine" required />
          </div>

          <div className="form-group">
            <label>URL Slug <span className="required">*</span></label>
            <input className="form-control" value={values.slug || ""} onChange={(e) => updateField("slug", e.target.value)} placeholder="growing-through-sound-doctrine" required />
          </div>

          <div className="form-group">
            <label>Media Type</label>
            <select className="form-select" value={values.type || "VIDEO"} onChange={(e) => updateField("type", e.target.value)}>
              <option value="VIDEO">Video Teaching</option>
              <option value="AUDIO">Audio Sermon</option>
              <option value="ARTICLE">Article / Publication</option>
            </select>
          </div>

          <div className="form-group">
            <label>Speaker / Preacher</label>
            <input className="form-control" value={values.speaker || ""} onChange={(e) => updateField("speaker", e.target.value)} placeholder="e.g. PCFS Teaching Ministry" />
          </div>

          <div className="form-group">
            <label>Category</label>
            <input className="form-control" value={values.category || ""} onChange={(e) => updateField("category", e.target.value)} placeholder="e.g. Teaching / Sermon" />
          </div>

          <FilePickerControl
            label="Cover Thumbnail Image"
            value={values.image || ""}
            onChange={(url) => updateField("image", url)}
            accessToken={accessToken}
          />

          <FilePickerControl
            label="Media Audio / Video File"
            value={values.mediaUrl || ""}
            onChange={(url) => updateField("mediaUrl", url)}
            accept="audio/*,video/*,application/pdf"
            accessToken={accessToken}
            placeholder="Upload or paste media stream URL..."
          />

          <div className="form-group span-2">
            <label>Summary / Description</label>
            <textarea className="form-textarea" value={values.description || ""} onChange={(e) => updateField("description", e.target.value)} placeholder="Overview of message..." />
          </div>

          <div className="form-group span-2">
            <label className="form-checkbox-group">
              <input type="checkbox" checked={!!values.featured} onChange={(e) => updateField("featured", e.target.checked)} />
              <span>Feature on media homepage section</span>
            </label>
          </div>
        </div>
      );

    default:
      return (
        <div className="form-grid">
          <div className="form-group span-2">
            <label>Title / Name <span className="required">*</span></label>
            <input className="form-control" value={values.title || values.name || ""} onChange={(e) => updateField(values.title !== undefined ? "title" : "name", e.target.value)} placeholder="Title" required />
          </div>

          {values.slug !== undefined && (
            <div className="form-group span-2">
              <label>URL Slug <span className="required">*</span></label>
              <input className="form-control" value={values.slug || ""} onChange={(e) => updateField("slug", e.target.value)} placeholder="slug" required />
            </div>
          )}

          <div className="form-group span-2">
            <label>Description / Content</label>
            <textarea className="form-textarea" value={values.description || values.body || ""} onChange={(e) => updateField(values.description !== undefined ? "description" : "body", e.target.value)} placeholder="Content details..." />
          </div>
        </div>
      );
  }
}

function formatDatetimeLocal(isoStr?: string): string {
  if (!isoStr) return "";
  try {
    const d = new Date(isoStr);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return "";
  }
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
function EmptyState({ kind, editable, href, onClickCreate }: { kind: string; editable: boolean; href?: string; onClickCreate?: () => void }) { return <section className="empty-state"><Sparkle weight="duotone" /><h2>No {kind.toLowerCase()} found</h2><p>{editable ? "Create the first record or adjust your search." : "New submissions will appear here automatically."}</p>{editable && (onClickCreate ? <button className="button primary" onClick={onClickCreate}>Create new</button> : <Link className="button primary" to={href || "#"}>Create new</Link>)}</section>; }
function recordLabel(record?: ContentRecord): string { if (!record) return "Loading…"; const values = record.values; return String(values.title ?? values.name ?? values.reference ?? values.email ?? "Untitled record"); }
function recordSecondary(record: ContentRecord): string { return String(record.values.slug ?? record.values.region ?? record.values.notificationStatus ?? record.kind.replaceAll("_", " ")); }
function formatDate(value?: string): string { return value ? new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value)) : "—"; }
