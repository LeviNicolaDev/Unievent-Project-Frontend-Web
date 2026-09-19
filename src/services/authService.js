import { request } from "./apiClient.js";
import {
  getCurrentAuthScope,
  readAuthSession,
  removeAuthSession,
} from "./authSession.js";

const USER_UNIEVENT_TYPE = "UsuarioUnievent";
const USER_SECRETARY_TYPE = "UsuarioSecretaria";
const STUDENT_USER_TYPE = "Aluno";
const ADMINISTRATIVE_USER_TYPES = [USER_UNIEVENT_TYPE, USER_SECRETARY_TYPE];
const ADMINISTRATIVE_ROLES = ["Admin", "Secretaria"];
const PARTICIPANT_ROLES = ["Aluno"];
const ROLE_CLAIM = "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";
const EMAIL_CLAIM = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress";
const ID_CLAIM = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier";

function decodeJwtPayload(token) {
  const [, payload] = String(token || "").split(".");

  if (!payload) {
    return {};
  }

  try {
    const normalizedPayload = payload
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(Math.ceil(payload.length / 4) * 4, "=");
    const json = decodeURIComponent(
      atob(normalizedPayload)
        .split("")
        .map((char) => `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join(""),
    );

    return JSON.parse(json);
  } catch {
    return {};
  }
}

function createUserFromToken(token, fallbackEmail) {
  const claims = decodeJwtPayload(token);
  const roleClaim = claims[ROLE_CLAIM] || claims.role || claims.roles;
  const roleUsuario = Array.isArray(roleClaim) ? roleClaim[0] : roleClaim;
  const emailUsuario = claims[EMAIL_CLAIM] || claims.email || fallbackEmail;
  const id = claims[ID_CLAIM] || claims.nameid || claims.sub;
  const instituicaoId = claims.instituicao_id ? Number(claims.instituicao_id) : null;
  const tipoUsuario =
    claims.tipo_usuario ||
    (roleUsuario === "Aluno"
      ? STUDENT_USER_TYPE
      : roleUsuario === "Admin" && !instituicaoId
        ? USER_UNIEVENT_TYPE
        : USER_SECRETARY_TYPE);
  const statusUsuario = claims.status_usuario || claims.statusUsuario || null;
  const tipoParticipante = claims.tipo_participante || claims.tipoParticipante || null;

  return {
    id: id ? Number(id) : null,
    email: emailUsuario,
    emailUsuario,
    roleUsuario,
    instituicaoId,
    tipoUsuario,
    tipoParticipante,
    statusUsuario,
  };
}

function normalizeText(value) {
  return String(value || "").trim().toLowerCase();
}

export async function loginAdmin(email, password) {
  const response = await request("/Auth/login", {
    method: "POST",
    body: JSON.stringify({
      email,
      senha: password,
    }),
    headers: {
      "Content-Type": "application/json",
    },
    skipAuth: true,
  });
  const token = typeof response === "string" ? response : response?.token;

  if (!token) {
    throw new Error("Token de autenticação não recebido pela API");
  }

  const user = createUserFromToken(token, email);

  if (!isAdministrativeUser(user)) {
    throw new Error("Apenas usuários administrativos podem acessar este sistema");
  }

  return {
    token,
    user,
  };
}

export async function loginPublic(email, password) {
  const response = await request("/Auth/login-publico", {
    method: "POST",
    body: JSON.stringify({
      email,
      senha: password,
    }),
    headers: {
      "Content-Type": "application/json",
    },
    skipAuth: true,
  });
  const token = typeof response === "string" ? response : response?.token;

  if (!token) {
    throw new Error("Token de autenticação não recebido pela API");
  }

  const user = createUserFromToken(token, email);
  if (!isPublicParticipant(user)) {
    throw new Error("Este login é exclusivo para público geral");
  }

  return {
    token,
    user,
  };
}

export async function registerPublic(payload) {
  return request("/Auth/cadastro-publico", {
    method: "POST",
    body: JSON.stringify({
      nome: payload.name || payload.nome,
      email: payload.email,
      senha: payload.password || payload.senha,
      confirmacaoSenha: payload.confirmPassword || payload.confirmacaoSenha,
    }),
    skipAuth: true,
  });
}

export function logout(scope = getCurrentAuthScope()) {
  removeAuthSession(scope);
}

export function getStoredToken(scope = getCurrentAuthScope()) {
  return readAuthSession(scope)?.token || null;
}

export function getStoredUser(scope = getCurrentAuthScope()) {
  return readAuthSession(scope)?.user || null;
}

export function isUserAdmin(user) {
  return isAdministrativeUser(user);
}

export function isUserSecretary(user) {
  return isAdministrativeUser(user);
}

export function isAdministrativeUser(user) {
  const tipoUsuario = normalizeText(user?.tipoUsuario);
  const roleUsuario = normalizeText(user?.roleUsuario);

  return (
    ADMINISTRATIVE_USER_TYPES.map(normalizeText).includes(tipoUsuario) &&
    ADMINISTRATIVE_ROLES.map(normalizeText).includes(roleUsuario)
  );
}

export function isPublicParticipant(user) {
  const tipoUsuario = normalizeText(user?.tipoUsuario);
  const roleUsuario = normalizeText(user?.roleUsuario);
  const tipoParticipante = normalizeText(user?.tipoParticipante);

  return (
    tipoUsuario === normalizeText(STUDENT_USER_TYPE) &&
    PARTICIPANT_ROLES.map(normalizeText).includes(roleUsuario) &&
    tipoParticipante === "externo"
  );
}

export function isAuthenticatedUser(user) {
  return isAdministrativeUser(user) || isPublicParticipant(user);
}
