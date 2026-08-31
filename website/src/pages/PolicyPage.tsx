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
        <h2>Media and accuracy</h2>
        <p>
          Temporary photography and pending content are explicitly marked. Official assets and final legal wording must be approved before production launch.
        </p>
        <h2>Contact</h2>
        <p>Official privacy and governance contact details will be inserted before launch.</p>
      </article>
    </PageLayout>
  );
}
