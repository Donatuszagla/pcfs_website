import { Church } from "@phosphor-icons/react";

export interface EmptyStateProps {
  title: string;
  body: string;
}

export function EmptyState({ title, body }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <Church size={44} aria-hidden />
      <h2>{title}</h2>
      <p>{body}</p>
    </div>
  );
}
