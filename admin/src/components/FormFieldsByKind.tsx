import type { ContentKind } from "../graphql";
import { useAuth } from "../auth";
import { formatDatetimeLocal } from "../utils/helpers";
import { FilePickerControl } from "./FilePickerControl";

export function FormFieldsByKind({
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
            accept="image/jpeg,image/png,image/webp,image/avif"
            accessToken={accessToken}
            placeholder="Upload thumbnail or enter image URL..."
          />

          <FilePickerControl
            label="Sermon Audio File or External Stream URL"
            value={values.externalUrl || values.mediaUrl || ""}
            onChange={(url) => {
              updateField("externalUrl", url);
              updateField("mediaUrl", url);
            }}
            accept="audio/mpeg,audio/mp3,audio/wav,audio/x-m4a,audio/m4a,audio/aac,audio/ogg"
            accessToken={accessToken}
            placeholder="Paste YouTube / SoundCloud / Vimeo link or upload audio file..."
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
