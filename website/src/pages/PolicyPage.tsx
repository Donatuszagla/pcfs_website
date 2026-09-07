import { PageLayout } from "../components/PageLayout";

export interface PolicyPageProps {
  kind: "privacy" | "terms";
}

export function PolicyPage({ kind }: PolicyPageProps) {
  const privacy = kind === "privacy";
  return (
    <PageLayout
      eyebrow="Website information"
      title={privacy ? "Privacy Policy" : "Website Terms"}
      intro={
        privacy
          ? "How PCFS handles information submitted through this website."
          : "The terms governing use of this website."
      }
    >
      <article className="prose">
        <h2>{privacy ? "Information we collect" : "Use of this website"}</h2>
        <p>
          {privacy
            ? "The contact form collects the details you choose to provide so authorised church administrators can respond to your enquiry. Submissions are not published."
            : "Content is provided for church information and connection. Event, branch and contact details should be confirmed before travel or attendance."}
        </p>
        <h2>{privacy ? "Information Protection" : "Content Ownership & Usage"}</h2>
        <p>
          {privacy
            ? "Paradise City of Faith Sanctuary (PCFS) respects your privacy. All information submitted through our contact forms is handled confidentially and used solely for ministry communication, prayer support, and community services."
            : "All text, sermon broadcasts, images, and brand materials published on this website are the property of Paradise City of Faith Sanctuary. They are provided for spiritual encouragement and personal enrichment."}
        </p>
        <h2>Contact Us</h2>
        <p>For questions regarding our privacy practices or website terms, please contact us at info@pcfs.org or visit our main administrative office.</p>
      </article>
    </PageLayout>
  );
}
