import { expect, test } from '@playwright/test';

async function prepare(page) {
  await page.addInitScript(() => localStorage.setItem('unievent.auth.publico', JSON.stringify({
    token: 'public-token', user: { id: 1, email: 'public@example.com', roleUsuario: 'Aluno', tipoUsuario: 'Aluno', tipoParticipante: 'Externo' },
  })));
  const state = { cancelled: false, checkedIn: false };
  await page.route('**/api/Evento/7', route => route.fulfill({ json: {
    id: 7, nome: 'Evento de teste', descricao: 'Descricao', dataEvento: '2026-11-24T00:00:00Z',
    capacidade: 10, vagasDisponiveis: state.cancelled ? 10 : 9, publicoPermitido: 'PublicoGeral',
  } }));
  await page.route('**/api/Evento/7/minha-inscricao', route => route.fulfill({ json: {
    id: 1, eventoId: 7, statusInscricao: state.cancelled ? 'cancelada' : 'ativa', presencaGarantida: state.checkedIn,
  } }));
  await page.route('**/api/Evento/7/ingresso', route => route.fulfill({ json: {
    eventoId: 7, nomeEvento: 'Evento de teste', codigoIngresso: 'ticket-code', conteudoQrCode: 'ticket-code',
    statusInscricao: state.cancelled ? 'cancelada' : 'ativa', presencaConfirmada: state.checkedIn,
    dataEvento: '2026-11-24T00:00:00Z',
  } }));
  return state;
}

test('public participant cancels, releases the vacancy and sees the cancelled status after reload', async ({ page }) => {
  const state = await prepare(page);
  await page.route('**/api/Evento/7/inscricao', route => {
    expect(route.request().method()).toBe('DELETE');
    expect(route.request().headers().authorization).toBe('Bearer public-token');
    state.cancelled = true;
    return route.fulfill({ json: { eventoId: 7, statusInscricao: 'cancelada', presencaGarantida: false } });
  });
  page.on('dialog', dialog => dialog.accept());
  await page.goto('/descobrir-eventos/7');
  await expect(page.getByText('9 de 10 vagas disponíveis')).toBeVisible();
  await page.getByRole('button', { name: 'Cancelar inscrição', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Inscrição cancelada' })).toBeVisible();
  await expect(page.getByText('10 de 10 vagas disponíveis')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Ver meu ingresso' })).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Inscrição cancelada' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Cancelar inscrição', exact: true })).toHaveCount(0);
});

test('failed cancellation preserves the registration and shows the error', async ({ page }) => {
  await prepare(page);
  await page.route('**/api/Evento/7/inscricao', route => route.fulfill({ status: 400, json: ['Não foi possível cancelar.'] }));
  page.on('dialog', dialog => dialog.accept());
  await page.goto('/descobrir-eventos/7');
  await page.getByRole('button', { name: 'Cancelar inscrição', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Não foi possível cancelar.');
  await expect(page.getByRole('heading', { name: 'Você já está inscrito' })).toBeVisible();
});

test('ticket cancellation hides its QR code and checked-in tickets cannot be cancelled', async ({ page }) => {
  const state = await prepare(page);
  await page.route('**/api/Evento/7/inscricao', route => {
    state.cancelled = true;
    return route.fulfill({ json: { statusInscricao: 'cancelada' } });
  });
  page.on('dialog', dialog => dialog.accept());
  await page.goto('/meus-ingressos/7');
  await page.getByRole('button', { name: 'Cancelar inscrição', exact: true }).click();
  await expect(page.getByText('Inscrição cancelada', { exact: true })).toBeVisible();
  await expect(page.getByText('Este ingresso não pode ser usado para check-in.')).toBeVisible();
  state.cancelled = false;
  state.checkedIn = true;
  await page.reload();
  await expect(page.getByText('Check-in realizado', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Cancelar inscrição', exact: true })).toHaveCount(0);
});
