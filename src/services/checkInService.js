import { request } from './apiClient.js';

export function validateCheckIn(codigoIngresso) {
  return request('/Evento/check-in', {
    method: 'POST',
    body: JSON.stringify({
      codigoIngresso: codigoIngresso.trim(),
    }),
  });
}
