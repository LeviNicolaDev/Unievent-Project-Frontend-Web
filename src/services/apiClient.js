import { getCurrentAuthScope, readAuthSession } from './authSession.js';

const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL || '';
const configuredAssetBaseUrl = import.meta.env.VITE_API_ASSET_BASE_URL || '';

function trimTrailingSlash(value) {
  return value.replace(/\/+$/, '');
}

function getApiBaseUrl() {
  const baseUrl = trimTrailingSlash(configuredBaseUrl);

  if (!baseUrl) {
    return '/api';
  }

  return baseUrl.endsWith('/api') ? baseUrl : `${baseUrl}/api`;
}

const API_BASE_URL = getApiBaseUrl();
const API_ASSET_BASE_URL = configuredAssetBaseUrl
  ? trimTrailingSlash(configuredAssetBaseUrl)
  : API_BASE_URL.replace(/\/api$/, '');

function buildUrl(path) {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
}

function parseJson(text) {
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function getErrorMessage(errorData, status) {
  if (typeof errorData === 'string' && errorData.trim()) {
    return errorData;
  }

  if (Array.isArray(errorData)) {
    return errorData.join('\n');
  }

  if (errorData?.errors && typeof errorData.errors === 'object') {
    return Object.values(errorData.errors).flat().join('\n');
  }

  return (
    errorData?.mensagem ||
    errorData?.message ||
    errorData?.title ||
    `Erro na API: ${status}`
  );
}

export function getApiAssetUrl(path) {
  if (!path || /^https?:\/\//i.test(path) || path.startsWith('blob:') || path.startsWith('data:')) {
    return path || '';
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_ASSET_BASE_URL}${normalizedPath}`;
}

export async function request(path, options = {}) {
  const { skipAuth = false, authScope, responseType, ...fetchOptions } = options;
  const scope = authScope || getCurrentAuthScope();
  const token = readAuthSession(scope)?.token;
  
  const headers = {
    ...fetchOptions.headers,
  };

  // Adicionar Authorization header se houver token
  if (token && !skipAuth) {
    headers.Authorization = `Bearer ${token}`;
  }

  // Adicionar Content-Type apenas se não for FormData
  if (fetchOptions.body && !(fetchOptions.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(buildUrl(path), {
    ...fetchOptions,
    headers,
  });

  // Tratar resposta
  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    const errorData = parseJson(errorText);
    const errorMessage =
      response.status === 401
        ? 'Sessão expirada ou não autorizada. Faça login novamente.'
        : getErrorMessage(errorData, response.status);
    
    const error = new Error(errorMessage);
    error.status = response.status;
    error.data = errorData;
    throw error;
  }

  // Tentar parsear JSON
  if (responseType === 'response') return response;
  const text = await response.text();
  return parseJson(text);
}
