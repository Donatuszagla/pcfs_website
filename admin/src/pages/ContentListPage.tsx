import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CaretRight, CloudArrowUp } from "@phosphor-icons/react";
import { useAuth } from "../auth";
import type { ContentKind, ContentRecord } from "../graphql";
import { graphqlRequest, operations } from "../graphql";
import { contentSections } from "../constants/contentSections";
import { formatDate, recordLabel, recordSecondary } from "../utils/helpers";
import { ContentModalWrapper } from "../components/ContentModalWrapper";
import { BatchMediaUploader } from "../components/BatchMediaUploader";
import { EmptyState, InlineStatus, PageTitle } from "../components/UI";
import { Pagination } from "../components/Pagination";
import { logger } from "../utils/logger";

export function ContentListPage() {
  const { kind: rawKind = "page" } = useParams();
  const kind = rawKind.toUpperCase() as ContentKind;
  const section = contentSections.find((item) => item.kind === kind);
  const { accessToken } = useAuth();
  const navigate = useNavigate();
  const [records, setRecords] = useState<ContentRecord[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState("");
  const [activeModalRecord, setActiveModalRecord] = useState<ContentRecord | "new" | null>(null);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Reset to page 1 whenever kind or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [kind, search]);

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
  const viewable = kind === "SUBMISSION"; // read-only detail page

  function handleRowClick(record: ContentRecord) {
    if (editable) setActiveModalRecord(record);
    else if (viewable) navigate(`/content/${rawKind}/${record.id}`);
  }

  return (
    <>
      <PageTitle
        eyebrow="CONTENT"
        title={section?.label ?? kind}
        description={`Manage ${section?.label.toLowerCase() ?? "records"}, publishing state and public visibility.`}
        action={
          editable ? (
            <div style={{ display: "flex", gap: "10px" }}>
              {kind === "MEDIA" && (
                <button
                  type="button"
                  className="button secondary"
                  onClick={() => setShowBatchModal(true)}
                  style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}
                >
                  <CloudArrowUp size={18} />
                  Batch Upload Media
                </button>
              )}
              <button className="button primary" onClick={() => setActiveModalRecord("new")}>
                Create new
              </button>
            </div>
          ) : undefined
        }
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
        <>
          <div className="record-list">
            {records
              .slice((currentPage - 1) * pageSize, currentPage * pageSize)
              .map((record) => (
                <div
                  className="record-row"
                  key={record.id}
                  onClick={() => handleRowClick(record)}
                  style={{ cursor: editable || viewable ? "pointer" : "default" }}
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

          <Pagination
            currentPage={currentPage}
            totalItems={records.length}
            pageSize={pageSize}
            onPageChange={(p) => setCurrentPage(p)}
            onPageSizeChange={(s) => setPageSize(s)}
            pageSizeOptions={[10, 20, 50]}
          />
        </>
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

      {showBatchModal && (
        <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && setShowBatchModal(false)}>
          <BatchMediaUploader
            accessToken={accessToken}
            onClose={() => setShowBatchModal(false)}
            onComplete={() => {
              setShowBatchModal(false);
              fetchRecords();
            }}
          />
        </div>
      )}
    </>
  );
}
