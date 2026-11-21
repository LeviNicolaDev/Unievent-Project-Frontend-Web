import { expect, test } from '@playwright/test';

test('solicita recuperação com perfil correto e resposta genérica', async ({ page }) => {
  let payload;
  await page.route('**/api/Auth/solicitar-recuperacao-senha', route => {
    payload = route.request().postDataJSON();
    return route.fulfill({ json: { mensagem: 'Se houver uma conta com esse e-mail, enviaremos um link para redefinir sua senha.' } });
  });
  await page.goto('/entrar');
  await page.getByRole('link', { name: 'Esqueci minha senha' }).click();
  await page.getByLabel('E-mail', { exact: true }).fill('pessoa@example.com');
  await page.getByRole('button', { name: 'Enviar link de recuperação' }).click();
  await expect(page.getByRole('status')).toContainText('Se houver uma conta');
  expect(payload).toEqual({ email: 'pessoa@example.com', perfil: 'publico' });
});

test('redefine a senha e remove token da URL sem iniciar sessão', async ({ page }) => {
  const token = 'A'.repeat(64);
  let payload;
  await page.route('**/api/Auth/redefinir-senha', route => {
    payload = route.request().postDataJSON();
    return route.fulfill({ json: { mensagem: 'Senha redefinida com sucesso.', tipoUsuario: 'Publico' } });
  });
  await page.goto(`/redefinir-senha?token=${token}`);
  await page.getByLabel('Nova senha', { exact: true }).fill('abc123');
  await page.getByLabel('Confirmar nova senha').fill('abc123');
  await page.getByRole('button', { name: 'Salvar nova senha' }).click();
  await expect(page.getByRole('status')).toHaveText('Senha redefinida com sucesso.');
  await expect(page).toHaveURL(/\/redefinir-senha$/);
  await expect(page.getByRole('link', { name: 'Voltar para o login' })).toHaveAttribute('href', '/entrar');
  expect(payload).toEqual({ token, senha: 'abc123', confirmacaoSenha: 'abc123' });
  expect(await page.evaluate(() => localStorage.getItem('unievent.auth.publico'))).toBeNull();
});

test('senhas diferentes são recusadas antes da chamada à API', async ({ page }) => {
  let calls = 0;
  await page.route('**/api/Auth/redefinir-senha', route => { calls++; return route.fulfill({ json: {} }); });
  await page.goto(`/redefinir-senha?token=${'A'.repeat(64)}`);
  await page.getByLabel('Nova senha', { exact: true }).fill('novaSenha123');
  await page.getByLabel('Confirmar nova senha').fill('outraSenha123');
  await page.getByRole('button', { name: 'Salvar nova senha' }).click();
  await expect(page.getByRole('alert')).toContainText('senhas iguais');
  expect(calls).toBe(0);
});

test('link ausente não permite redefinir senha', async ({ page }) => {
  await page.goto('/redefinir-senha');
  await expect(page.getByRole('alert')).toContainText('inválido ou ausente');
  await expect(page.getByRole('button', { name: 'Salvar nova senha' })).toHaveCount(0);
});

test('link expirado apresenta a resposta da API e permite solicitar outro', async ({ page }) => {
  await page.route('**/api/Auth/redefinir-senha', route => route.fulfill({ status: 400, json: ['Link de recuperação inválido ou expirado. Solicite um novo link.'] }));
  await page.goto(`/redefinir-senha?token=${'A'.repeat(64)}`);
  await page.getByLabel('Nova senha', { exact: true }).fill('novaSenha123');
  await page.getByLabel('Confirmar nova senha').fill('novaSenha123');
  await page.getByRole('button', { name: 'Salvar nova senha' }).click();
  await expect(page.getByRole('alert')).toContainText('expirado');
  await page.getByRole('link', { name: 'Solicitar novo link' }).click();
  await expect(page.getByRole('button', { name: 'Enviar link de recuperação' })).toBeVisible();
});
