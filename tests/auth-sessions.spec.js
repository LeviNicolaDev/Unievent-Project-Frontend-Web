import { expect, test } from "@playwright/test";

const sessions = {
  "unievent.auth.admin": {
    token: "jwt-admin",
    user: {
      id: 10,
      email: "admin@unievent.com",
      roleUsuario: "Admin",
      tipoUsuario: "UsuarioUnievent",
      instituicaoId: null,
    },
  },
  "unievent.auth.secretaria": {
    token: "jwt-secretaria",
    user: {
      id: 20,
      email: "secretaria@fatec.sp.gov.br",
      roleUsuario: "Secretaria",
      tipoUsuario: "UsuarioSecretaria",
      instituicaoId: 5,
    },
  },
  "unievent.auth.publico": {
    token: "jwt-publico",
    user: {
      id: 30,
      email: "publico@example.com",
      roleUsuario: "Aluno",
      tipoUsuario: "Aluno",
      tipoParticipante: "Externo",
      instituicaoId: null,
    },
  },
};

async function persistAllSessions(page) {
  await page.addInitScript((storedSessions) => {
    Object.entries(storedSessions).forEach(([key, session]) => {
      localStorage.setItem(key, JSON.stringify(session));
    });
  }, sessions);
}

test("mantém três sessões e envia o token correspondente a cada portal", async ({ page }) => {
  await persistAllSessions(page);

  const authorizationHeaders = {};
  await page.route("**/api/Evento/meus-ingressos", (route) => {
    authorizationHeaders.publico = route.request().headers().authorization;
    return route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
  });
  await page.route("**/api/admin/dashboard", (route) => {
    authorizationHeaders.admin = route.request().headers().authorization;
    return route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
  });
  await page.route("**/api/instituicao/dashboard", (route) => {
    authorizationHeaders.secretaria = route.request().headers().authorization;
    return route.fulfill({ status: 200, contentType: "application/json", body: "{}" });
  });

  await page.goto("/meus-ingressos");
  await expect(page.getByRole("heading", { name: "Meus Ingressos" })).toBeVisible();
  expect(authorizationHeaders.publico).toBe("Bearer jwt-publico");

  await page.goto("/home");
  await expect(page.getByRole("heading", { name: "Visão global da plataforma" })).toBeVisible();
  expect(authorizationHeaders.admin).toBe("Bearer jwt-admin");

  await page.goto("/instituicao/dashboard");
  await expect(page.getByRole("heading", { name: /Dashboard/ })).toBeVisible();
  expect(authorizationHeaders.secretaria).toBe("Bearer jwt-secretaria");
});

test("logout administrativo remove somente a sessão do Admin", async ({ page }) => {
  await persistAllSessions(page);
  await page.route("**/api/admin/dashboard", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: "{}" }),
  );

  await page.goto("/home");
  await page.getByRole("button", { name: "Sair" }).click();
  await expect(page).toHaveURL(/\/login$/);

  const stored = await page.evaluate(() => ({
    admin: localStorage.getItem("unievent.auth.admin"),
    secretaria: localStorage.getItem("unievent.auth.secretaria"),
    publico: localStorage.getItem("unievent.auth.publico"),
  }));

  expect(stored.admin).toBeNull();
  expect(stored.secretaria).not.toBeNull();
  expect(stored.publico).not.toBeNull();
});

test("migra a sessão legada para o escopo correspondente", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("authToken", "jwt-publico-legado");
    localStorage.setItem("authUser", JSON.stringify({
      id: 40,
      email: "legado@example.com",
      roleUsuario: "Aluno",
      tipoUsuario: "Aluno",
      tipoParticipante: "Externo",
      instituicaoId: null,
    }));
  });
  await page.route("**/api/Evento/meus-ingressos", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: "[]" }),
  );

  await page.goto("/meus-ingressos");
  await expect(page.getByRole("heading", { name: "Meus Ingressos" })).toBeVisible();

  const stored = await page.evaluate(() => ({
    legacyToken: localStorage.getItem("authToken"),
    legacyUser: localStorage.getItem("authUser"),
    publico: JSON.parse(localStorage.getItem("unievent.auth.publico")),
  }));

  expect(stored.legacyToken).toBeNull();
  expect(stored.legacyUser).toBeNull();
  expect(stored.publico.token).toBe("jwt-publico-legado");
});
