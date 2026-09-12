import React, { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Church, List, SignOut, Sparkle, X } from "@phosphor-icons/react";
import { useAuth } from "../auth";
import { contentSections } from "../constants/contentSections";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { actor, logout } = useAuth();
  const location = useLocation();
  const [drawer, setDrawer] = useState(false);

  useEffect(() => setDrawer(false), [location.pathname]);

  return (
    <div className="admin-layout">
      <aside className={drawer ? "sidebar open" : "sidebar"}>
        <div className="sidebar-brand">
          <img src="/PCFS LOGO.png" alt="PCFS LOGO" width={100} height={100}/>
          <span>
            <strong>PCFS</strong>
            <small>Administration</small>
          </span>
          <button className="icon-button mobile-close" onClick={() => setDrawer(false)} aria-label="Close navigation">
            <X />
          </button>
        </div>
        <nav>
          <NavLink to="/" end>
            <Sparkle />Overview
          </NavLink>
          {contentSections.map(({ kind, label, icon: Icon }) => (
            <NavLink key={kind} to={`/content/${kind.toLowerCase()}`}>
              <Icon />{label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-user">
          <span>{actor?.email}</span>
          <small>{actor?.role.replaceAll("_", " ")}</small>
          <button onClick={() => void logout()}>
            <SignOut />Sign out
          </button>
        </div>
      </aside>
      <div className="admin-main">
        <header className="topbar">
          <button className="icon-button menu-button" onClick={() => setDrawer(true)} aria-label="Open navigation">
            <List />
          </button>
          <div>
            <span className="eyebrow">CONTENT MANAGEMENT</span>
            <strong>Paradise City of Faith Sanctuary</strong>
          </div>
          <a href="http://localhost:4173" target="_blank" rel="noreferrer" className="button secondary">
            View website
          </a>
        </header>
        <main className="admin-content">{children}</main>
      </div>
      {drawer && <button className="drawer-scrim" onClick={() => setDrawer(false)} aria-label="Close navigation" />}
    </div>
  );
}
