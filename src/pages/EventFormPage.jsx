import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CalendarPlus, ImagePlus, UsersRound } from 'lucide-react';
import { AdminHeader } from '../components/navigation/AdminHeader.jsx';
import { EventForm } from '../components/forms/EventForm.jsx';
import { Modal } from '../components/ui/Modal.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useLanguage } from '../hooks/useLanguage.js';
import { getEventById, saveEvent } from '../services/eventService.js';
import { listInstitutions } from '../services/institutionService.js';
import { listResponsiblePeople } from '../services/responsibleService.js';
import { getAssetUrl } from '../utils/formatters.js';

export function EventFormPage({ mode }) {
  const { t } = useLanguage();
  const { logout, user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = mode === 'edit';
  const [event, setEvent] = useState(null);
  const [institutions, setInstitutions] = useState([]);
  const [responsiblePeople, setResponsiblePeople] = useState([]);
  const [modal, setModal] = useState(null);
  const [isLoading, setIsLoading] = useState(isEdit);
  const [error, setError] = useState('');
  const routePrefix = user?.roleUsuario === 'Secretaria' ? '/instituicao/eventos' : '/eventos';
  const isGlobalAdmin = user?.roleUsuario === 'Admin' && !user?.instituicaoId;

  useEffect(() => {
    let isMounted = true;

    async function loadFormData() {
      setIsLoading(true);
      setError('');

      try {
        const [people, loadedInstitutions, eventData] = await Promise.all([
          listResponsiblePeople(),
          isGlobalAdmin ? listInstitutions().catch(() => []) : Promise.resolve([]),
          isEdit ? getEventById(id) : Promise.resolve(null),
        ]);

        if (!isMounted) return;

        setResponsiblePeople(Array.isArray(people) ? people : []);
        setInstitutions(Array.isArray(loadedInstitutions) ? loadedInstitutions : []);
        if (isEdit) {
          setEvent(eventData);
        }
      } catch (err) {
        if (!isMounted) return;
        if (err.status === 401) {
          logout();
          navigate('/login', { replace: true });
          return;
        }
        setError(err.message || 'Erro ao carregar dados do evento');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadFormData();

    return () => {
      isMounted = false;
    };
  }, [id, isEdit, isGlobalAdmin]);

  async function handleSubmit(payload) {
    setError('');

    try {
      await saveEvent(payload);
      setModal({
        title: isEdit ? t('updateEvent') : t('createEvent'),
        message: isEdit ? t('eventUpdated') : t('eventCreated'),
      });
    } catch (err) {
      if (err.status === 401) {
        logout();
        navigate('/login', { replace: true });
        return;
      }
      setError(err.message || 'Erro ao salvar evento');
    }
  }

  if (isLoading) {
    return (
      <>
        <AdminHeader title={isEdit ? t('updateEvent') : t('createEvent')} backTo={routePrefix} />
        <main className="event-editor-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
          <p>{t('loading') || 'Carregando...'}</p>
        </main>
      </>
    );
  }

  return (
    <>
      <AdminHeader title={isEdit ? t('updateEvent') : t('createEvent')} backTo={routePrefix} />
      <main className="event-editor-page">
        <section className="event-editor-hero">
          <div>
            <span className="event-editor-eyebrow">{isEdit ? t('editRegistration') : t('eventEditorNew')}</span>
            <h1>{isEdit ? t('eventEditorTitleEdit') : t('eventEditorTitleCreate')}</h1>
            <p>{t('eventEditorCopy')}</p>
          </div>

          <div className="event-editor-notes" aria-label={t('formSummary')}>
            <article>
              <CalendarPlus size={20} />
              <span>{t('dateAndTime')}</span>
            </article>
            <article>
              <UsersRound size={20} />
              <span>{t('responsible')}</span>
            </article>
            <article>
              <ImagePlus size={20} />
              <span>{t('eventImage')}</span>
            </article>
          </div>
        </section>

        <section className="event-editor-card">
          <div className="event-editor-card-header">
            <div>
              <span>{t('form')}</span>
              <h2>{isEdit ? t('eventData') : t('eventDetails')}</h2>
            </div>
            <p>{isEdit ? t('reviewBeforeSave') : t('fieldsAppear')}</p>
          </div>

          {error ? (
            <div style={{ background: '#fee2e2', color: '#991b1b', padding: '1rem', marginBottom: '1rem', borderRadius: '0.5rem' }}>
              {error}
            </div>
          ) : null}

          {isEdit && !event ? null : (
            <EventForm
              event={event}
              institutions={institutions}
              responsiblePeople={responsiblePeople}
              showInstitutionSelect={isGlobalAdmin}
              submitLabel={isEdit ? t('updateEvent') : t('createEvent')}
              onSubmit={handleSubmit}
            />
          )}
        </section>
      </main>
      <Modal
        open={Boolean(modal)}
        title={modal?.title}
        message={modal?.message}
        image={getAssetUrl('emoteAcess.png')}
        confirmText={t('ok')}
        onClose={() => navigate(routePrefix)}
        onConfirm={() => navigate(routePrefix)}
      />
    </>
  );
}
