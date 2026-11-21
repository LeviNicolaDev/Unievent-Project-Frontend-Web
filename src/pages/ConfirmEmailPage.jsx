import { AlertCircle, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useLanguage } from "../hooks/useLanguage.js";
import { confirmAccountEmail } from "../services/emailService.js";

export function ConfirmEmailPage() {
  const [searchParams] = useSearchParams();
  const { t } = useLanguage();
  const confirmationKey = searchParams.get("chave");
  const [status, setStatus] = useState(confirmationKey ? "loading" : "missing");
  const [loginPath, setLoginPath] = useState("/login");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let isMounted = true;
    let redirectTimer;
    setStatus(confirmationKey ? "loading" : "missing");
    setMessage("");

    async function confirmEmail() {
      if (!confirmationKey) return;

      try {
        const response = await confirmAccountEmail(confirmationKey);
        if (!isMounted) return;
        setMessage(response?.mensagem || "E-mail confirmado com sucesso.");
        setStatus("success");
        setLoginPath((response?.tipoUsuario || response?.TipoUsuario) === "Publico" ? "/entrar" : "/login");

        const destination = response?.destino || response?.Destino;
        if (destination) {
          redirectTimer = window.setTimeout(() => {
            window.location.href = destination;
          }, 700);
        }
      } catch (err) {
        if (!isMounted) return;
        setMessage(err.message || "Não foi possível confirmar o e-mail.");
        setStatus("error");
      }
    }

    confirmEmail();

    return () => {
      isMounted = false;
      window.clearTimeout(redirectTimer);
    };
  }, [confirmationKey]);

  const isSuccess = status === "success";
  const isError = status === "error" || status === "missing";

  return (
    <main className="auth-page">
      <section className="auth-shell">
        <section className="auth-card" style={{ maxWidth: 520, margin: "0 auto" }}>
          <div className="auth-card-header">
            <div className="auth-card-icon">
              {isSuccess ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
            </div>
            <div>
              <span>UniEvent</span>
              <h2>{t("confirmEmailTitle")}</h2>
            </div>
          </div>

          <p style={{ color: "var(--auth-muted)", lineHeight: 1.6 }}>
            {status === "loading"
              ? "Confirmando seu e-mail..."
              : isError && !message
                ? t("confirmEmailMissingKey")
                : message}
          </p>

          <Link className="auth-submit" to={loginPath} style={{ textAlign: "center" }}>
            {t("confirmEmailLoginButton")}
          </Link>
        </section>
      </section>
    </main>
  );
}
