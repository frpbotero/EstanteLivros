import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Api, session } from "../API/api";
import { Spinner } from "../components/ui/Spinner";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(session.hasToken());

  const logout = useCallback(() => {
    session.clear();
    setUser(null);
  }, []);

  useEffect(() => {
    session.onExpired = logout;
    if (!session.hasToken()) return;
    Api.auth
      .me()
      .then((data) => setUser(data.user))
      .catch(logout)
      .finally(() => setChecking(false));
  }, [logout]);

  const value = useMemo(() => {
    async function enter(request) {
      const data = await request;
      session.set(data.token);
      setUser(data.user);
    }
    return {
      user,
      checking,
      logout,
      login: (credentials) => enter(Api.auth.login(credentials)),
      register: (fields) => enter(Api.auth.register(fields)),
      loginWithGoogle: (idToken) => enter(Api.auth.google(idToken)),
    };
  }, [user, checking, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

export function RequireAuth({ children }) {
  const { user, checking } = useAuth();
  const location = useLocation();

  if (checking) return <Spinner />;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  return children;
}
