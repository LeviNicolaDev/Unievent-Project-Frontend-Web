# UniEvent Web

Execute `npm install` e `npm run dev`. Configure a origem da API conforme `.env.example`.

## Confirmação de e-mail

Administrador global (`/login`) e Público Geral (`/entrar`) precisam ativar a conta pelo e-mail antes do login. O cadastro exibe a orientação de ativação, sem iniciar sessão. A API gera a chave e envia a confirmação, inclusive no cadastro do primeiro administrador; o front não envia uma segunda mensagem.

Ao tentar entrar com credenciais corretas em uma conta pendente, a API envia automaticamente a confirmação. O front apresenta “Enviamos um e-mail de confirmação para seu e-mail”, sem botão de reenvio e sem iniciar sessão. Falha de SMTP apresenta erro em vez de afirmar que houve envio.

A rota `/confirmar-email?chave=...` confirma pela API, apresenta o resultado e segue o destino informado por ela. Público Geral retorna a `/entrar`; administrador e secretaria usam `/login`; aluno interno usa o aplicativo mobile. Link inválido apresenta erro.

Antes de usar esta versão, aplique a migration `ConfirmacaoEmailAdminPublico` na API e configure SMTP. Administradores e participantes externos antigos também precisam confirmar o e-mail; uma tentativa de login com credenciais corretas envia o link automaticamente. A configuração `EmailSettings__PublicLoginUrl` deve apontar ao `/entrar` deste front; o fallback é `EmailSettings__BaseUrl + /entrar`.

No desenvolvimento, use API `http://localhost:5227` (perfil `http` ou `https`) e front `http://localhost:5173`. `EmailSettings:ConfirmationBaseUrl` aponta à API, não ao front. O e-mail deve conter `http://localhost:5227/api/Email/confirmar-conta?chave=...`. Ambos os serviços precisam estar em execução ao abrir o link. Se usar IIS Express, configure sua URL real, pois as portas são diferentes. Links antigos não são alterados por mudanças de configuração; faça login novamente para receber um e-mail atualizado. No celular, `localhost` é o próprio celular: use URLs acessíveis pela rede.

Detalhes de endpoints, SMTP e migration estão em `docs/CONFIRMACAO_EMAIL.md` no repositório da API.

A revisão de botões, destinos e configuração de produção está em [Revisão de navegação](docs/REVISAO_NAVEGACAO.md). O front de produção é `https://unievent-web.vercel.app`; configure a API pública na Vercel conforme `.env.production.example`. O arquivo `vercel.json` permite abrir e recarregar rotas diretamente.

Validação: `npm run build` e `npm run test:e2e -- tests/email-confirmation.spec.js` (requer Chromium do Playwright).

## Recuperação de senha

Os logins administrativo e público oferecem **Esqueci minha senha**. A tela `/recuperar-senha` solicita um link de 30 minutos e `/redefinir-senha` permite definir a nova senha. O sucesso não inicia sessão automaticamente. A API atende também aluno mobile, preserva a confirmação de e-mail e revoga sessões anteriores após a troca.

Antes de publicar, aplique a migration `AddPasswordRecovery` da API. Use o SMTP já configurado e `EmailSettings__BaseUrl=https://unievent-web.vercel.app`. Detalhes e payloads estão em `docs/RECUPERACAO_SENHA.md` no repositório da API. Testes web: `npm run test:e2e -- tests/password-recovery.spec.js`.
