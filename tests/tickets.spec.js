import { expect, test } from "@playwright/test";

const activeTicket = {
  id: 11,
  eventoId: 7,
  nomeEvento: "Semana de Tecnologia",
  instituicaoNome: "FATEC Ferraz de Vasconcelos",
  dataEvento: "2026-09-20T19:00:00",
  local: "Auditório Principal",
  statusInscricao: "ativa",
  presencaConfirmada: false,
  dataCheckIn: null,
  codigoIngresso: "93hd2a4bc92844afb701e97d05b913ac",
  conteudoQrCode: "93hd2a4bc92844afb701e97d05b913ac",
  eventoRealizado: false,
  podeRealizarCheckIn: true,
};

const usedTicket = {
  ...activeTicket,
  id: 12,
  eventoId: 8,
  nomeEvento: "Encontro de Inovação",
  dataEvento: "2026-09-01T14:00:00",
  codigoIngresso: "1ab2cd3ef4564789bcde0123456789ab",
  conteudoQrCode: "1ab2cd3ef4564789bcde0123456789ab",
  eventoRealizado: true,
  presencaConfirmada: true,
  podeRealizarCheckIn: false,
};

async function authenticatePublicParticipant(page) {
  await page.addInitScript(() => {
    localStorage.setItem("unievent.auth.publico", JSON.stringify({
      token: "jwt-publico",
      user: {
        id: 1,
        email: "visitante@example.com",
        roleUsuario: "Aluno",
        tipoUsuario: "Aluno",
        tipoParticipante: "Externo",
        instituicaoId: null,
      },
    }));
  });
}

async function mockTicketApi(page) {
  await page.route("**/api/Evento/meus-ingressos", (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify([activeTicket, usedTicket]),
  }));
  await page.route("**/api/Evento/7/ingresso", (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify(activeTicket),
  }));
}

test("usuário não autenticado é direcionado ao login público", async ({ page }) => {
  await page.goto("/meus-ingressos");
  await expect(page).toHaveURL(/\/entrar$/);
});

test("sair dos ingressos encerra a sessão pública e retorna ao login", async ({ page }) => {
  await authenticatePublicParticipant(page);
  await mockTicketApi(page);

  await page.goto("/meus-ingressos");
  await page.getByRole("button", { name: "Sair", exact: true }).click();

  await expect(page).toHaveURL(/\/entrar$/);
  expect(await page.evaluate(() => localStorage.getItem("unievent.auth.publico"))).toBeNull();
});

test("lista ingressos, renderiza QR Codes e mantém o detalhe legível no celular", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await authenticatePublicParticipant(page);
  await mockTicketApi(page);

  await page.goto("/meus-ingressos");
  await expect(page.getByRole("heading", { name: "Meus Ingressos" })).toBeVisible();
  await expect(page.locator(".digital-ticket")).toHaveCount(2);
  await expect(page.locator(".ticket-qr svg")).toHaveCount(2);
  await expect(page.getByText("Check-in realizado", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Eventos anteriores" })).toBeVisible();

  await page.locator('a[href="/meus-ingressos/7"]').click();
  await expect(page.getByRole("heading", { name: "Semana de Tecnologia" })).toBeVisible();
  const qr = page.locator(".ticket-qr--large svg");
  await expect(qr).toBeVisible();
  const box = await qr.boundingBox();
  expect(box.width).toBeGreaterThanOrEqual(280);
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(390);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  await expect(page.getByText(activeTicket.codigoIngresso, { exact: true })).toBeVisible();
});
