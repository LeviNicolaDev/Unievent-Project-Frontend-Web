import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { isAuthenticatedUser } from "../services/authService.js";
import {
  AUTH_SCOPES,
  AUTH_STORAGE_KEYS,
  getAuthScopeForPath,
  getAuthScopeForUser,
  migrateLegacyAuthSession,
  readAuthSession,
  removeAuthSession,
  writeAuthSession,
} from "../services/authSession.js";

const AuthContext = createContext(null);

const EMPTY_SESSIONS = {
  [AUTH_SCOPES.ADMIN]: null,
  [AUTH_SCOPES.SECRETARY]: null,
  [AUTH_SCOPES.PUBLIC]: null,
};

function readValidatedSession(scope) {
  const session = readAuthSession(scope);
  if (
    !session ||
    !isAuthenticatedUser(session.user) ||
    getAuthScopeForUser(session.user) !== scope
  ) {
    if (session) removeAuthSession(scope);
    return null;
  }

  return session;
}

function loadSessions() {
  migrateLegacyAuthSession();
  return Object.values(AUTH_SCOPES).reduce(
    (sessions, scope) => ({ ...sessions, [scope]: readValidatedSession(scope) }),
    { ...EMPTY_SESSIONS },
  );
}

export function AuthProvider({ children }) {
  const location = useLocation();
  const [sessions, setSessions] = useState(loadSessions);
  const [error, setError] = useState(null);
  const activeScope = getAuthScopeForPath(location.pathname);
  const activeSession = sessions[activeScope];
  const user = activeSession?.user || null;
  const token = activeSession?.token || null;

  useEffect(() => {
    function synchronizeSession(event) {
      const scope = Object.keys(AUTH_STORAGE_KEYS).find(
        (candidate) => AUTH_STORAGE_KEYS[candidate] === event.key,
      );

      if (scope) {
        setSessions((current) => ({
          ...current,
          [scope]: readValidatedSession(scope),
        }));
      }
    }

    window.addEventListener("storage", synchronizeSession);
    return () => window.removeEventListener("storage", synchronizeSession);
  }, []);

  const login = useCallback((userData, authToken) => {
    const scope = getAuthScopeForUser(userData);

    if (!scope || !authToken || !isAuthenticatedUser(userData)) {
      setError("Sessão inválida. Faça login novamente.");
      return false;
    }

    const session = { token: authToken, user: userData };
    writeAuthSession(scope, session);
    setSessions((current) => ({ ...current, [scope]: session }));

    setError(null);
    return true;
  }, []);

  const logout = useCallback((scope = activeScope) => {
    removeAuthSession(scope);
    setSessions((current) => ({ ...current, [scope]: null }));
    setError(null);
  }, [activeScope]);

  const isAuthenticated = !!token && isAuthenticatedUser(user);

  const value = useMemo(
    () => ({
      user,
      token,
      activeScope,
      sessions,
      isLoading: false,
      error,
      isAuthenticated,
      login,
      logout,
      setError,
    }),
    [user, token, activeScope, sessions, error, isAuthenticated, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }
  return context;
}
