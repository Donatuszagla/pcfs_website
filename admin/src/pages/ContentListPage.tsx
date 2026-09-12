import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { CaretRight } from "@phosphor-icons/react";
import { useAuth } from "../auth";
import type { ContentKind, ContentRecord } from "../graphql";
import { graphqlRequest, operations } from "../graphql";
import { contentSections } from "../constants/contentSections";
import { formatDate, recordLabel, recordSecondary } from "../utils/helpers";
import { ContentModalWrapper } from "../components/ContentModalWrapper";
import { EmptyState, InlineStatus, PageTitle } from "../components/UI";
import { logger } from "../utils/logger";

export function ContentListPage() {
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
      .then(({ adminRecords }) => {
        logger.info(`Loaded ${adminRecords.length} records for ${kind}`);
        setRecords(adminRecords);
        setStatus("ready");
      })
      .catch((caught) => {
        logger.error(`Failed to load ${kind} records`, caught);
        setError(caught instanceof Error ? caught.message : "Could not load content");
        setStatus("error");
      });
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
