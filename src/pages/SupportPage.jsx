import { useTheme } from '../hooks/useTheme.js';
import { AdminHeader } from '../components/navigation/AdminHeader.jsx';
import { useLanguage } from '../hooks/useLanguage.js';

export function SupportPage() {
  const { isLight, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  return (
    <>
      <AdminHeader title={t('supportTitle')} />
      <section className="support-panel">
        <div className="theme-row">
          <p>{t('lightMode')}</p>
          <label className="switch">
            <input type="checkbox" checked={isLight} onChange={(event) => setTheme(event.target.checked ? 'light' : 'dark')} />
            <span />
          </label>
        </div>
        <div className="language-buttons">
          <button className={language === 'pt' ? 'active' : ''} type="button" onClick={() => setLanguage('pt')}>{t('portuguese')}</button>
          <button className={language === 'en' ? 'active' : ''} type="button" onClick={() => setLanguage('en')}>{t('english')}</button>
        </div>
      </section>
    </>
  );
}
