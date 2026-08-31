import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { graphqlRequest, operations, type Actor } from "./graphql";

interface AuthContextValue { actor?: Actor; accessToken?: string; loading: boolean; login(email: string, password: string): Promise<void>; logout(): Promise<void> }
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [actor, setActor] = useState<Actor>();
  const [accessToken, setAccessToken] = useState<string>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    graphqlRequest<{ refresh: { actor: Actor; accessToken: string } }>(operations.refresh)
      .then(({ refresh }) => { setActor(refresh.actor); setAccessToken(refresh.accessToken); })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { login: result } = await graphqlRequest<{ login: { actor: Actor; accessToken: string } }>(operations.login, { data: { email, password } });
    setActor(result.actor); setAccessToken(result.accessToken);
  }, []);
  const logout = useCallback(async () => { await graphqlRequest(operations.logout, undefined, accessToken); setActor(undefined); setAccessToken(undefined); }, [accessToken]);
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
