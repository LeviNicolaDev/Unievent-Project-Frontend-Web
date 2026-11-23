import { expect, test } from '@playwright/test';

test('an open dashboard refreshes active registrations after a cancellation on another device', async ({ page }) => {
  await page.clock.install();
  await page.addInitScript(() => localStorage.setItem('unievent.auth.admin', JSON.stringify({
    token: 'admin-token', user: { id: 1, roleUsuario: 'Admin', tipoUsuario: 'UsuarioUnievent', instituicaoId: null },
  })));
  let activeRegistrations = 1;
  await page.route('**/api/admin/dashboard', route => route.fulfill({ json: {
    totalInscricoes: activeRegistrations, instituicoes: [],
  } }));
  await page.goto('/home');
  const metric = page.locator('.dashboard-metric').filter({ has: page.getByText('Inscrições', { exact: true }) }).locator('strong');
  await expect(metric).toHaveText('1');
  activeRegistrations = 0;
  await page.clock.fastForward(15000);
  await expect(metric).toHaveText('0');
});
