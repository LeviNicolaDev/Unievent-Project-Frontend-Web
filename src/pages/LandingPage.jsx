import { MemberCard } from '../components/cards/MemberCard.jsx';
import { LandingNav } from '../components/navigation/LandingNav.jsx';
import { useLanguage } from '../hooks/useLanguage.js';
import { useTheme } from '../hooks/useTheme.js';
import letraBranca from '../assets/images/letrabranca.svg';
import sobre from '../assets/images/sobre1.svg';
import intro from '../assets/images/Intro.svg';
import intro2 from '../assets/images/Intro 2.svg';
import signin from '../assets/images/Sign in.png';
import signup from '../assets/images/Sign Up.png';
import home from '../assets/images/Home.svg';
import detalhe from '../assets/images/fotodetalhevento.svg';
import ticket from '../assets/images/Ticket.svg';
import profile from '../assets/images/Profile.svg';
import claudio from '../assets/images/foto claudio.jpeg';
import levi from '../assets/images/foto levi.jpg';
import ryan from '../assets/images/perfil.jpg';

const appScreens = [intro, intro2, signin, signup, home, detalhe, ticket, profile];

const members = [
  { name: 'Claudio Rodrigues', photo: claudio, githubUrl: 'https://github.com/ClaudioRodri', linkedinUrl: 'https://www.linkedin.com/in/claudio-rodrigues-' },
  { name: 'Levi Nicola', photo: levi, githubUrl: 'https://github.com/RedFoX1029', linkedinUrl: 'https://www.linkedin.com/in/levi-nicola-803037258/' },
  { name: 'Ryan Dias', photo: ryan, githubUrl: 'https://github.com/0RyanSouza0', linkedinUrl: 'https://www.linkedin.com/in/ryan-dias-367813300/' },
];

export function LandingPage() {
  const { t } = useLanguage();
  const { isLight, setTheme } = useTheme();
  const toggleTheme = () => setTheme(isLight ? 'dark' : 'light');

  return (
    <div className="landing-page landing-modern">
      <header className="landing-modern-hero" id="inicio">
        <LandingNav isLight={isLight} onThemeToggle={toggleTheme} />

        <section className="landing-hero-grid" id="sobre">
          <div className="landing-hero-copy">
            <span className="landing-eyebrow">{t('landingEyebrow')}</span>
            <h1>{t('landingTitle')}</h1>
            <p>{t('landingCopy')}</p>
            <div className="landing-hero-actions">
              <a className="landing-primary-action" href="#aplicativo">{t('landingPrimary')}</a>
              <a className="landing-secondary-action" href="#contato">{t('landingSecondary')}</a>
            </div>
          </div>

          <div className="landing-phone-showcase" aria-label="Previa do aplicativo UniEvent">
            <img className="landing-phone-main" src={home} alt="Tela inicial do UniEvent" />
            <img className="landing-phone-float landing-phone-float-a" src={ticket} alt="Tela de ingresso do UniEvent" />
            <img className="landing-phone-float landing-phone-float-b" src={profile} alt="Tela de perfil do UniEvent" />
          </div>
        </section>
      </header>

      <main>
        <section className="landing-feature-band" aria-label={t('landingHighlights')}>
          <article>
            <strong>{t('landingEventsTitle')}</strong>
            <span>{t('landingEventsDesc')}</span>
          </article>
          <article>
            <strong>{t('landingCommunityTitle')}</strong>
            <span>{t('landingCommunityDesc')}</span>
          </article>
          <article>
            <strong>{t('landingManagementTitle')}</strong>
            <span>{t('landingManagementDesc')}</span>
          </article>
        </section>

        <section className="landing-app-section" id="aplicativo">
          <div className="landing-section-heading">
            <img src={letraBranca} alt="" />
            <span>{t('landingApp')}</span>
            <h2>{t('landingScreens')}</h2>
          </div>
          <div className="landing-screen-grid">
            {appScreens.map((screen, index) => (
              <article className="landing-screen-card" key={screen}>
                <img src={screen} alt={`Tela ${index + 1} do aplicativo UniEvent`} />
              </article>
            ))}
          </div>
        </section>

        <section className="landing-members-section" id="integrantes">
          <div className="landing-section-heading">
            <img src={letraBranca} alt="" />
            <span>{t('landingTeam')}</span>
            <h2>{t('landingTeamTitle')}</h2>
          </div>
          <div className="landing-member-grid">
            {members.map((member) => <MemberCard key={member.name} {...member} />)}
          </div>
        </section>

        <section className="landing-contact-section" id="contato">
          <div className="landing-contact-art">
            <img src={sobre} alt="" />
            <p>{t('landingContactCopy')}</p>
          </div>

          <form className="landing-contact-form">
            <span>{t('landingContact')}</span>
            <h2>{t('contactUs')}</h2>
            <label>
              {t('fullName')}
              <input placeholder={t('enterName')} />
            </label>
            <label>
              {t('email')}
              <input placeholder={t('enterEmail')} type="email" />
            </label>
            <label>
              {t('message')}
              <textarea placeholder={t('enterMessage')} minLength="20" maxLength="500" rows="6" />
            </label>
            <button type="button">{t('send')}</button>
          </form>
        </section>
      </main>

      <footer className="landing-modern-footer">
        <div>
          <strong>UniEvent</strong>
          <span>FATEC - Ferraz de Vasconcelos</span>
        </div>
        <div>
          <span>{t('integratorProject')}</span>
          <span>@2025</span>
        </div>
      </footer>
    </div>
  );
}
