import { MagnifyingGlass } from "@phosphor-icons/react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { EmptyState } from "../components/EmptyState";
import { PageLayout } from "../components/PageLayout";
import type { MediaItem } from "../types";

export interface MediaPageProps {
  media: MediaItem[];
}

export function MediaPage({ media }: MediaPageProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const categories = ["All", ...new Set(media.map((item) => item.category))];
  const visible = useMemo(
    () =>
      media.filter(
        (item) =>
          (category === "All" || item.category === category) &&
          `${item.title} ${item.speaker}`.toLowerCase().includes(search.toLowerCase())
      ),
    [category, media, search]
  );
  return (
    <PageLayout
      eyebrow="Teachings and resources"
      title="Paradise City Media Hub"
      intro="Search sermons, teachings, videos and audio shared by PCFS."
    >
      <div className="search-bar">
        <MagnifyingGlass aria-hidden />
        <label className="sr-only" htmlFor="media-search">
          Search media
        </label>
        <input
          id="media-search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search by title or speaker"
        />
        <label className="sr-only" htmlFor="media-category">
          Category
        </label>
        <select id="media-category" value={category} onChange={(event) => setCategory(event.target.value)}>
          {categories.map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
      </div>
      {visible.length ? (
        <div className="cards-grid">
          {visible.map((item) => (
            <article className="content-card" key={item.id}>
              <img src={item.image} alt="Open Bible on a church lectern" />
              <div>
                <span>
                  {item.category} · {item.type}
                </span>
                <h2>{item.title}</h2>
                <p>{item.speaker}</p>
                <Link to={`/media/${item.slug}`}>Open media</Link>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState title="No media found" body="Try another title, speaker or category." />
      )}
    </PageLayout>
  );
}
