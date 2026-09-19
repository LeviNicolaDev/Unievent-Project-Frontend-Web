import { Pencil, Plus, Search, Trash2, UserCheck, UsersRound } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminHeader } from '../components/navigation/AdminHeader.jsx';
import { Modal } from '../components/ui/Modal.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useLanguage } from '../hooks/useLanguage.js';
import { deleteResponsible, listResponsiblePeople } from '../services/responsibleService.js';
import { getAssetUrl } from '../utils/formatters.js';

export function PeopleManagementPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [people, setPeople] = useState([]);
  const [search, setSearch] = useState('');
  const [personToDelete, setPersonToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const routePrefix = user?.roleUsuario === 'Secretaria' ? '/instituicao/responsaveis' : '/responsaveis';

  useEffect(() => {
    loadPeople();
  }, []);

  async function loadPeople() {
    setIsLoading(true);
    setError(null);
    try {
      const data = await listResponsiblePeople();
      setPeople(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Erro ao carregar responsáveis');
      console.error('Erro:', err);
    } finally {
      setIsLoading(false);
    }
  }

  const filteredPeople = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return people;
    }

    return people.filter((person) => {
      const name = person.nome || person.name || '';
      return name.toLowerCase().includes(normalizedSearch);
    });
  }, [people, search]);

  async function confirmDelete() {
    try {
      await deleteResponsible(personToDelete.id);
      setPeople((current) => current.filter((person) => person.id !== personToDelete.id));
      setPersonToDelete(null);
    } catch (err) {
      setError(err.message || 'Erro ao deletar responsável');
    }
  }

  function getPersonName(person) {
    return person.nome || person.name || '';
  }

  function getPersonAvatar(person) {
    return person.fotoPerfil || person.avatar || getAssetUrl('avatar-placeholder.png');
  }

  if (isLoading) {
    return (
      <>
        <AdminHeader title={t('managePeople')} />
        <main className="people-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
          <p>{t('loading') || 'Carregando...'}</p>
        </main>
      </>
    );
  }

  return (
    <>
      <AdminHeader title={t('managePeople')} />

      <main className="people-page">
        {error && (
          <div style={{ background: '#fee2e2', color: '#991b1b', padding: '1rem', margin: '1rem', borderRadius: '0.5rem' }}>
            {error}
          </div>
        )}

        <section className="people-toolbar">
          <div>
            <span className="people-eyebrow">{t('peopleTeam')}</span>
            <h1>{t('managePeople')}</h1>
            <p>{t('peopleCopy')}</p>
          </div>

          <Link className="people-create-link" to={`${routePrefix}/novo`}>
            <Plus size={18} />
            <span>{t('newResponsible')}</span>
          </Link>
        </section>

        <section className="people-summary" aria-label={t('peopleSummary')}>
          <article>
            <UsersRound size={20} />
            <strong>{people.length}</strong>
            <span>{t('people')}</span>
          </article>
          <article>
            <UserCheck size={20} />
            <strong>{filteredPeople.length}</strong>
            <span>{t('results')}</span>
          </article>
        </section>

        <section className="people-panel">
          <div className="people-panel-header">
            <div>
              <h2>{t('registeredResponsible')}</h2>
              <p>{t('recordsFound', { count: filteredPeople.length })}</p>
            </div>

            <label className="people-search">
              <Search size={18} />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t('searchPerson')} />
            </label>
          </div>

          {filteredPeople.length ? (
            <div className="people-grid">
              {filteredPeople.map((person) => (
                <article className="person-card" key={person.id}>
                  <img
                    src={getPersonAvatar(person)}
                    alt={getPersonName(person)}
                    onError={(event) => {
                      event.currentTarget.src = getAssetUrl('avatar-placeholder.png');
                    }}
                  />
                  <div>
                    <span>{t('responsibleLabel')}</span>
                    <h3>{getPersonName(person)}</h3>
                    <p>{t('personLinked')}</p>
                  </div>
                  <div className="person-actions">
                    <Link to={`${routePrefix}/${person.id}/editar`} title={t('editResponsible')}>
                      <Pencil size={17} />
                    </Link>
                    <button type="button" title={t('deleteResponsible')} onClick={() => setPersonToDelete(person)}>
                      <Trash2 size={17} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="people-empty">
              <UsersRound size={36} />
              <p>{t('noPeople')}</p>
            </div>
          )}
        </section>
      </main>

      <Modal
        open={Boolean(personToDelete)}
        title={t('deleteResponsibleTitle')}
        message={t('deleteResponsibleMessage')}
        image={getAssetUrl('warning.jpg')}
        onClose={() => setPersonToDelete(null)}
        onConfirm={confirmDelete}
      />
    </>
  );
}
