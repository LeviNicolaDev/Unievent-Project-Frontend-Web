import { request } from './apiClient.js';

function unwrapResponse(response) {
  return response?.data || response;
}

function normalizeUserUnievent(user) {
  if (!user) return null;

  return {
    ...user,
    id: user.id ?? user.Id,
    tipoUsuario: 'UsuarioUnievent',
    nome: user.nomeUsuario || user.NomeUsuario || user.nome,
    email: user.emailUsuario || user.EmailUsuario || user.email,
    nomeUsuario: user.nomeUsuario || user.NomeUsuario || user.nome,
    emailUsuario: user.emailUsuario || user.EmailUsuario || user.email,
    roleUsuario: user.roleUsuario || user.RoleUsuario || 'Admin',
    instituicaoId: null,
    isAtivo: Boolean(user.isAtivo ?? user.IsAtivo ?? true),
  };
}

function toUserUnieventPayload(payload) {
  return {
    NomeUsuario: payload.nomeUsuario || payload.nome || payload.name,
    EmailUsuario: payload.emailUsuario || payload.email,
    Senha: payload.senha || payload.password,
    Chave: payload.chave || payload.key || '',
  };
}

export async function saveInitialAdminUnievent(payload) {
  const response = await request('/UsuarioUnievent/admin-inicial', {
    method: 'POST',
    body: JSON.stringify(toUserUnieventPayload(payload)),
    headers: { 'Content-Type': 'application/json' },
    skipAuth: true,
  });

  return normalizeUserUnievent(unwrapResponse(response));
}
