import { useState } from "react";
import type { ContentRecord } from "../graphql";
import { graphqlRequest, operations } from "../graphql";
import { InlineStatus, PageTitle } from "../components/UI";

export function SubmissionDetailPage({ record, status, message, accessToken }: { record?: ContentRecord; status: string; message: string; accessToken?: string }) {
  const [result, setResult] = useState(message);
  if (status === "loading") return <InlineStatus label="Loading enquiry…" />;
  if (!record) return <div className="alert error">{message || "Enquiry not found"}</div>;
  const values = record.values;
  return (
    <>
      <PageTitle
        eyebrow="ENQUIRY"
        title={String(values.subject ?? "Website enquiry")}
        description={`Reference ${String(values.reference ?? record.id)}`}
        action={
          values.notificationStatus === "FAILED" ? (
            <button
              className="button primary"
              onClick={async () => {
                await graphqlRequest(operations.retryContact, { data: { id: record.id } }, accessToken);
                setResult("Email delivery retried.");
              }}
            >
              Retry email
            </button>
          ) : undefined
        }
      />
      {result && <div className="alert success">{result}</div>}
      <section className="panel enquiry">
        <dl>
          <dt>From</dt>
          <dd>{String(values.name ?? "—")}</dd>
          <dt>Email</dt>
          <dd>{String(values.email ?? "—")}</dd>
          <dt>Phone</dt>
          <dd>{String(values.phone ?? "—")}</dd>
          <dt>Notification</dt>
          <dd>{String(values.notificationStatus ?? "—")}</dd>
        </dl>
        <h2>Message</h2>
        <p>{String(values.message ?? "")}</p>
      </section>
    </>
  );
}
