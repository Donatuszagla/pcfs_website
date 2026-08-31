import { MapPin } from "@phosphor-icons/react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { PageLayout } from "../components/PageLayout";
import type { Branch } from "../types";

export interface BranchesPageProps {
  branches: Branch[];
}

export function BranchesPage({ branches }: BranchesPageProps) {
  const [region, setRegion] = useState("All");
  const regions = ["All", ...new Set(branches.map((branch) => branch.region))];
  const visible = region === "All" ? branches : branches.filter((branch) => branch.region === region);
  return (
    <PageLayout
      eyebrow="Find your place"
      title="PCFS branches"
      intro="Explore active branches and connect with the Paradise City of Faith Sanctuary family near you."
    >
      <div className="filter-bar">
        <label htmlFor="region">Region</label>
        <select id="region" value={region} onChange={(event) => setRegion(event.target.value)}>
          {regions.map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
      </div>
      <div className="cards-grid">
        {visible.map((branch) => (
          <article className="content-card" key={branch.id}>
            <img src={branch.image} alt="Temporary branch building photography" />
            <div>
              <span>{branch.region}</span>
              <h2>{branch.name}</h2>
              <p>
                <MapPin aria-hidden />
                {branch.city} · {branch.location}
              </p>
              <Link to={`/branches/${branch.slug}`}>View branch</Link>
            </div>
          </article>
        ))}
      </div>
    </PageLayout>
  );
}
