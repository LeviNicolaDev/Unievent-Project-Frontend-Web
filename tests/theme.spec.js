import { expect, test } from '@playwright/test';

test('restores the saved light theme on direct public access and reload', async ({ page }) => {
  await page.goto('/entrar');
  await expect(page.locator('body')).not.toHaveClass(/light-mode/);

  await page.evaluate(() => localStorage.setItem('theme', 'light'));
  await page.reload();
  await expect(page.locator('body')).toHaveClass(/light-mode/);

  await page.goto('/criar-conta');
  await expect(page.locator('body')).toHaveClass(/light-mode/);
  await page.reload();
  await expect(page.locator('body')).toHaveClass(/light-mode/);

  await page.evaluate(() => localStorage.setItem('theme', 'dark'));
  await page.reload();
  await expect(page.locator('body')).not.toHaveClass(/light-mode/);
});

test('dashboard table text follows the selected theme', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('theme', 'light');
    localStorage.setItem('unievent.auth.secretaria', JSON.stringify({
      token: 'secretary-token',
      user: { id: 1, roleUsuario: 'Secretaria', tipoUsuario: 'UsuarioSecretaria', instituicaoId: 1 },
    }));
  });
  await page.route('**/instituicao/dashboard', route => {
    if (route.request().resourceType() === 'document') return route.continue();
    return route.fulfill({ json: {
      instituicaoNome: 'Instituicao de teste',
      metricasPorEvento: [{ id: 1, nome: 'Evento de teste', dataEvento: '2026-12-10', inscricoes: 10, presentes: 8, ausentes: 2, certificadosEmitidos: 8, taxaComparecimento: 80 }],
    } });
  });
  await page.goto('/instituicao/dashboard');
  const cell = page.getByRole('cell', { name: 'Evento de teste', exact: true });
  await expect(cell).toBeVisible();
  await expect(cell).toHaveCSS('color', 'rgb(37, 37, 37)');
  await page.locator('.admin-theme-toggle').click();
  await expect(cell).toHaveCSS('color', 'rgb(255, 255, 255)');
  await page.locator('.admin-theme-toggle').click();
  await expect(cell).toHaveCSS('color', 'rgb(37, 37, 37)');
});
