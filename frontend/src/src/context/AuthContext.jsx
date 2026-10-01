import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { authApi, clearTokens } from "../lib/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState("");

  const refreshMe = useCallback(async () => {
    try {
      const me = await authApi.me();
      setUser({
        userId: me.userId || me._id || me.id,
        username: me.username,
        email: me.email,
        createdAt: me.createdAt,
      });
      return true;
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      const ok = await refreshMe();
      if (!alive) return;
      if (!ok) {
        // No valid session — make sure stale tokens don't linger.
        const hasRefresh = Boolean(localStorage.getItem("pulseboard.refreshToken"));
        const hasAccess = Boolean(sessionStorage.getItem("pulseboard.accessToken"));
        if (!hasRefresh && !hasAccess) clearTokens();
        setUser(null);
      }
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [refreshMe]);

  const login = useCallback(async ({ email, password }) => {
    setAuthError("");
    const data = await authApi.login({ email, password });
    const me = {
      userId: data.userId || data.user?._id,
      username: data.username || data.user?.username,
      email: data.email || email,
    };
    if (me.userId || me.username) {
      setUser(me);
      refreshMe();
    } else {
      await refreshMe();
    }
    return data;
  }, [refreshMe]);

  const register = useCallback(async ({ username, email, password }) => {
    setAuthError("");
    const data = await authApi.register({ username, email, password });
    setUser({ username, email, userId: data.userId });
    await refreshMe();
    return data;
  }, [refreshMe]);

  const logout = useCallback(async () => {
    await authApi.logout();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, authError, setAuthError, login, register, logout, refreshMe }),
    [user, loading, authError, login, register, logout, refreshMe],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
