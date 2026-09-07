import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { graphqlRequest, operations, type Actor } from "./graphql";

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
    setActor(newActor);
    setAccessToken(newToken);
    try {
      sessionStorage.setItem("pcfs_actor", JSON.stringify(newActor));
      sessionStorage.setItem("pcfs_access_token", newToken);
    } catch {
      // Session storage fallback
    }
  };

  const clearSession = () => {
    setActor(undefined);
    setAccessToken(undefined);
    try {
      sessionStorage.removeItem("pcfs_actor");
      sessionStorage.removeItem("pcfs_access_token");
    } catch {
      // Session storage fallback
    }
  };

  useEffect(() => {
    graphqlRequest<{ refresh: { actor: Actor; accessToken: string } }>(operations.refresh, undefined, accessToken)
      .then(({ refresh }) => { saveSession(refresh.actor, refresh.accessToken); })
      .catch(() => {
        // If refresh fails and token expired, clear invalid session
        if (!accessToken) clearSession();
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { login: result } = await graphqlRequest<{ login: { actor: Actor; accessToken: string } }>(operations.login, { data: { email, password } });
    saveSession(result.actor, result.accessToken);
  }, []);

  const logout = useCallback(async () => {
    try { await graphqlRequest(operations.logout, undefined, accessToken); } catch {}
    clearSession();
  }, [accessToken]);

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
