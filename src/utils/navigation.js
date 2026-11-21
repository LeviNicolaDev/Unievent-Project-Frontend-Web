import { AUTH_SCOPES, getAuthScopeForPath } from '../services/authSession.js';

export function getLoginReturnPath(value, scope) {
  const fallback = scope === AUTH_SCOPES.PUBLIC ? '/descobrir-eventos'
    : scope === AUTH_SCOPES.SECRETARY ? '/instituicao/dashboard' : '/home';
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//') || value.includes('\\')) return fallback;
  const url = new URL(value, 'https://unievent-web.vercel.app');
  if (url.origin !== 'https://unievent-web.vercel.app' || getAuthScopeForPath(url.pathname) !== scope) return fallback;
  if (['/login', '/entrar', '/criar-conta', '/confirmar-email', '/secretaria/cadastro'].includes(url.pathname)) return fallback;
  return `${url.pathname}${url.search}${url.hash}`;
}
