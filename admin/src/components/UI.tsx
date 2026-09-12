import React from "react";
import { Link } from "react-router-dom";
import { Sparkle, SpinnerGap } from "@phosphor-icons/react";

export function PageTitle({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: React.ReactNode }) {
  return (
    <header className="page-title">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </header>
  );
}

export function FullScreenStatus({ label }: { label: string }) {
  return (
    <main className="full-status">
      <SpinnerGap className="spin" />
      <p>{label}</p>
    </main>
  );
}

export function InlineStatus({ label }: { label: string }) {
  return (
    <div className="inline-status" role="status">
      <SpinnerGap className="spin" />
      {label}
    </div>
  );
}

export function EmptyState({ kind, editable, href, onClickCreate }: { kind: string; editable: boolean; href?: string; onClickCreate?: () => void }) {
  return (
    <section className="empty-state">
      <Sparkle weight="duotone" />
      <h2>No {kind.toLowerCase()} found</h2>
      <p>{editable ? "Create the first record or adjust your search." : "New submissions will appear here automatically."}</p>
      {editable && (onClickCreate ? <button className="button primary" onClick={onClickCreate}>Create new</button> : <Link className="button primary" to={href || "#"}>Create new</Link>)}
    </section>
  );
}
