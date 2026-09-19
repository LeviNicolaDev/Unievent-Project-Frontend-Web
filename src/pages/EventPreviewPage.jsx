import { CalendarDays, Clock, Heart, MapPin, Tag } from 'lucide-react';
import { AdminHeader } from '../components/navigation/AdminHeader.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useLanguage } from '../hooks/useLanguage.js';
import evento from '../assets/images/evento.png';

export function EventPreviewPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const backTo = user?.roleUsuario === 'Secretaria' ? '/instituicao/eventos' : '/eventos';

  return (
    <>
      <AdminHeader title={t('previewTitle')} backTo={backTo} />
      <section className="preview-wrapper">
        <article className="phone-preview">
          <div className="phone-preview-top"><span>‹</span><Heart size={22} /></div>
          <img className="preview-cover" src={evento} alt="The Rock" />
          <h1>The Rock - 5º Edição</h1>
          <div className="preview-meta">
            <p><MapPin size={18} />Fatec Ferraz de Vasconcelos</p>
            <div><p><CalendarDays size={18} />25/01/2026</p><p><Clock size={18} />19:00</p></div>
            <p><Tag size={18} />{t('categoryMusic')}</p>
          </div>
          <div className="preview-content">
            <p className="organizer-label">{t('organizer')}</p>
            <div className="organizer-row"><Tag size={18} /><span>Fatec Ferraz de Vasconcelos</span><button>{t('learnMore')}</button></div>
            <h2>{t('aboutEvent')}</h2>
            <p>{t('previewCopy')}</p>
            <button className="ticket-button">{t('getTicket')}</button>
          </div>
        </article>
      </section>
    </>
  );
}
