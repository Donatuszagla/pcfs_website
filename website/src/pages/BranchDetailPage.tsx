import { MapPin } from "@phosphor-icons/react";
import { Link, useParams } from "react-router-dom";
import { PageLayout } from "../components/PageLayout";
import type { Branch } from "../types";
import { NotFoundPage } from "./NotFoundPage";

export interface BranchDetailPageProps {
  branches: Branch[];
}

export function BranchDetailPage({ branches }: BranchDetailPageProps) {
  const { slug } = useParams();
  const branch = branches.find((item) => item.slug === slug);
  if (!branch) return <NotFoundPage />;
  return (
    <PageLayout eyebrow={branch.region} title={branch.name} intro={branch.description}>
      <div className="detail-grid">
        <img src={branch.image} alt="Temporary branch building photography" />
        <div>
          <h2>Visit this branch</h2>
          <p>
            <MapPin aria-hidden />
            {branch.location}
          </p>
          <p>{branch.serviceTimes ?? "Service times pending confirmation."}</p>
          {branch.directionsUrl ? (
            <a className="button" href={branch.directionsUrl}>
              Get directions
            </a>
          ) : (
            <Link className="button" to="/contact">
              Ask for directions
            </Link>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
