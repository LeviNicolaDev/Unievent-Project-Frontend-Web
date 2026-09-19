import { expect, test } from '@playwright/test';

test('menu móvel abre pelo teclado, alterna preferências e fecha com Escape e navegação', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const nav = page.getByRole('navigation');
  const toggle = nav.getByRole('button', { name: 'Abrir menu', exact: true });
  await expect(nav.getByRole('link', { name: 'Eventos', exact: true })).not.toBeVisible();

  await toggle.focus();
  await page.keyboard.press('Enter');
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(nav.getByRole('link', { name: 'Eventos', exact: true })).toBeVisible();
  await nav.getByRole('button', { name: 'Ativar modo claro' }).click();
  await expect(page.locator('body')).toHaveClass(/light-mode/);
  await nav.getByRole('button', { name: 'Switch to English' }).click();
  await expect(nav.getByRole('link', { name: 'Secretary registration' })).toBeVisible();

  await page.keyboard.press('Escape');
  const englishToggle = nav.getByRole('button', { name: 'Open menu', exact: true });
  await expect(englishToggle).toBeFocused();
  await expect(englishToggle).toHaveAttribute('aria-expanded', 'false');
  await expect(nav.getByRole('link', { name: 'Events', exact: true })).not.toBeVisible();

  await englishToggle.click();
  await nav.getByRole('link', { name: 'About', exact: true }).click();
  await expect(page).toHaveURL(/#sobre$/);
  await expect(englishToggle).toHaveAttribute('aria-expanded', 'false');
});

test('logout na página inicial encerra somente a sessão pública', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.addInitScript(() => {
    const publicUser = { id: 1, email: 'publico@example.com', roleUsuario: 'Aluno', tipoUsuario: 'Aluno', tipoParticipante: 'Externo', instituicaoId: null };
    const admin = { id: 2, email: 'admin@example.com', roleUsuario: 'Admin', tipoUsuario: 'UsuarioUnievent', instituicaoId: null };
    localStorage.setItem('unievent.auth.publico', JSON.stringify({ token: 'jwt-publico', user: publicUser }));
    localStorage.setItem('unievent.auth.admin', JSON.stringify({ token: 'jwt-admin', user: admin }));
  });
  await page.goto('/');
  const nav = page.getByRole('navigation');
  await expect(nav.getByRole('link', { name: 'Meus ingressos' })).toBeVisible();
  await nav.getByRole('button', { name: 'Sair', exact: true }).click();
  await expect(nav.getByRole('link', { name: 'Entrar', exact: true })).toBeVisible();
  await expect(nav.getByRole('link', { name: 'Meus ingressos' })).toHaveCount(0);
  const stored = await page.evaluate(() => ({
    publico: localStorage.getItem('unievent.auth.publico'),
    admin: localStorage.getItem('unievent.auth.admin'),
  }));
  expect(stored.publico).toBeNull();
  expect(stored.admin).not.toBeNull();
});
