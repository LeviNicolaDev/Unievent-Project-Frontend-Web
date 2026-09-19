export const AUTH_SCOPES = Object.freeze({
  ADMIN: "admin",
  SECRETARY: "secretaria",
  PUBLIC: "publico",
});

export const AUTH_STORAGE_KEYS = Object.freeze({
  [AUTH_SCOPES.ADMIN]: "unievent.auth.admin",
  [AUTH_SCOPES.SECRETARY]: "unievent.auth.secretaria",
  [AUTH_SCOPES.PUBLIC]: "unievent.auth.publico",
});

const LEGACY_TOKEN_KEY = "authToken";
const LEGACY_USER_KEY = "authUser";

function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

export function getAuthScopeForUser(user) {
  const role = normalize(user?.roleUsuario);
  const type = normalize(user?.tipoUsuario);
  const participantType = normalize(user?.tipoParticipante);

  if (role === "admin" && !user?.instituicaoId) {
    return AUTH_SCOPES.ADMIN;
  }

  if (role === "secretaria" && Boolean(user?.instituicaoId)) {
    return AUTH_SCOPES.SECRETARY;
  }

  if (role === "aluno" && type === "aluno" && participantType === "externo") {
    return AUTH_SCOPES.PUBLIC;
  }

  return null;
}

export function getAuthScopeForPath(pathname = "/") {
  const path = String(pathname || "/").toLowerCase();

  if (path === "/instituicao" || path.startsWith("/instituicao/")) {
    return AUTH_SCOPES.SECRETARY;
  }

  if (
    path === "/" ||
    path === "/entrar" ||
    path === "/criar-conta" ||
    path === "/descobrir-eventos" ||
    path.startsWith("/descobrir-eventos/") ||
    path === "/meus-ingressos" ||
    path.startsWith("/meus-ingressos/")
  ) {
    return AUTH_SCOPES.PUBLIC;
  }

  return AUTH_SCOPES.ADMIN;
}

export function readAuthSession(scope) {
  const key = AUTH_STORAGE_KEYS[scope];
  if (!key) return null;

  try {
    const stored = localStorage.getItem(key);
    if (!stored) return null;

    const session = JSON.parse(stored);
    if (!session?.token || !session?.user) return null;

    return session;
  } catch {
    return null;
  }
}

export function writeAuthSession(scope, session) {
  const key = AUTH_STORAGE_KEYS[scope];
  if (!key || !session?.token || !session?.user) return false;

  localStorage.setItem(key, JSON.stringify({
    token: session.token,
    user: session.user,
  }));
  return true;
}

export function removeAuthSession(scope) {
  const key = AUTH_STORAGE_KEYS[scope];
  if (key) localStorage.removeItem(key);
}

export function migrateLegacyAuthSession() {
  const legacyToken = localStorage.getItem(LEGACY_TOKEN_KEY);
  const legacyUser = localStorage.getItem(LEGACY_USER_KEY);

  if (legacyToken && legacyUser) {
    try {
      const user = JSON.parse(legacyUser);
      const scope = getAuthScopeForUser(user);

      if (scope && !readAuthSession(scope)) {
        writeAuthSession(scope, { token: legacyToken, user });
      }
    } catch {
      // Dados antigos inválidos são apenas descartados abaixo.
    }
  }

  localStorage.removeItem(LEGACY_TOKEN_KEY);
  localStorage.removeItem(LEGACY_USER_KEY);
}

export function getCurrentAuthScope() {
  return getAuthScopeForPath(globalThis.location?.pathname || "/");
}
