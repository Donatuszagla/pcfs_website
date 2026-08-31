import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { App } from "./App";
import { fallbackSiteData } from "./data";

beforeAll(() => { window.scrollTo = vi.fn(); });

describe("PCFS public website", () => {
  it("renders the approved homepage message and primary actions", () => {
    render(<MemoryRouter initialEntries={["/"]}><App data={fallbackSiteData} /></MemoryRouter>);
    expect(screen.getByRole("heading", { name: /welcome to paradise city/i })).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Plan a Visit" }).length).toBeGreaterThan(0);
    expect(screen.getByText("FIGHT THE GOOD FIGHT!")).toBeInTheDocument();
  });

  it("renders a clear 404 state for unknown routes", () => {
    render(<MemoryRouter initialEntries={["/missing"]}><App data={fallbackSiteData} /></MemoryRouter>);
    expect(screen.getByRole("heading", { name: /couldn’t find/i })).toBeInTheDocument();
  });
});
