import { MapPin } from "@phosphor-icons/react";
import { type FormEvent, useState } from "react";
import { PageLayout } from "../components/PageLayout";
import { TurnstileField } from "../components/TurnstileField";
import type { SiteData } from "../types";
import { logger } from "../utils/logger";

export interface ContactPageProps {
  data: SiteData;
}

export function ContactPage({ data }: ContactPageProps) {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formEl = event.currentTarget; // capture before any async — currentTarget becomes null after the handler returns
    setStatus("sending");
    setErrorMsg("");
    const form = new FormData(formEl);
    const input = Object.fromEntries(form.entries());
    logger.action(`Submitting contact form for: ${input.name || "Anonymous"} (${input.email || "No email"})`);
    try {
      const response = await fetch(import.meta.env.VITE_API_URL ?? "http://localhost:4000/graphql", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          query: `mutation SubmitContact($data: ContactInput!) { submitContact(data: $data) { accepted reference } }`,
          variables: { data: { ...input, captchaToken } },
        }),
      });
      const payload = (await response.json()) as {
        data?: { submitContact?: { accepted: boolean; reference?: string } };
        errors?: { message?: string }[];
      };
      if (!response.ok || !payload.data?.submitContact?.accepted) {
        const msg = payload.errors?.[0]?.message || "Submission failed";
        throw new Error(msg);
      }
      logger.success(`Contact form submission accepted (ref: ${payload.data.submitContact.reference ?? "n/a"})`);
      formEl.reset();
      setStatus("success");
    } catch (err) {
      logger.error("Contact form submission error", err);
      setErrorMsg(err instanceof Error ? err.message : "We could not send your enquiry. Please try again.");
      setStatus("error");
    }
  }

  return (
    <PageLayout
      eyebrow="We’d love to hear from you"
      title="Contact PCFS"
      intro="Ask a question, plan a visit or request information from the church communications team."
    >
      <div className="contact-grid">
        <form className="contact-form" onSubmit={submit}>
          <label>
            Name
            <input name="name" required autoComplete="name" />
          </label>
          <label>
            Email
            <input name="email" type="email" autoComplete="email" />
          </label>
          <label>
            Phone
            <input name="phone" type="tel" autoComplete="tel" />
          </label>
          <label>
            Subject
            <select name="subject" defaultValue="Plan a visit">
              <option>Plan a visit</option>
              <option>General enquiry</option>
              <option>Events</option>
              <option>Media</option>
            </select>
          </label>
          <label>
            Message
            <textarea name="message" required minLength={10} rows={6} />
          </label>
          <TurnstileField onToken={setCaptchaToken} />
          <button className="button" disabled={status === "sending" || !captchaToken}>
            {status === "sending" ? "Sending…" : "Send enquiry"}
          </button>
          {status === "success" && (
            <p role="status" className="form-success">
              Thank you. Your enquiry has been received.
            </p>
          )}
          {status === "error" && (
            <p role="alert" className="form-error">
              {errorMsg || "We could not send your enquiry. Please try again."}
            </p>
          )}
        </form>
        <aside>
          <h2>Visit and connect</h2>
          <p>Official phone numbers, email addresses and service times are pending final approval.</p>
          {data.branches.map((branch) => (
            <p key={branch.id}>
              <MapPin aria-hidden />
              <strong>{branch.name}:</strong> {branch.city}, {branch.location}
            </p>
          ))}
          {data.settings.contactEmail && (
            <a href={`mailto:${data.settings.contactEmail}`}>{data.settings.contactEmail}</a>
          )}
          <div className="notice">
            Contact submissions are used only to respond to your enquiry and are not displayed publicly.
          </div>
        </aside>
      </div>
    </PageLayout>
  );
}
