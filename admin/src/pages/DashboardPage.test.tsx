import { render, screen, waitFor, fireEvent, cleanup } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { DashboardPage } from "./DashboardPage";
import { AuthProvider } from "../auth";

const mockStats = {
  pages: 14,
  branches: 7,
  events: 10,
  upcomingEvents: 5,
  media: 42,
  sermons: 28,
  gallery: 12,
  leaders: 8,
  ministries: 6,
  enquiries: 15,
  pendingEnquiries: 4,
  users: 2,
  branchRegionsCount: 3,
};

describe("DashboardPage", () => {
  beforeEach(() => {
    sessionStorage.setItem("pcfs_actor", JSON.stringify({ id: "1", email: "admin@pcfs.org", role: "ADMIN" }));
    sessionStorage.setItem("pcfs_access_token", "fake-token");

    vi.stubGlobal("fetch", vi.fn().mockImplementation((_url, options) => {
      const body = typeof options?.body === "string" ? options.body : "";
      if (body.includes("DashboardStats")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            data: {
              dashboardStats: mockStats,
            },
          }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({
          data: {
            refresh: {
              actor: { id: "1", email: "admin@pcfs.org", role: "ADMIN" },
              accessToken: "fake-token",
            },
          },
        }),
      });
    }));
  });

  afterEach(() => {
    cleanup();
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  it("fetches and renders real-time database counts accurately", async () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <DashboardPage />
        </AuthProvider>
      </MemoryRouter>
    );

    // Verify title and page header
    expect(screen.getByRole("heading", { name: "Good to see you." })).toBeInTheDocument();

    // Verify dynamic stats load from the database query
    await waitFor(() => {
      expect(screen.getByText("7")).toBeInTheDocument(); // Branches
      expect(screen.getByText("5")).toBeInTheDocument(); // Upcoming events
      expect(screen.getByText("42")).toBeInTheDocument(); // Media
      expect(screen.getByText("14")).toBeInTheDocument(); // Pages
    });

    // Verify details text matches database stats
    expect(screen.getByText("Across 3 regions")).toBeInTheDocument();
    expect(screen.getByText("28 sermons · 12 gallery items")).toBeInTheDocument();

    // Verify high-priority pending enquiries notice banner
    expect(screen.getByText(/4 pending visitor enquiries/i)).toBeInTheDocument();
  });

  it("triggers refresh when clicking the Refresh counts button", async () => {
    const fetchSpy = vi.fn().mockImplementation((_url, options) => {
      const body = typeof options?.body === "string" ? options.body : "";
      if (body.includes("DashboardStats")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ data: { dashboardStats: mockStats } }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({
          data: {
            refresh: { actor: { id: "1", email: "admin@pcfs.org", role: "ADMIN" }, accessToken: "fake-token" },
          },
        }),
      });
    });
    vi.stubGlobal("fetch", fetchSpy);

    render(
      <MemoryRouter>
        <AuthProvider>
          <DashboardPage />
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("7")).toBeInTheDocument();
    });

    const refreshBtn = screen.getByRole("button", { name: /refresh database counts/i });
    fireEvent.click(refreshBtn);

    await waitFor(() => {
      const dashboardCalls = fetchSpy.mock.calls.filter((call) =>
        typeof call[1]?.body === "string" && call[1].body.includes("DashboardStats")
      );
      expect(dashboardCalls.length).toBeGreaterThanOrEqual(2);
    });
  });
});
