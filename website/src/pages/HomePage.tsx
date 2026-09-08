import { Play } from "@phosphor-icons/react";
import { Link } from "react-router-dom";
import { HeroSlider } from "../components/HeroSlider";
import { pillars } from "../constants/pillars";
import type { SiteData } from "../types";
import { formatDateRange } from "../utils/formatters";

export interface HomePageProps {
  data: SiteData;
}

export function HomePage({ data }: HomePageProps) {
  const featuredEvent = data.events.find((event) => event.featured) ?? data.events[0];
  const featuredMedia = data.media.find((item) => item.featured) ?? data.media[0];
  const featuredBranch = data.branches[0];
  return (
    <>
      <HeroSlider data={data} />
      {featuredEvent && (
        <section className="event-ribbon page-rail reveal" aria-labelledby="featured-event-title">
          <div className="event-badge">
            {featuredEvent.title.split(" ").slice(0, -1).join(" ") || featuredEvent.title}
            <br />
            {new Date(featuredEvent.startAt).getFullYear()}
          </div>
          <div>
            <span>Upcoming event</span>
            <h2 id="featured-event-title">{featuredEvent.theme}</h2>
            <strong>{formatDateRange(featuredEvent.startAt, featuredEvent.endAt)}</strong>
          </div>
          <img
            src={featuredEvent.image}
            alt="Paradise City of Faith Sanctuary worship event"
          />
        </section>
      )}
      <section className="mandate-grid page-rail section-space reveal">
        <div>
          <p className="eyebrow">Our mandate</p>
          <h2>Raising people for Kingdom assignment</h2>
          <p>{data.settings.description}</p>
        </div>
        <div>
          <p className="eyebrow">Our vision</p>
          <h2>Go and raise me a people</h2>
          <p>{data.settings.vision}</p>
        </div>
      </section>
      <section className="pillars section-space reveal" aria-labelledby="pillars-title">
        <div className="page-rail">
          <h2 id="pillars-title">The Five Pillars of Our Ministry</h2>
          <div className="pillar-list">
            {pillars.map(({ title, description, Icon }) => (
              <article key={title}>
                <span className="pillar-icon">
                  <Icon size={38} weight="regular" aria-hidden />
                </span>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="preview-grid page-rail section-space reveal">
        <article>
          <h2>Meet Our Spiritual Heads</h2>
          <div className="leader-preview">
            {data.leaders.slice(0, 2).map((leader) => (
              <div key={leader.id}>
                <span>
                  <img
                    src={leader.portrait ?? leader.image ?? "/images/PCFS LOGO.png"}
                    alt={leader.name}
                  />
                </span>
                <p>
                  <strong>{leader.name}</strong>
                  <small>{leader.title}</small>
                </p>
              </div>
            ))}
          </div>
          <Link className="button button-compact" to="/about#leadership">
            Learn More
          </Link>
        </article>
        {featuredMedia && (
          <article>
            <h2>Latest Teaching</h2>
            <Link className="image-card" to={`/media/${featuredMedia.slug}`}>
              <img src={featuredMedia.image} alt="Open Bible on a church lectern" />
              <span className="play-icon">
                <Play weight="fill" aria-hidden />
              </span>
            </Link>
            <p>Watch, listen and grow with sound doctrine that transforms lives and builds destiny.</p>
            <Link className="button button-compact" to="/media">
              Explore Teachings
            </Link>
          </article>
        )}
        {featuredBranch && (
          <article>
            <h2>Our Branches</h2>
            <Link className="image-card" to={`/branches/${featuredBranch.slug}`}>
              <img src={featuredBranch.image} alt="Paradise City of Faith Sanctuary branch location" />
            </Link>
            <p>Find a Paradise City of Faith Sanctuary branch near you and connect with a thriving community.</p>
            <Link className="button button-compact" to="/branches">
              Find a Branch
            </Link>
          </article>
        )}
      </section>
      <section className="invitation reveal">
        <div className="page-rail">
          <h2>You’re Invited</h2>
          <p>Whether you are exploring faith or looking for a church home, you are welcome here.</p>
          <div className="button-row centered">
            <Link className="button" to="/contact">
              Plan a Visit
            </Link>
            <Link className="button button-outline" to="/about">
              Explore PCFS
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
