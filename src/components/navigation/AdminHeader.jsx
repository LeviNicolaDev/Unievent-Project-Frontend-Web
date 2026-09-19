import {
  ArrowLeft,
  Award,
  Building2,
  CalendarDays,
  Home,
  IdCard,
  LogOut,
  Moon,
  Sun,
  UsersRound,
} from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import logoAdmin from "../../assets/images/logo3.png";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { useLanguage } from "../../hooks/useLanguage.js";
import { useTheme } from "../../hooks/useTheme.js";

const adminLinks = [
  { to: "/home", labelKey: "navHome", icon: Home },
  { to: "/instituicoes", labelKey: "navInstitutions", icon: Building2, globalOnly: true },
  { to: "/secretarias", labelKey: "navSecretarias", icon: IdCard, globalOnly: true },
  { to: "/eventos", labelKey: "navEvents", icon: CalendarDays },
  { to: "/responsaveis", labelKey: "navPeople", icon: UsersRound },
  { to: "/certificados", labelKey: "navCertificates", icon: Award },
];

const secretariaLinks = [
  { to: "/instituicao/dashboard", labelKey: "navHome", icon: Home },
  { to: "/instituicao/eventos", labelKey: "navEvents", icon: CalendarDays },
  { to: "/instituicao/responsaveis", labelKey: "navPeople", icon: UsersRound },
  { to: "/instituicao/certificados", labelKey: "navCertificates", icon: Award },
];

export function AdminHeader({ title, backTo = "/home", greeting, actions }) {
  const { language, setLanguage, t } = useLanguage();
  const { isLight, setTheme } = useTheme();
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const isGlobalAdmin = user?.roleUsuario === "Admin" && !user?.instituicaoId;
  const links = isGlobalAdmin ? adminLinks : secretariaLinks;

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <header className="admin-header">
      <div className="admin-brand">
        <img src={logoAdmin} alt="UniEvent" />
        <p>{greeting}</p>
      </div>

      <nav className="admin-nav" aria-label={t("navigationAdmin")}>
        {links.filter((link) => !link.globalOnly || isGlobalAdmin).map(({ to, labelKey, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            <Icon size={17} />
            <span>{t(labelKey)}</span>
          </NavLink>
        ))}
      </nav>

      <div className="admin-header-actions">
        {actions}
        <button
          className="admin-language-toggle"
          type="button"
          onClick={() => setLanguage(language === "en" ? "pt" : "en")}
          aria-label={t("language")}
          title={t("language")}
        >
          {language === "en" ? "PT" : "EN"}
        </button>
        <button
          className="admin-theme-toggle"
          type="button"
          onClick={() => setTheme(isLight ? "dark" : "light")}
          aria-label={isLight ? t("activateDark") : t("activateLight")}
          title={isLight ? t("themeDark") : t("themeLight")}
        >
          {isLight ? <Moon size={18} /> : <Sun size={18} />}
        </button>
        {backTo ? (
          <Link className="back-link" to={backTo}>
            <ArrowLeft size={18} />
            <span>{t("back")}</span>
          </Link>
        ) : (
          <button
            className="back-link"
            type="button"
            onClick={handleLogout}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <LogOut size={18} />
            <span>{t("logout")}</span>
          </button>
        )}
      </div>
    </header>
  );
}
