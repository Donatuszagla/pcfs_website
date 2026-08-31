import type { ReactNode } from "react";

export interface PageLayoutProps {
  eyebrow: string;
  title: string;
  intro: string;
  children: ReactNode;
}

export function PageLayout({ eyebrow, title, intro, children }: PageLayoutProps) {
  return (
    <>
      <header className="page-hero">
        <div className="page-rail">
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p>{intro}</p>
        </div>
      </header>
      <div className="page-rail page-content">{children}</div>
    </>
  );
}
