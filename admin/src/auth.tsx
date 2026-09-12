import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { graphqlRequest, operations, type Actor } from "./graphql";
import { logger } from "./utils/logger";

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
    try {
      await graphqlRequest(operations.logout, undefined, accessToken);
      logger.success("Logout confirmed by backend");
    } catch (err) {
      logger.warn("Logout", "Backend logout request failed, clearing local session anyway", err);
    }
    clearSession();
  }, [accessToken, actor]);

  const value = useMemo(() => ({ actor, accessToken, loading, login, logout }), [actor, accessToken, loading, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// The hook intentionally shares its module with the provider so session logic remains atomic.
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
