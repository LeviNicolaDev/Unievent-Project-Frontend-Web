# Revisão de botões, rotas e redirecionamentos

Origem de produção: https://unievent-web.vercel.app.

## Problemas encontrados e alterações

| Problema | Correção |
| --- | --- |
| Rotas abertas diretamente na Vercel retornam 404 | `vercel.json` entrega `index.html` para as rotas da SPA, preservando os caminhos de API e assets. |
| Login público descarta o ingresso ou evento solicitado | O destino é preservado no estado da navegação e restaurado após autenticação, incluindo query e fragmento. |
| Login administrativo descarta a rota institucional solicitada | O destino é restaurado dentro do escopo do perfil autenticado. URLs externas e outros perfis não são aceitos como destino. |
| Voltar de listagens da secretaria aponta a `/home` | O cabeçalho escolhe `/instituicao/dashboard` para secretaria. |
| Prévia ignora o evento da linha e apresenta dados fixos | A URL inclui o ID e a prévia busca os dados reais; mostra erro se a consulta falhar. |
| Botões de demonstração da prévia não fazem nada | Removidos; o evento público oferece o link funcional para seu detalhe. |
| Resposta 401 mantém a interface autenticada | A sessão do escopo vencido é removida e a área protegida volta ao login. Falha de credenciais no login não remove sessões de outros portais. |
| Limpar armazenamento em outra aba mantém o estado antigo | O contexto sincroniza também eventos de limpeza total do localStorage. |
| Logout aceita inadvertidamente o evento de clique como escopo | O contexto valida o escopo e usa o portal ativo quando o argumento não é um escopo conhecido. |
| Confirmação pode retornar para localhost ou host antigo da API | A confirmação web navega para o login na origem atual, conforme o perfil. O aluno interno mantém o deep link `unievent://`. |
| Trocar o ID do ingresso pode manter erro ou conteúdo do anterior | A consulta reinicia os estados de carregamento, erro e ingresso. |
| Resposta antiga de detalhes pode sobrescrever outro evento após navegar | A consulta cancela a atualização de estado ao sair e limpa inscrição e mensagens ao trocar o evento. |
| Componente Button com `to` descarta propriedades de link | As propriedades são encaminhadas e botões sem tipo explícito não submetem formulários por acidente. |
| Link GitHub de Levi retorna 404 | Corrigido para o perfil verificado `LeviNicolaDev`. |
| Formulário de contato e recuperação de senha aparentam funcionar | Ações indisponíveis são informadas; o contato não simula envio e a recuperação não aponta mais para um fragmento inexistente. Esses serviços ainda precisam de implementação própria. |

## Verificação no deploy existente

Consultas públicas retornaram 200 para `/` e 404 para `/entrar`, `/confirmar-email`, `/meus-ingressos` e `/instituicao/eventos`. A API pública de eventos respondeu 200 e permitiu CORS para https://unievent-web.vercel.app. O rewrite precisa de um novo deploy do front para corrigir as rotas atualmente publicadas.

## Configuração de produção

Na Vercel, configure:

```text
VITE_API_BASE_URL=https://unievent-api-homolog.happyisland-61c77244.canadacentral.azurecontainerapps.io/api
```

Essa variável é incorporada no build. O proxy do Vite só atende ao desenvolvimento. Em builds Vercel, o projeto rejeita uma API ausente, HTTP ou localhost. Veja `.env.production.example`; nenhum secret SMTP deve ser colocado em variáveis VITE.

Na API Azure:

```text
EmailSettings__BaseUrl=https://unievent-web.vercel.app
EmailSettings__WebLoginUrl=https://unievent-web.vercel.app/login
EmailSettings__PublicLoginUrl=https://unievent-web.vercel.app/entrar
Cors__AllowedOrigins__0=https://unievent-web.vercel.app
```

`EmailSettings__ConfirmationBaseUrl` deve apontar à origem HTTPS da API. Se estiver ausente, o template usa `/confirmar-email` no front. O Terraform usa `web_url` para os destinos e CORS; configure `web_url = "https://unievent-web.vercel.app"`. Alterar exemplos ou appsettings localmente não altera as variáveis já configuradas no Azure.

## Cobertura e limites

Os testes Playwright cobrem navegação móvel, sessões independentes, logout, retorno após login, prévia selecionada, sessão expirada, confirmação de e-mail, detalhes e ingressos. As chamadas de autenticação e alterações são simuladas; nenhuma conta ou inscrição foi criada no deploy durante a revisão. Não houve envio SMTP real, publicação na Vercel ou aplicação de Terraform.

Rotas públicas de eventos continuam acessíveis após logout. Inscrição, ingressos e áreas administrativas exigem autenticação.

Referência para o fallback de rotas: [guia de SPA Vite da Vercel](https://vercel.com/docs/frameworks/frontend/vite).
