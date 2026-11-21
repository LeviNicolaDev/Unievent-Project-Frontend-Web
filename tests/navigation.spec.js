import { expect, test } from '@playwright/test';
import { getLoginReturnPath } from '../src/utils/navigation.js';

test('retorno do login rejeita URLs externas e rotas de outro perfil', () => {
  for (const path of ['https://example.com', '//example.com', '/\\example.com', '/instituicao/eventos']) {
    expect(getLoginReturnPath(path, 'publico')).toBe('/descobrir-eventos');
  }
  expect(getLoginReturnPath('/meus-ingressos/7?origem=email', 'publico')).toBe('/meus-ingressos/7?origem=email');
});

function jwt(role = 'Aluno') {
  return `header.${Buffer.from(JSON.stringify({ sub: '1', role, tipo_usuario: role === 'Aluno' ? 'Aluno' : 'UsuarioSecretaria', tipo_participante: 'Externo', ...(role === 'Secretaria' ? { instituicao_id: 1 } : {}) })).toString('base64url')}.signature`;
}

async function secretarySession(page) {
  await page.addInitScript(() => localStorage.setItem('unievent.auth.secretaria', JSON.stringify({
    token: 'secretary-token', user: { id: 1, roleUsuario: 'Secretaria', tipoUsuario: 'UsuarioSecretaria', instituicaoId: 1 },
  })));
}

const event = { id: 7, nome: 'Evento selecionado', descricao: 'Descrição do evento selecionado', dataEvento: '2026-12-20T19:00:00', categoria: 'Palestra', capacidade: 10, vagasDisponiveis: 10, publicoPermitido: 'PublicoGeral', visibilidade: 'Publico' };

test('login público retorna ao ingresso e preserva a query', async ({ page }) => {
  await page.route('**/api/Auth/login-publico', route => route.fulfill({ json: jwt() }));
  await page.route('**/api/Evento/7/ingresso', route => route.fulfill({ json: { eventoId: 7, nomeEvento: 'Ingresso solicitado', codigoIngresso: 'abc' } }));
  await page.goto('/meus-ingressos/7?origem=email');
  await expect(page).toHaveURL(/\/entrar$/);
  await page.locator('input[type=email]').fill('pessoa@example.com');
  await page.locator('input[type=password]').fill('senha123');
  await page.locator('button[type=submit]').click();
  await expect(page).toHaveURL(/\/meus-ingressos\/7\?origem=email$/);
  await expect(page.getByRole('heading', { name: 'Ingresso solicitado' })).toBeVisible();
});

test('entrar para inscrição volta ao evento escolhido', async ({ page }) => {
  await page.route('**/api/Evento/7', route => route.fulfill({ json: event }));
  await page.route('**/api/Evento/7/minha-inscricao', route => route.fulfill({ body: 'null', contentType: 'application/json' }));
  await page.route('**/api/Auth/login-publico', route => route.fulfill({ json: jwt() }));
  await page.goto('/descobrir-eventos/7');
  await page.getByRole('link', { name: 'Entrar para se inscrever' }).click();
  await page.locator('input[type=email]').fill('pessoa@example.com');
  await page.locator('input[type=password]').fill('senha123');
  await page.locator('button[type=submit]').click();
  await expect(page).toHaveURL(/\/descobrir-eventos\/7$/);
  await expect(page.getByRole('heading', { name: event.nome })).toBeVisible();
});

test('login da secretaria retorna à rota institucional solicitada', async ({ page }) => {
  await page.route('**/api/Auth/login', route => route.fulfill({ json: jwt('Secretaria') }));
  await page.route('**/api/Evento', route => route.fulfill({ json: [] }));
  await page.goto('/instituicao/eventos?origem=login');
  await expect(page).toHaveURL(/\/login$/);
  await page.locator('input[type=email]').fill('pessoa@fatec.sp.gov.br');
  await page.locator('input[type=password]').fill('senha123');
  await page.locator('button[type=submit]').click();
  await expect(page).toHaveURL(/\/instituicao\/eventos\?origem=login$/);
});

test('prévia mostra evento selecionado e Voltar mantém a secretaria', async ({ page }) => {
  await secretarySession(page);
  await page.route('**/api/Evento', route => route.fulfill({ json: [event] }));
  await page.route('**/api/Evento/7', route => route.fulfill({ json: event }));
  await page.goto('/instituicao/eventos');
  await expect(page.locator('a.back-link')).toHaveAttribute('href', '/instituicao/dashboard');
  await page.locator('a[href="/instituicao/eventos/7/preview"]').click();
  await expect(page.getByRole('heading', { name: event.nome })).toBeVisible();
  await expect(page.getByText('The Rock - 5º Edição')).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Abrir página pública' })).toHaveAttribute('href', '/descobrir-eventos/7');
  await page.locator('a.back-link').click();
  await expect(page).toHaveURL(/\/instituicao\/eventos$/);
});

test('sessão expirada retorna ao login e remove somente o escopo vencido', async ({ page }) => {
  await secretarySession(page);
  await page.route('**/api/Evento', route => route.fulfill({ status: 401, json: ['Não autorizado'] }));
  await page.goto('/instituicao/eventos');
  await expect(page).toHaveURL(/\/login$/);
  expect(await page.evaluate(() => localStorage.getItem('unievent.auth.secretaria'))).toBeNull();
});

test('confirmação ignora destino web antigo e usa login público nesta origem', async ({ page }) => {
  await page.route('**/api/Email/confirmar-conta', route => route.fulfill({ json: {
    tipoUsuario: 'Publico', mensagem: 'E-mail confirmado', destino: 'http://localhost:3000/login',
  } }));
  await page.goto('/confirmar-email?chave=teste');
  await expect(page).toHaveURL('http://127.0.0.1:5176/entrar');
});

test('contato indisponível não simula envio e recuperação abre a tela correta', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.landing-contact-form button')).toBeDisabled();
  await page.goto('/login');
  await expect(page.locator('a[href="#recuperar"]')).toHaveCount(0);
  await page.getByRole('link', { name: 'Esqueci minha senha' }).click();
  await expect(page).toHaveURL(/\/recuperar-senha\?perfil=administrativo$/);
});
