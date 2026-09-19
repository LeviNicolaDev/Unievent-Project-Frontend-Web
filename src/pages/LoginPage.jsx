import {
  ArrowLeft,
  CalendarCheck,
  CheckCircle2,
  Lock,
  Mail,
  Moon,
  Sun,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/images/unieventAdminLogo.svg";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useLanguage } from "../hooks/useLanguage.js";
import { useTheme } from "../hooks/useTheme.js";
import { loginAdmin } from "../services/authService.js";
import { sendAccountConfirmationEmail } from "../services/emailService.js";
import { saveInitialAdminUnievent } from "../services/userUnieventService.js";

function generateConfirmationKey() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}

export function LoginPage({ initialMode = "signin" }) {
  const isInitialSignUp = initialMode === "signup";
  const [isSignUp, setIsSignUp] = useState(isInitialSignUp);
  const { language, setLanguage, t } = useLanguage();
  const { isLight, setTheme } = useTheme();
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResendingEmail, setIsResendingEmail] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [pendingConfirmation, setPendingConfirmation] = useState(null);

  useEffect(() => {
    setIsSignUp(isInitialSignUp);
    setError("");
    setSuccess("");
  }, [isInitialSignUp]);

  function finishSignupSuccess() {
    setPendingConfirmation(null);
    setSuccess(
      t("signupConfirmationSent") ||
        "Cadastro criado. Enviamos um email de confirmação para o endereço informado. Confirme o email antes de fazer login."
    );
    setError("");
    setIsSignUp(false);
    setPassword("");
    setConfirmPassword("");
  }

  function showEmailSendFailure() {
    setSuccess(
      t("signupCreatedEmailFailed") ||
        "Cadastro criado, mas não foi possível enviar o email de confirmação."
    );
    setError(
      t("signupCreatedEmailRetry") ||
        "Verifique a configuração de email da API e tente reenviar a confirmação."
    );
    setIsSignUp(false);
    setPassword("");
    setConfirmPassword("");
  }

  async function handleResendConfirmationEmail() {
    if (!pendingConfirmation) {
      return;
    }

    setError("");
    setSuccess("");
    setIsResendingEmail(true);

    try {
      await sendAccountConfirmationEmail(pendingConfirmation);
      finishSignupSuccess();
    } catch (err) {
      showEmailSendFailure();
      console.error("Erro ao reenviar email de confirmação:", err);
    } finally {
      setIsResendingEmail(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      // Validações
      if (!email || !password) {
        throw new Error(t("fillAllFields") || "Preencha todos os campos");
      }

      if (isSignUp) {
        if (!name || !confirmPassword) {
          throw new Error(t("fillAllFields") || "Preencha todos os campos");
        }
        if (password !== confirmPassword) {
          throw new Error(t("passwordsDontMatch") || "Senhas não conferem");
        }

        const confirmationKey = generateConfirmationKey();

        await saveInitialAdminUnievent({
          nomeUsuario: name,
          emailUsuario: email,
          senha: password,
          chave: confirmationKey,
        });

        const confirmationData = {
          email,
          nome: name,
          chave: confirmationKey,
        };
        setPendingConfirmation(confirmationData);

        try {
          await sendAccountConfirmationEmail(confirmationData);
          finishSignupSuccess();
        } catch (err) {
          showEmailSendFailure();
          console.error("Erro ao enviar email de confirmação:", err);
        }
        return;
      } else {
        const response = await loginAdmin(email, password);
        if (!login(response.user, response.token)) {
          throw new Error("Apenas usuários administrativos podem acessar este sistema");
        }
        navigate(response.user?.roleUsuario === "Secretaria" ? "/instituicao/dashboard" : "/home");
        return;
      }

      navigate("/home");
    } catch (err) {
      const message = err.message || "Erro ao fazer login";
      setError(message);
      console.error("Erro de autenticação:", err);
    } finally {
      setIsLoading(false);
    }
  }

  function toggleTheme() {
    setTheme(isLight ? "dark" : "light");
  }

  return (
    <main className={`auth-page ${isSignUp ? "auth-sign-up" : "auth-sign-in"}`}>
      <nav className="auth-topbar">
        <Link className="auth-back-link" to="/" aria-label={t("authBack")}>
          <ArrowLeft size={19} />
        </Link>

        <Link className="auth-brand" to="/">
          <img src={logo} alt="UniEvent Admin" />
          <span>{t("authAdmin")}</span>
        </Link>

        <div className="auth-topbar-actions">
          <button
            className="auth-language-toggle"
            type="button"
            onClick={() => setLanguage(language === "en" ? "pt" : "en")}
            aria-label={t("language")}
            title={t("language")}
          >
            {language === "en" ? "PT" : "EN"}
          </button>
          <button
            className="auth-theme-toggle"
            type="button"
            onClick={toggleTheme}
            aria-label={isLight ? t("activateDark") : t("activateLight")}
            title={isLight ? t("themeDark") : t("themeLight")}
          >
            {isLight ? <Moon size={19} /> : <Sun size={19} />}
          </button>
        </div>
      </nav>

      <section className="auth-shell">
        <aside className="auth-intro">
          <span className="auth-eyebrow">UniEvent Admin</span>
          <h1>{isSignUp ? "Cadastro Admin UniEvent" : t("authIntroSignIn")}</h1>
          <p>{t("authCopy")}</p>

          <div className="auth-benefits">
            <span>
              <CheckCircle2 size={18} />
              {t("authBenefit1")}
            </span>
            <span>
              <CheckCircle2 size={18} />
              {t("authBenefit2")}
            </span>
            <span>
              <CheckCircle2 size={18} />
              {t("authBenefit3")}
            </span>
          </div>
        </aside>

        <section className="auth-card">
          <div className="auth-card-header">
            <div className="auth-card-icon">
              <CalendarCheck size={24} />
            </div>
            <div>
              <span>{isSignUp ? "Cadastro Admin UniEvent" : t("signin")}</span>
              <h2>{isSignUp ? "Criar administrador global" : t("welcomeBack")}</h2>
            </div>
          </div>

          <div className="auth-mode-switch" aria-label={t("authSwitch")}>
            <button
              className={!isSignUp ? "active" : ""}
              type="button"
              onClick={() => {
                setIsSignUp(false);
                setError("");
              }}
            >
              {t("enter")}
            </button>
            <button
              className={isSignUp ? "active" : ""}
              type="button"
            onClick={() => {
              setIsSignUp(true);
              setError("");
              setSuccess("");
              setPendingConfirmation(null);
            }}
          >
              Cadastro Admin UniEvent
            </button>
          </div>

          {isSignUp && (
            <p className="auth-admin-note">
              Esse cadastro cria o administrador global da plataforma, sem vínculo com uma FATEC específica.
            </p>
          )}

          {success && (
            <div
              className="auth-success-message"
              style={{
                color: "#15803d",
                marginBottom: "1rem",
                textAlign: "center",
                fontSize: "0.875rem",
                lineHeight: 1.45,
              }}
            >
              {success}
            </div>
          )}

          {error && (
            <div
              className="auth-error-message"
              style={{
                color: "#dc2626",
                marginBottom: "1rem",
                textAlign: "center",
                fontSize: "0.875rem",
              }}
            >
              {error}
            </div>
          )}

          {pendingConfirmation && !isSignUp && (
            <button
              className="auth-submit"
              type="button"
              onClick={handleResendConfirmationEmail}
              disabled={isResendingEmail}
              style={{ marginBottom: "1rem" }}
            >
              {isResendingEmail
                ? t("resendingConfirmationEmail")
                : t("resendConfirmationEmail")}
            </button>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            {isSignUp ? (
              <label className="auth-field">
                <span>{t("fullNameShort")}</span>
                <div>
                  <User size={18} />
                  <input
                    placeholder={t("enterName")}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </label>
            ) : null}

            <label className="auth-field">
              <span>{isSignUp ? "Email do Admin UniEvent" : t("institutionalEmail")}</span>
              <div>
                <Mail size={18} />
                <input
                  type="email"
                  placeholder={isSignUp ? "admin@unievent.com" : "nome@fatec.sp.gov.br"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </label>

            <label className="auth-field">
              <span>{t("password")}</span>
              <div>
                <Lock size={18} />
                <input
                  type="password"
                  placeholder={t("enterPassword")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </label>

            {isSignUp ? (
              <label className="auth-field">
                <span>{t("confirmPassword")}</span>
                <div>
                  <Lock size={18} />
                  <input
                    type="password"
                    placeholder={t("confirmPasswordPlaceholder")}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </label>
            ) : (
              <a className="auth-forgot-link" href="#recuperar">
                {t("forgotPassword")}
              </a>
            )}

            <button className="auth-submit" type="submit" disabled={isLoading}>
              {isLoading ? "Aguarde..." : isSignUp ? "Cadastrar Admin UniEvent" : t("enter")}
            </button>
          </form>
        </section>
      </section>
    </main>
  );
}
