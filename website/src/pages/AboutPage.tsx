import { UsersThree } from "@phosphor-icons/react";
import { PageLayout } from "../components/PageLayout";
import { pillars } from "../constants/pillars";
import type { SiteData } from "../types";

export interface AboutPageProps {
  data: SiteData;
}

export function AboutPage({ data }: AboutPageProps) {
  return (
    <PageLayout
      eyebrow="About PCFS"
      title="Building effective people for Kingdom assignment"
      intro={data.settings.description}
    >
      <section className="statement-grid">
        <article>
          <span>Vision</span>
          <h2>{data.settings.vision}</h2>
        </article>
        <article>
          <span>Mission</span>
          <h2>{data.settings.mission}</h2>
        </article>
      </section>
      <section className="content-section">
        <p className="eyebrow">What grounds us</p>
        <h2>Our pillars</h2>
        <div className="compact-grid">
          {pillars.map(({ title, description, Icon }) => (
            <article key={title}>
              <Icon size={32} aria-hidden />
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>
      <section id="leadership" className="content-section">
        <p className="eyebrow">Leadership</p>
        <h2>Our spiritual heads</h2>
        <div className="leader-grid">
          {data.leaders.map((leader) => (
            <article key={leader.id}>
              <span className="portrait-placeholder">
                {leader.image || leader.portrait ? (
                  <img
                    src={leader.image ?? leader.portrait}
                    alt={leader.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "inherit" }}
                  />
                ) : (
                  <UsersThree size={64} aria-hidden />
                )}
              </span>
              <h3>{leader.name}</h3>
              <strong>{leader.title}</strong>
              <p>{leader.bio}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="content-section">
        <p className="eyebrow">Growing generations</p>
        <h2>Ministries</h2>
        <div className="compact-grid">
          {data.ministries.map((ministry) => (
            <article key={ministry.id}>
              <h3>{ministry.name}</h3>
              <strong>{ministry.audience}</strong>
              <p>{ministry.description}</p>
            </article>
          ))}
        </div>
      </section>
    </PageLayout>
  );
}
