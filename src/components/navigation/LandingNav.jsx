import { ArrowUpRight, Github, LogIn, LogOut, Menu, Moon, Sun, Ticket, X } from 'lucide-react';
import { useId, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/images/logo.svg';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useLanguage } from '../../hooks/useLanguage.js';
import { isPublicParticipant } from '../../services/authService.js';

export function LandingNav({ isLight, onThemeToggle }) {
  const { language, setLanguage, t } = useLanguage();
  const { user, logout } = useAuth();
  const publicUser = isPublicParticipant(user);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = useId();
  const menuButton = useRef(null);
  const closeMenu = () => setMenuOpen(false);

  function handleKeyDown(event) {
    if (event.key === 'Escape' && menuOpen) {
      closeMenu();
      menuButton.current?.focus();
    }
  }

  return (
    <nav className="landing-modern-nav" aria-label={t('navigationPublic')} onKeyDown={handleKeyDown}>
      <a className="landing-modern-brand" href="#inicio" aria-label="UniEvent" onClick={closeMenu}>
        <img src={logo} alt="" />
      </a>

      <button
        ref={menuButton}
        className="landing-menu-toggle"
        type="button"
        aria-expanded={menuOpen}
        aria-controls={menuId}
        aria-label={menuOpen ? t('closeMenu') : t('openMenu')}
        onClick={() => setMenuOpen((open) => !open)}
      >
        {menuOpen ? <X size={21} aria-hidden="true" /> : <Menu size={21} aria-hidden="true" />}
        <span>Menu</span>
      </button>

      <div className={`landing-nav-content${menuOpen ? ' is-open' : ''}`} id={menuId}>
        <div className="landing-modern-links">
          <a href="#sobre" onClick={closeMenu}>{t('landingAbout')}</a>
          <Link to="/descobrir-eventos" onClick={closeMenu}>{t('navEvents')}</Link>
          <a href="#aplicativo" onClick={closeMenu}>{t('landingApp')}</a>
          <a href="#integrantes" onClick={closeMenu}>{t('landingMembers')}</a>
          <a href="#contato" onClick={closeMenu}>{t('landingContact')}</a>
          <Link className="landing-secretary-link" to="/secretaria/cadastro" onClick={closeMenu}>
            {t('secretaryRegistration')} <ArrowUpRight size={14} aria-hidden="true" />
          </Link>
        </div>

        <div className="landing-modern-actions">
          <div className="landing-nav-preferences">
            <button
              className="landing-language-toggle"
              type="button"
              onClick={() => setLanguage(language === 'en' ? 'pt' : 'en')}
              aria-label={language === 'en' ? 'Mudar para português' : 'Switch to English'}
              title={language === 'en' ? 'Mudar para português' : 'Switch to English'}
            >
              {language === 'en' ? 'PT' : 'EN'}
            </button>
            <button
              className="landing-theme-toggle"
              type="button"
              onClick={onThemeToggle}
              aria-label={isLight ? t('activateDark') : t('activateLight')}
              title={isLight ? t('themeDark') : t('themeLight')}
            >
              {isLight ? <Moon size={19} aria-hidden="true" /> : <Sun size={19} aria-hidden="true" />}
            </button>
            <a
              className="landing-icon-action"
              href="https://github.com/0RyanSouza0/landing-page-unievent"
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
              title="GitHub"
            >
              <Github size={19} aria-hidden="true" />
            </a>
          </div>
          <div className="landing-nav-account">
            {publicUser ? (
              <>
                <Link className="landing-login-action" to="/meus-ingressos" onClick={closeMenu}>
                  <Ticket size={18} aria-hidden="true" /> {t('myTickets')}
                </Link>
                <button className="landing-logout-action" type="button" onClick={() => { logout(); closeMenu(); }}>
                  <LogOut size={18} aria-hidden="true" /> {t('logout')}
                </button>
              </>
            ) : (
              <Link className="landing-login-action" to="/entrar" onClick={closeMenu}>
                <LogIn size={18} aria-hidden="true" /> {t('publicLogin')}
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
