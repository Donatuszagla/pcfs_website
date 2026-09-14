import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { graphqlRequest, operations, type Actor } from "./graphql";
import { logger } from "./utils/logger";

const INACTIVITY_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes
const WARNING_BEFORE_MS = 60 * 1000;           // show warning 60 s before logout

interface AuthContextValue { actor?: Actor; accessToken?: string; loading: boolean; login(email: string, password: string): Promise<void>; logout(): Promise<void> }
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [actor, setActor] = useState<Actor | undefined>(() => {
    try {
      const stored = sessionStorage.getItem("pcfs_actor");
      return stored ? (JSON.parse(stored) as Actor) : undefined;
    } catch {
      return undefined;
    }
  });
  const [accessToken, setAccessToken] = useState<string | undefined>(() => sessionStorage.getItem("pcfs_access_token") || undefined);
  const [loading, setLoading] = useState(true);
  const [showInactivityWarning, setShowInactivityWarning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(60);

  // Refs so timers can reference latest logout without stale closures
  const inactivityTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const logoutRef = useRef<() => Promise<void>>(() => Promise.resolve());

  const saveSession = (newActor: Actor, newToken: string) => {
    logger.action(`User session saved: ${newActor.email} (${newActor.role})`);
    setActor(newActor);
    setAccessToken(newToken);
    try {
      sessionStorage.setItem("pcfs_actor", JSON.stringify(newActor));
      sessionStorage.setItem("pcfs_access_token", newToken);
    } catch (err) {
      logger.warn("SessionStorage", "Failed to store session tokens", err);
    }
  };

  const clearSession = () => {
    logger.action("User session cleared");
    setActor(undefined);
    setAccessToken(undefined);
    try {
      sessionStorage.removeItem("pcfs_actor");
      sessionStorage.removeItem("pcfs_access_token");
    } catch (err) {
      logger.warn("SessionStorage", "Failed to clear session tokens", err);
    }
  };

  useEffect(() => {
    logger.action("Restoring user session via refresh token...");
    graphqlRequest<{ refresh: { actor: Actor; accessToken: string } }>(operations.refresh, undefined, accessToken)
      .then(({ refresh }) => {
        logger.success(`Session restored for ${refresh.actor.email}`);
        saveSession(refresh.actor, refresh.accessToken);
      })
      .catch(() => {
        logger.info("No active refresh session found or token expired");
        if (!accessToken) clearSession();
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    logger.action(`Login attempt for: ${email}`);
    try {
      const { login: result } = await graphqlRequest<{ login: { actor: Actor; accessToken: string } }>(operations.login, { data: { email, password } });
      logger.success(`Login successful for ${result.actor.email}`);
      saveSession(result.actor, result.accessToken);
    } catch (err) {
      logger.error(`Login failed for ${email}`, err);
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    logger.action(`Logging out user ${actor?.email ?? ""}`);
    // Clear all inactivity timers on explicit logout
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    if (warningTimer.current) clearTimeout(warningTimer.current);
    if (countdownInterval.current) clearInterval(countdownInterval.current);
    setShowInactivityWarning(false);
    try {
      await graphqlRequest(operations.logout, undefined, accessToken);
      logger.success("Logout confirmed by backend");
    } catch (err) {
      logger.warn("Logout", "Backend logout request failed, clearing local session anyway", err);
    }
    clearSession();
  }, [accessToken, actor]);

  // Keep logoutRef current so inactivity handler can call latest logout
  useEffect(() => {
    logoutRef.current = logout;
  }, [logout]);

  // ---- Inactivity timer logic ----
  const clearAllTimers = useCallback(() => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    if (warningTimer.current) clearTimeout(warningTimer.current);
    if (countdownInterval.current) clearInterval(countdownInterval.current);
    inactivityTimer.current = null;
    warningTimer.current = null;
    countdownInterval.current = null;
  }, []);

  const startInactivityTimer = useCallback(() => {
    clearAllTimers();
    setShowInactivityWarning(false);

    // Show warning at 9 minutes
    warningTimer.current = setTimeout(() => {
      logger.warn("InactivityTimer", "User has been inactive for 9 minutes — showing warning");
      setSecondsLeft(60);
      setShowInactivityWarning(true);

      // Countdown every second
      countdownInterval.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            if (countdownInterval.current) clearInterval(countdownInterval.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, INACTIVITY_TIMEOUT_MS - WARNING_BEFORE_MS);

    // Auto-logout at 10 minutes
    inactivityTimer.current = setTimeout(() => {
      logger.action("Auto-logout: 10 minutes of inactivity");
      setShowInactivityWarning(false);
      void logoutRef.current();
    }, INACTIVITY_TIMEOUT_MS);
  }, [clearAllTimers]);

  // Reset timer on any user activity
  const handleActivity = useCallback(() => {
    if (showInactivityWarning) setShowInactivityWarning(false);
    startInactivityTimer();
  }, [startInactivityTimer, showInactivityWarning]);

  // Attach / detach activity listeners when authenticated
  useEffect(() => {
    if (!actor || loading) return;

    const events: (keyof DocumentEventMap)[] = ["mousemove", "mousedown", "keydown", "touchstart", "scroll", "wheel", "click", "focus"];
    const throttled = (() => {
      let lastCall = 0;
      return () => {
        const now = Date.now();
        if (now - lastCall > 10_000) { // throttle to max once every 10 s
          lastCall = now;
          handleActivity();
        }
      };
    })();

    startInactivityTimer();
    events.forEach((e) => document.addEventListener(e, throttled, { passive: true }));
    return () => {
      clearAllTimers();
      events.forEach((e) => document.removeEventListener(e, throttled));
    };
  }, [actor, loading]); // eslint-disable-line react-hooks/exhaustive-deps

  const value = useMemo(() => ({ actor, accessToken, loading, login, logout }), [actor, accessToken, loading, login, logout]);

  return (
    <AuthContext.Provider value={value}>
      {children}

      {/* Inactivity Warning Toast */}
      {showInactivityWarning && (
        <div
          role="alertdialog"
          aria-live="assertive"
          aria-label="Session about to expire"
          style={{
            position: "fixed",
            bottom: "24px",
            right: "24px",
            zIndex: 99999,
            background: "white",
            border: "2px solid #f59e0b",
            borderRadius: "12px",
            boxShadow: "0 8px 32px rgba(9,20,48,.22)",
            padding: "18px 22px",
            maxWidth: "340px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            animation: "modalPop 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "22px" }}>⏱️</span>
            <div>
              <strong style={{ display: "block", fontSize: "14px", color: "#92400e" }}>
                Session expiring soon
              </strong>
              <span style={{ fontSize: "13px", color: "#78716c" }}>
                You'll be logged out in{" "}
                <strong style={{ color: "#b45309" }}>{secondsLeft}s</strong> due to inactivity.
              </span>
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
            <button
              type="button"
              onClick={() => void logout()}
              style={{
                padding: "6px 14px", borderRadius: "6px", border: "1px solid #d1d5db",
                background: "white", cursor: "pointer", fontSize: "13px", color: "#374151",
              }}
            >
              Logout now
            </button>
            <button
              type="button"
              onClick={handleActivity}
              style={{
                padding: "6px 16px", borderRadius: "6px", border: "none",
                background: "#f59e0b", cursor: "pointer", fontSize: "13px",
                fontWeight: 700, color: "white",
              }}
            >
              Stay logged in
            </button>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
}

// The hook intentionally shares its module with the provider so session logic remains atomic.
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
