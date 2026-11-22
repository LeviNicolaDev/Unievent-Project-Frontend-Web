import { expect, test } from '@playwright/test';

test('cadastro público orienta ativação e não inicia sessão', async ({ page }) => {
  await page.route('**/api/Auth/cadastro-publico', route => route.fulfill({
    json: { id: 1, emailConfirmado: false },
  }));
  await page.goto('/criar-conta');
  await page.getByPlaceholder('Seu nome').fill('Pessoa Pública');
  await page.getByPlaceholder('voce@email.com').fill('publico@example.com');
  await page.getByPlaceholder('Sua senha', { exact: true }).fill('senha123');
  await page.getByPlaceholder('Repita sua senha', { exact: true }).fill('senha123');
  await page.getByRole('button', { name: 'Criar conta', exact: true }).last().click();
  await expect(page.getByText('Conta criada. Enviamos um e-mail de confirmação.', { exact: false })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('unievent.auth.publico'))).toBeNull();
});

for (const [path, endpoint, scope] of [
  ['/entrar', 'login-publico', 'publico'], ['/login', 'login', 'admin'],
]) {
  test(`login ${scope} avisa envio automático sem botão de reenvio`, async ({ page }) => {
    await page.route(`**/api/Auth/${endpoint}`, route => route.fulfill({
      status: 401, json: { code: 'EMAIL_CONFIRMATION_SENT', mensagem: 'Enviamos um e-mail de confirmação para seu e-mail.' },
    }));
    let resendCalls = 0;
    await page.route('**/api/Email/reenviar-confirmacao', route => {
      resendCalls++;
      return route.fulfill({ json: {} });
    });
    await page.goto(path);
    await page.locator('input[type=email]').fill('pessoa@example.com');
    await page.locator('input[type=password]').fill('senha123');
    await page.locator('button[type=submit]').click();
    await expect(page.locator('.auth-success-message')).toHaveText('Enviamos um e-mail de confirmação para seu e-mail.');
    await expect(page.getByRole('button', { name: /reenviar/i })).toHaveCount(0);
    expect(resendCalls).toBe(0);
    expect(await page.evaluate(key => localStorage.getItem(key), `unievent.auth.${scope}`)).toBeNull();
  });
}

test('falha de SMTP não apresenta aviso de envio bem-sucedido', async ({ page }) => {
  await page.route('**/api/Auth/login-publico', route => route.fulfill({
    status: 401, json: ['Não foi possível enviar a confirmação de e-mail. Tente novamente.'],
  }));
  await page.goto('/entrar');
  await page.locator('input[type=email]').fill('pessoa@example.com');
  await page.locator('input[type=password]').fill('senha123');
  await page.locator('button[type=submit]').click();
  await expect(page.locator('.auth-error-message')).toContainText('Não foi possível enviar');
  await expect(page.locator('.auth-success-message')).toHaveCount(0);
});

test('confirmação pública oferece o login público', async ({ page }) => {
  await page.route('**/api/Email/confirmar-conta', route => route.fulfill({
    json: { mensagem: 'E-mail confirmado com sucesso.', tipoUsuario: 'Publico' },
  }));
  await page.goto('/confirmar-email?chave=teste-publico');
  await expect(page.getByText('E-mail confirmado com sucesso.')).toBeVisible();
  await expect(page.locator('a.auth-submit')).toHaveAttribute('href', '/entrar');
});

test('cadastro admin delega envio e geração de chave à API', async ({ page }) => {
  let payload;
  let clientEmailSends = 0;
  await page.route('**/api/UsuarioUnievent/admin-inicial', route => {
    payload = route.request().postDataJSON();
    return route.fulfill({ json: { id: 1, emailConfirmado: false } });
  });
  await page.route('**/api/Email/enviar-email-confirmacao-conta', route => {
    clientEmailSends++;
    return route.fulfill({ json: true });
  });
  await page.goto('/login');
  await page.getByRole('button', { name: 'Cadastro Admin UniEvent', exact: true }).click();
  await page.locator('input').nth(0).fill('Admin');
  await page.locator('input[type=email]').fill('admin@aluno.cps.sp.gov.br');
  await page.locator('input[type=password]').nth(0).fill('senha123');
  await page.locator('input[type=password]').nth(1).fill('senha123');
  await page.locator('button[type=submit]').click();
  await expect(page.locator('.auth-success-message')).toBeVisible();
  expect(payload).not.toHaveProperty('Chave');
  expect(clientEmailSends).toBe(0);
});

test('link inválido apresenta erro de confirmação', async ({ page }) => {
  await page.route('**/api/Email/confirmar-conta', route => route.fulfill({
    status: 404, json: 'Chave de confirmação inválida ou expirada.',
  }));
  await page.goto('/confirmar-email?chave=invalida');
  await expect(page.getByText('Chave de confirmação inválida ou expirada.')).toBeVisible();
});

 test('cadastro admin bloqueia domínio institucional incorreto antes da API', async ({ page }) => {
  let calls = 0;
  await page.route('**/api/UsuarioUnievent/admin-inicial', route => {
    calls++;
    return route.fulfill({ json: { id: 1, emailConfirmado: false } });
  });
  await page.goto('/login');
  await page.getByRole('button', { name: 'Cadastro Admin UniEvent', exact: true }).click();
  await page.locator('input').nth(0).fill('Admin');
  await page.locator('input[type=email]').fill('admin@aluno.sp.gov.br');
  await page.locator('input[type=password]').nth(0).fill('senha123');
  await page.locator('input[type=password]').nth(1).fill('senha123');
  await page.locator('button[type=submit]').click();
  await expect(page.locator('.auth-error-message')).toContainText('@aluno.cps.sp.gov.br');
  expect(calls).toBe(0);
});
