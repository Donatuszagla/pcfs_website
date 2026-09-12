import { useEffect, useState } from "react";
import { Archive, Article, SpinnerGap } from "@phosphor-icons/react";
import type { ContentKind, ContentRecord } from "../graphql";
import { operations } from "../graphql";
import { recordLabel, slugify } from "../utils/helpers";
import { FormFieldsByKind } from "./FormFieldsByKind";

export function VisualRecordEditor({
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
