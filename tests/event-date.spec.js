import { expect, test } from '@playwright/test';
import { eventDateParts } from '../src/utils/eventDate.js';
import { formatDate } from '../src/utils/formatters.js';

test('event dates preserve Sao Paulo time across UTC midnight and repeated edits', () => {
  expect(eventDateParts('2026-11-24T00:00:00Z')).toEqual({ date: '2026-11-23', time: '21:00' });
  expect(eventDateParts('2026-11-23T18:53:00Z')).toEqual({ date: '2026-11-23', time: '15:53' });
  expect(eventDateParts('2026-11-23T15:53:00-03:00')).toEqual({ date: '2026-11-23', time: '15:53' });
  expect(eventDateParts('2026-11-23T15:53:00')).toEqual({ date: '2026-11-23', time: '15:53' });
  expect(formatDate('2026-11-24T00:00:00Z')).toBe('23/11/2026');
  expect(formatDate('2026-11-23')).toBe('23/11/2026');
});

test('editing and listing an event keeps 21:00 and 15:53 after saving and reopening', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('unievent.auth.secretaria', JSON.stringify({
    token: 'secretary-token', user: { id: 1, roleUsuario: 'Secretaria', tipoUsuario: 'UsuarioSecretaria', instituicaoId: 1 },
  })));
  let event = { id: 7, nome: 'Evento horario', descricao: 'Descricao do evento', capacidade: 10,
    responsavelEventoId: 1, categoria: 'Palestra', instituicaoId: 1, dataEvento: '2026-11-23T18:53:00Z' };
  await page.route('**/api/ResponsavelEvento', route => route.fulfill({ json: [{ id: 1, nome: 'Responsavel', instituicaoId: 1 }] }));
  await page.route('**/api/Evento', route => route.fulfill({ json: [event] }));
  await page.route('**/api/Evento/7', route => {
    if (route.request().method() === 'PUT') {
      const civil = route.request().postData().match(/name="DataEvento"\r\n\r\n([^\r\n]*)/)[1];
      event = { ...event, dataEvento: new Date(`${civil}-03:00`).toISOString() };
    }
    return route.fulfill({ json: event });
  });
  for (const time of ['21:00', '15:53']) {
    await page.goto('/instituicao/eventos/7/editar');
    await expect(page.locator('input[type="date"]')).toHaveValue('2026-11-23');
    await page.locator('input[type="time"]').fill(time);
    await page.locator('form.event-form button[type="submit"]').click();
    await page.getByRole('dialog').getByRole('button', { name: 'Ok', exact: true }).click();
    await expect(page.getByRole('cell', { name: time, exact: true })).toBeVisible();
    await page.goto('/instituicao/eventos/7/editar');
    await expect(page.locator('input[type="time"]')).toHaveValue(time);
    await expect(page.locator('input[type="date"]')).toHaveValue('2026-11-23');
  }
});
