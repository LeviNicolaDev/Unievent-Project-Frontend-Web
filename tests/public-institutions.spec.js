import { expect, test } from '@playwright/test';

const institutions = [
  { id: null, codigo: 'fatec-adamantina', nome: 'Fatec Adamantina', totalEventos: 0 },
  { id: 7, codigo: 'fatec-ferraz', nome: 'Fatec Ferraz', totalEventos: 2 },
];

async function mockApi(page, data = institutions) {
  await page.route('**/api/Instituicao/publicas', route => route.fulfill({ json: data }));
  await page.route('**/api/Evento/categorias', route => route.fulfill({ json: ['Palestra'] }));
  await page.route(/\/api\/Evento(?:\?|$)/, route => route.fulfill({ json: { items: [], page: 1, totalPages: 0 } }));
}

test('lista catálogo sem ID e filtra por código ou ID conforme a instituição', async ({ page }) => {
  await mockApi(page);
  await page.goto('/descobrir-eventos');
  const select = page.getByRole('combobox', { name: 'Instituição', exact: true });
  await select.click();
  await expect(page.getByRole('listbox').getByRole('option')).toHaveCount(3);
  await expect(page.getByRole('option', { name: 'Fatec Adamantina', exact: true })).toBeVisible();
  let request = page.waitForRequest(req => new URL(req.url()).searchParams.get('InstituicaoCodigo') === 'fatec-adamantina');
  await page.getByRole('option', { name: 'Fatec Adamantina', exact: true }).click();
  expect(new URL((await request).url()).searchParams.has('InstituicaoId')).toBe(false);
  request = page.waitForRequest(req => new URL(req.url()).searchParams.get('InstituicaoId') === '7');
  await select.click();
  await page.getByRole('option', { name: 'Fatec Ferraz', exact: true }).click();
  expect(new URL((await request).url()).searchParams.has('InstituicaoCodigo')).toBe(false);
  await page.reload();
  await expect(select).toContainText('Fatec Ferraz');
});

test('filtro legado por ID pode ser limpo', async ({ page }) => {
  await mockApi(page);
  await page.goto('/descobrir-eventos?instituicaoId=7');
  const select = page.getByRole('combobox', { name: 'Instituição', exact: true });
  await expect(select).toContainText('Fatec Ferraz');
  const request = page.waitForRequest(req => /\/api\/Evento\?/.test(req.url()) && !new URL(req.url()).searchParams.has('InstituicaoId'));
  await select.click();
  await page.getByRole('option', { name: 'Todas as instituições', exact: true }).click();
  await request;
  await expect(page).not.toHaveURL(/instituicaoId=/);
  await expect(select).toContainText('Todas as instituições');
});

test('falha de instituições é informada sem impedir categorias', async ({ page }) => {
  await mockApi(page);
  await page.route('**/api/Instituicao/publicas', route => route.fulfill({ status: 500, json: ['Falha'] }));
  await page.goto('/descobrir-eventos');
  await expect(page.getByRole('alert')).toContainText('Não foi possível carregar as instituições');
  await expect(page.locator('option[value="Palestra"]')).toHaveCount(1);
});

test('resposta antiga não sobrescreve o filtro mais recente', async ({ page }) => {
  await mockApi(page);
  let releaseOld;
  let markOldRequested;
  const oldRequested = new Promise(resolve => { markOldRequested = resolve; });
  const oldGate = new Promise(resolve => { releaseOld = resolve; });
  await page.route(/\/api\/Evento(?:\?|$)/, async route => {
    const search = new URL(route.request().url()).searchParams.get('Search');
    if (search === 'antigo') { markOldRequested(); await oldGate; }
    return route.fulfill({ json: { items: search ? [{ id: 1, nome: `Resultado ${search}`, capacidade: 10 }] : [], page: 1, totalPages: 1 } });
  });
  await page.goto('/descobrir-eventos');
  const input = page.getByPlaceholder('Pesquisar evento');
  await input.fill('antigo');
  await oldRequested;
  await input.fill('novo');
  await expect(page.getByRole('heading', { name: 'Resultado novo' })).toBeVisible();
  releaseOld();
  await page.waitForLoadState('networkidle');
  await expect(page.getByRole('heading', { name: 'Resultado novo' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Resultado antigo' })).toHaveCount(0);
});

for (const width of [1440, 390]) {
  test(`lista sobrepõe o conteúdo sem alterar os filtros em ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 850 });
    await mockApi(page, Array.from({ length: 80 }, (_, index) => ({
      id: index + 1, nome: `Fatec ${String(index + 1).padStart(2, '0')} - Nome longo da instituição para verificar a quebra de linha`,
    })));
    await page.goto('/descobrir-eventos');
    const select = page.getByRole('combobox', { name: 'Instituição', exact: true });
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator('.public-events-grid')).toHaveAttribute('aria-busy', 'false');
    const before = await page.locator('.public-events-filters').boundingBox();
    const gridBefore = await page.locator('.public-events-grid').evaluate(element => element.getBoundingClientRect().top + window.scrollY);
    await select.click();
    await expect(page.getByRole('listbox').getByRole('option')).toHaveCount(81);
    const trigger = await select.boundingBox();
    const list = await page.getByRole('listbox').boundingBox();
    const after = await page.locator('.public-events-filters').boundingBox();
    expect(list.y).toBeGreaterThanOrEqual(trigger.y + trigger.height);
    expect(list.height).toBeLessThanOrEqual(282);
    expect(after.height).toBeCloseTo(before.height, 1);
    const gridAfter = await page.locator('.public-events-grid').evaluate(element => element.getBoundingClientRect().top + window.scrollY);
    expect(gridAfter).toBeCloseTo(gridBefore, 1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({ path: `test-results/institution-select-${width}.png`, fullPage: true });
    await page.keyboard.press('End');
    await page.keyboard.press('Enter');
    await expect(select).toContainText('Fatec 80');
    await expect(page.getByRole('listbox')).toHaveCount(0);
    await select.press('ArrowDown');
    await expect(page.getByRole('listbox')).toBeVisible();
    await select.press('Escape');
    await expect(page.getByRole('listbox')).toHaveCount(0);
    await select.click();
    await page.getByRole('heading', { name: 'Encontre eventos por unidade FATEC.' }).click();
    await expect(page.getByRole('listbox')).toHaveCount(0);
  });
}
