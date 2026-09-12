import { useState } from "react";
import type { ContentKind, ContentRecord } from "../graphql";
import { graphqlRequest, operations } from "../graphql";
import { getDefaultValuesForKind } from "../utils/helpers";
import { logger } from "../utils/logger";
import { VisualRecordEditor } from "./VisualRecordEditor";

export function ContentModalWrapper({
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
    logger.action(`Saving draft for ${kind}`, { id: record?.id });
    setStatus("saving");
    setMessage("");
    try {
      const payloadValues = valuesToSave || values;
      await graphqlRequest<{ saveContent: ContentRecord }>(
        operations.save,
        { data: { kind, id: record?.id, values: payloadValues } },
        accessToken
      );
      setStatus("ready");
      setMessage("Changes saved as a draft.");
      logger.success(`Draft saved successfully for ${kind}`, { id: record?.id });
      onSuccess();
    } catch (caught) {
      const errMessage = caught instanceof Error ? caught.message : "Could not save changes";
      logger.error(`Failed to save draft for ${kind}`, caught);
      setStatus("error");
      setMessage(errMessage);
    }
  }

  async function handleTransition(operation: string, verb: string) {
    if (!record) return;
    logger.action(`Executing content action "${verb}" on ${kind}`, { id: record.id });
    setStatus("saving");
    try {
      await graphqlRequest<Record<string, ContentRecord>>(operation, { data: { kind, id: record.id } }, accessToken);
      setMessage(`${verb} successfully.`);
      setStatus("ready");
      logger.success(`Content ${kind} (${record.id}) ${verb.toLowerCase()} successfully`);
      onSuccess();
    } catch (caught) {
      const errMessage = caught instanceof Error ? caught.message : `Could not ${verb.toLowerCase()}`;
      logger.error(`Content action "${verb}" failed on ${kind}`, caught);
      setMessage(errMessage);
      setStatus("error");
    }
  }

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          logger.action(`Closed ${kind} editor modal`);
          onClose();
        }
      }}
    >
      <VisualRecordEditor
        kind={kind}
        record={record}
        values={values}
        onChangeValues={setValues}
        onSave={handleSave}
        onTransition={handleTransition}
        status={status}
        message={message}
        onClose={() => {
          logger.action(`Closed ${kind} editor modal`);
          onClose();
        }}
      />
    </div>
  );
}
