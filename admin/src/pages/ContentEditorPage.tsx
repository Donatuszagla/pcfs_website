import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../auth";
import type { ContentKind, ContentRecord } from "../graphql";
import { graphqlRequest, operations } from "../graphql";
import { getDefaultValuesForKind } from "../utils/helpers";
import { VisualRecordEditor } from "../components/VisualRecordEditor";
import { SubmissionDetailPage } from "./SubmissionDetailPage";

export function ContentEditorPage() {
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

  if (kind === "SUBMISSION") return <SubmissionDetailPage record={record} status={status} message={message} accessToken={accessToken} />;

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
