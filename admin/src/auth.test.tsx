import { render, screen, act, cleanup } from "@testing-library/react";
import { expect, it, vi, beforeEach, afterEach, describe } from "vitest";
import { AuthProvider, useAuth } from "./auth";

function TestComponent() {
  const { actor, logout } = useAuth();
  return (
    <div>
      <div data-testid="actor">{actor?.email ?? "no-actor"}</div>
      <button onClick={() => void logout()}>Manual Logout</button>
    </div>
  );
}

describe("AuthProvider Inactivity Auto-Logout", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    sessionStorage.setItem("pcfs_actor", JSON.stringify({ id: "1", email: "admin@pcfs.org", role: "ADMIN" }));
    sessionStorage.setItem("pcfs_access_token", "fake-token");

    vi.stubGlobal("fetch", vi.fn().mockImplementation((_url, options) => {
      const body = typeof options?.body === "string" ? options.body : "";
      if (body.includes("Logout")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ data: { logout: true } }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({
          data: {
            refresh: {
              actor: { id: "1", email: "admin@pcfs.org", role: "ADMIN" },
              accessToken: "new-fake-token",
            },
          },
        }),
      });
    }));
  });

  afterEach(() => {
    cleanup();
    vi.clearAllTimers();
    vi.useRealTimers();
    sessionStorage.clear();
  });

  it("shows warning toast at 9 minutes and automatically logs out at 10 minutes", async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Initial render and refresh resolve
    await act(async () => {
      await Promise.resolve();
    });

    expect(screen.getByTestId("actor").textContent).toBe("admin@pcfs.org");
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();

    // Advance 9 minutes (540,000 ms)
    act(() => {
      vi.advanceTimersByTime(9 * 60 * 1000);
    });

    // Warning dialog should appear
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    expect(screen.getByText(/Session expiring soon/i)).toBeInTheDocument();

    // Advance 1 more minute (60,000 ms) to reach 10 minutes total
    await act(async () => {
      vi.advanceTimersByTime(60 * 1000);
      await Promise.resolve();
    });

    // Session should be cleared
    expect(screen.getByTestId("actor").textContent).toBe("no-actor");
    expect(sessionStorage.getItem("pcfs_actor")).toBeNull();
    expect(sessionStorage.getItem("pcfs_access_token")).toBeNull();
  });

  it("resets inactivity timer on user activity", async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await act(async () => {
      await Promise.resolve();
    });

    // Advance 8 minutes
    act(() => {
      vi.advanceTimersByTime(8 * 60 * 1000);
    });

    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();

    // Trigger user activity event
    act(() => {
      document.dispatchEvent(new MouseEvent("mousemove"));
    });

    // Advance another 8 minutes (total 16 minutes, but last activity was at 8 minutes)
    act(() => {
      vi.advanceTimersByTime(8 * 60 * 1000);
    });

    // Still should NOT be logged out because 8 minutes since last activity < 9 minutes
    expect(screen.getByTestId("actor").textContent).toBe("admin@pcfs.org");
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });
});
