import { Buildings, MapPin } from "@phosphor-icons/react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { PageLayout } from "../components/PageLayout";
import { Pagination } from "../components/Pagination";
import { GHANA_REGIONS } from "../constants/regions";
import type { Branch } from "../types";

export interface BranchesPageProps {
  branches: Branch[];
}

export function BranchesPage({ branches }: BranchesPageProps) {
  const [region, setRegion] = useState("All");
  const [page, setPage] = useState(1);
  const branchesPerPage = 6;

  const visible = region === "All" ? branches : branches.filter((branch) => branch.region?.toLowerCase() === region.toLowerCase());
  const paginatedBranches = visible.slice((page - 1) * branchesPerPage, page * branchesPerPage);

  const handleRegionChange = (newRegion: string) => {
    setRegion(newRegion);
    setPage(1);
  };

  return (
    <PageLayout
      eyebrow="Find your place"
      title="PCFS branches"
      intro="Explore active branches and connect with the Paradise City of Faith Sanctuary family near you."
    >
      <div className="filter-bar">
        <label htmlFor="region">Region</label>
        <select id="region" value={region} onChange={(event) => handleRegionChange(event.target.value)}>
          <option value="All">All Regions (Ghana)</option>
          {GHANA_REGIONS.map((value) => (
            <option key={value} value={value}>
              {value} Region
            </option>
          ))}
        </select>
      </div>
      {visible.length > 0 ? (
        <>
          <div className="cards-grid">
            {paginatedBranches.map((branch) => (
              <article className="content-card" key={branch.id}>
                <img src={branch.image} alt={branch.name || "Branch building"} />
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

          <Pagination
            currentPage={page}
            totalItems={visible.length}
            pageSize={branchesPerPage}
            onPageChange={setPage}
          />
        </>
      ) : (
        <div className="empty-state" style={{ margin: "24px 0" }}>
          <Buildings size={40} style={{ margin: "0 auto 12px", display: "block" }} />
          <h3>No branches listed in {region} Region yet</h3>
          <p style={{ maxWidth: "480px", margin: "8px auto 16px" }}>
            We are actively expanding across Ghana. Please connect with our PCFS Headquarters in Greater Accra or Western Regional Branch in Takoradi for fellowship locations and online gatherings.
          </p>
          <button type="button" className="button secondary micro" onClick={() => setRegion("All")}>
            View all branches
          </button>
        </div>
      )}
    </PageLayout>
  );
}
