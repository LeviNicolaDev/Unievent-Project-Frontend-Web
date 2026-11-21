import { request } from './apiClient.js';

export function requestPasswordRecovery(email, perfil) {
  return request('/Auth/solicitar-recuperacao-senha', {
    method: 'POST', skipAuth: true, body: JSON.stringify({ email, perfil }),
  });
}

export function resetPassword(token, senha, confirmacaoSenha) {
  return request('/Auth/redefinir-senha', {
    method: 'POST', skipAuth: true, body: JSON.stringify({ token, senha, confirmacaoSenha }),
  });
}
