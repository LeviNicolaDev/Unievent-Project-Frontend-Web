import { CalendarDays, Clock, MapPin, Tag } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AdminHeader } from '../components/navigation/AdminHeader.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useLanguage } from '../hooks/useLanguage.js';
import { getEventById } from '../services/eventService.js';
import { formatDate, getAssetUrl } from '../utils/formatters.js';

export function EventPreviewPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [error, setError] = useState('');
  const backTo = user?.roleUsuario === 'Secretaria' ? '/instituicao/eventos' : '/eventos';
  useEffect(() => {
    let active = true;
    setEvent(null);
    setError('');
    getEventById(id).then(value => { if (active) setEvent(value); })
      .catch(err => { if (active) setError(err.message || 'Não foi possível carregar a prévia.'); });
    return () => { active = false; };
  }, [id]);
  const isPublic = String(event?.visibility).toLowerCase() === 'publico';

  return (
    <>
      <AdminHeader title={t('previewTitle')} backTo={backTo} />
      <section className="preview-wrapper">
        {error ? <p role="alert">{error}</p> : !event ? <p>Carregando prévia...</p> : <article className="phone-preview">
          <img className="preview-cover" src={event.image || getAssetUrl('evento.png')} alt={event.nome} />
          <h1>{event.nome}</h1>
          <div className="preview-meta">
            <p><MapPin size={18} />{event.local || event.instituicaoNome}</p>
            <div><p><CalendarDays size={18} />{formatDate(event.dataEvento)}</p><p><Clock size={18} />{event.time || '-'}</p></div>
            <p><Tag size={18} />{event.categoria}</p>
          </div>
          <div className="preview-content">
            <p className="organizer-label">{t('organizer')}</p>
            <div className="organizer-row"><Tag size={18} /><span>{event.responsibleName || event.instituicaoNome}</span></div>
            <h2>{t('aboutEvent')}</h2>
            <p>{event.descricao}</p>
            {isPublic ? <Link className="ticket-button" to={`/descobrir-eventos/${id}`}>Abrir página pública</Link>
              : <p>Evento privado: prévia disponível apenas na área administrativa.</p>}
          </div>
        </article>}
      </section>
    </>
  );
}
