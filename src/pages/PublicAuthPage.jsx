import { ArrowLeft, Lock, Mail, User } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/images/logo.svg";
import { useAuth } from "../contexts/AuthContext.jsx";
import { loginPublic, registerPublic } from "../services/authService.js";

export function PublicAuthPage({ initialMode = "signin" }) {
  const isInitialSignUp = initialMode === "signup";
  const [isSignUp, setIsSignUp] = useState(isInitialSignUp);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setIsSignUp(isInitialSignUp);
    setError("");
    setSuccess("");
  }, [isInitialSignUp]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      if (!email || !password || (isSignUp && !name)) {
        throw new Error("Preencha todos os campos obrigatórios");
      }

      if (isSignUp) {
        if (password !== confirmPassword) {
          throw new Error("Senhas não conferem");
        }

        await registerPublic({
          name,
          email,
          password,
          confirmPassword,
        });
        setSuccess("Conta criada. Faça login para se inscrever em eventos públicos.");
        setIsSignUp(false);
        setPassword("");
        setConfirmPassword("");
        return;
      }

      const response = await loginPublic(email, password);
      if (!login(response.user, response.token)) {
        throw new Error("Não foi possível iniciar a sessão pública");
      }
      navigate("/descobrir-eventos");
    } catch (err) {
      setError(err.message || "Não foi possível autenticar");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className={`auth-page ${isSignUp ? "auth-sign-up" : "auth-sign-in"}`}>
      <nav className="auth-topbar">
        <Link className="auth-back-link" to="/descobrir-eventos" aria-label="Voltar">
          <ArrowLeft size={19} />
        </Link>

        <Link className="auth-brand" to="/">
          <img src={logo} alt="UniEvent" />
          <span>UniEvent</span>
        </Link>
      </nav>

      <section className="auth-shell">
        <aside className="auth-intro">
          <span className="auth-eyebrow">Público Geral</span>
          <h1>{isSignUp ? "Criar conta pública" : "Entrar no UniEvent"}</h1>
          <p>Use sua conta para acompanhar eventos abertos, verificar vagas e registrar sua inscrição.</p>
        </aside>

        <section className="auth-card">
          <div className="auth-card-header">
            <div className="auth-card-icon">
              <User size={24} />
            </div>
            <div>
              <span>{isSignUp ? "Cadastro" : "Login"}</span>
              <h2>{isSignUp ? "Pessoa do público geral" : "Bem-vindo de volta"}</h2>
            </div>
          </div>

          <div className="auth-mode-switch" aria-label="Alternar modo">
            <button
              className={!isSignUp ? "active" : ""}
              type="button"
              onClick={() => {
                setIsSignUp(false);
                setError("");
                setSuccess("");
              }}
            >
              Entrar
            </button>
            <button
              className={isSignUp ? "active" : ""}
              type="button"
              onClick={() => {
                setIsSignUp(true);
                setError("");
                setSuccess("");
              }}
            >
              Criar conta
            </button>
          </div>

          {success && <div className="auth-success-message">{success}</div>}
          {error && <div className="auth-error-message">{error}</div>}

          <form className="auth-form" onSubmit={handleSubmit}>
            {isSignUp && (
              <label className="auth-field">
                <span>Nome</span>
                <div>
                  <User size={18} />
                  <input
                    placeholder="Seu nome"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    required
                  />
                </div>
              </label>
            )}

            <label className="auth-field">
              <span>E-mail</span>
              <div>
                <Mail size={18} />
                <input
                  type="email"
                  placeholder="voce@email.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </div>
            </label>

            <label className="auth-field">
              <span>Senha</span>
              <div>
                <Lock size={18} />
                <input
                  type="password"
                  placeholder="Sua senha"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </div>
            </label>

            {isSignUp && (
              <label className="auth-field">
                <span>Confirmar senha</span>
                <div>
                  <Lock size={18} />
                  <input
                    type="password"
                    placeholder="Repita sua senha"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    required
                  />
                </div>
              </label>
            )}

            <button className="auth-submit" type="submit" disabled={isLoading}>
              {isLoading ? "Aguarde..." : isSignUp ? "Criar conta" : "Entrar"}
            </button>
          </form>
        </section>
      </section>
    </main>
  );
}
