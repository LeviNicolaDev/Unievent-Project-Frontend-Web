import { expect, test } from "@playwright/test";

const eventDetails = {
  id: 7,
  nome: "Semana de Tecnologia e Inovação",
  descricao: "Uma programação especial com palestras e atividades sobre tecnologia, carreira e inovação.",
  categoria: "Tecnologia",
  dataEvento: "2026-09-20T19:00:00",
  capacidade: 40,
  vagasDisponiveis: 11,
  publicoPermitido: "PublicoGeral",
  local: "Auditório principal",
  rua: "Rua Carlos de Carvalho",
  numero: "200",
  bairro: "Centro",
  cidade: "Ferraz de Vasconcelos",
  estado: "SP",
  instituicaoNome: "FATEC Ferraz de Vasconcelos",
};

const registration = {
  id: 15,
  eventoId: 7,
  presencaGarantida: true,
  certificadoEmitido: true,
  certificadoEnviadoPorEmail: true,
  certificadoPdfDisponivel: true,
};

async function prepareEvent(page) {
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

  await page.route("**/api/Evento/7", (route) => route.fulfill({ json: eventDetails }));
  await page.route("**/api/Evento/7/minha-inscricao", (route) => route.fulfill({ json: registration }));
  await page.route("**/api/Evento/7/ingresso", (route) => route.fulfill({
    json: { codigoIngresso: "93hd2a4bc92844afb701e97d05b913ac" },
  }));
}

test("detalhes do evento exibem informações e ações estilizadas sem transbordar", async ({ page }) => {
  await prepareEvent(page);
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/descobrir-eventos/7");

  await expect(page.getByRole("heading", { name: eventDetails.nome })).toBeVisible();
  await expect(page.locator(".public-event-detail__image")).toHaveCSS("object-fit", "contain");
  await expect(page.getByRole("heading", { name: "Você já está inscrito" })).toBeVisible();
  await expect(page.getByText("Confirmada pela Secretaria")).toBeVisible();
  await expect(page.getByText("O PDF também foi enviado para seu e-mail")).toBeVisible();

  for (const name of ["Ver meu ingresso", "Atualizar presença", "Baixar certificado"]) {
    const action = page.getByRole(name === "Ver meu ingresso" ? "link" : "button", { name, exact: true });
    await expect(action).toBeVisible();
    expect((await action.boundingBox()).height).toBeGreaterThanOrEqual(44);
    expect(await action.evaluate((element) => getComputedStyle(element).backgroundColor)).not.toBe("rgba(0, 0, 0, 0)");
  }

  await page.getByRole("button", { name: "Atualizar presença", exact: true }).click();
  await expect(page.getByText("Status da inscrição atualizado.")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator(".public-event-detail-card")).toHaveCSS("grid-template-columns", "364px");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);

  const actionWidths = await page.locator(".public-event-registration__actions > *").evaluateAll(
    (elements) => elements.map((element) => Math.round(element.getBoundingClientRect().width)),
  );
  expect(new Set(actionWidths).size).toBe(1);
});
