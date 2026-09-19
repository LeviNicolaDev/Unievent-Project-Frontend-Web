import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Camera, ShieldCheck, UserPlus, UsersRound } from 'lucide-react';
import { AdminHeader } from '../components/navigation/AdminHeader.jsx';
import { Button } from '../components/ui/Button.jsx';
import { FormField } from '../components/forms/FormField.jsx';
import { Modal } from '../components/ui/Modal.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useLanguage } from '../hooks/useLanguage.js';
import { listInstitutions } from '../services/institutionService.js';
import { getResponsibleById, saveResponsible } from '../services/responsibleService.js';
import { getAssetUrl } from '../utils/formatters.js';

export function ResponsibleFormPage({ mode = 'create' }) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { id } = useParams();
  const [name, setName] = useState('');
  const [institutionId, setInstitutionId] = useState('');
  const [institutions, setInstitutions] = useState([]);
  const [preview, setPreview] = useState(getAssetUrl('avatar-placeholder.png'));
  const [photo, setPhoto] = useState(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(mode === 'edit');
  const navigate = useNavigate();
  const isEdit = mode === 'edit';
  const routePrefix = user?.roleUsuario === 'Secretaria' ? '/instituicao/responsaveis' : '/responsaveis';

  useEffect(() => {
    let isMounted = true;

    async function loadResponsible() {
      setIsLoading(true);
      setError('');

      try {
        const [responsible, loadedInstitutions] = await Promise.all([
          isEdit ? getResponsibleById(id) : Promise.resolve(null),
          listInstitutions().catch(() => []),
        ]);
        if (!isMounted) return;

        setInstitutions(Array.isArray(loadedInstitutions) ? loadedInstitutions : []);
        if (responsible) {
          setName(responsible?.nome || responsible?.name || '');
          setInstitutionId(String(responsible?.instituicaoId || responsible?.InstituicaoId || ''));
          setPreview(responsible?.fotoPerfil || responsible?.avatar || getAssetUrl('avatar-placeholder.png'));
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Erro ao carregar responsável');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadResponsible();

    return () => {
      isMounted = false;
    };
  }, [id, isEdit]);

  async function submit(event) {
    event.preventDefault();
    setError('');

    try {
      await saveResponsible({ id: isEdit ? id : undefined, nome: name, fotoPerfil: photo, instituicaoId: institutionId });
      setOpen(true);
    } catch (err) {
      setError(err.message || 'Erro ao salvar responsável');
    }
  }

  function handleImage(event) {
    const file = event.target.files?.[0];
    if (file) {
      setPhoto(file);
      setPreview(URL.createObjectURL(file));
    }
  }

  if (isLoading) {
    return (
      <>
        <AdminHeader title={isEdit ? t('editResponsible') : t('createResponsible')} backTo={routePrefix} />
        <main className="responsible-editor-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
          <p>{t('loading') || 'Carregando...'}</p>
        </main>
      </>
    );
  }

  return (
    <>
      <AdminHeader title={isEdit ? t('editResponsible') : t('createResponsible')} backTo={routePrefix} />
      <main className="responsible-editor-page">
        <section className="responsible-editor-hero">
          <div>
            <span className="responsible-editor-eyebrow">{t('responsibleNewEyebrow')}</span>
            <h1>{isEdit ? t('editResponsible') : t('responsibleNewTitle')}</h1>
            <p>{t('responsibleNewCopy')}</p>
          </div>

          <div className="responsible-editor-notes" aria-label={t('formSummary')}>
            <article>
              <UserPlus size={20} />
              <span>{t('accessProfile')}</span>
            </article>
            <article>
              <UsersRound size={20} />
              <span>{t('organizerTeam')}</span>
            </article>
            <article>
              <ShieldCheck size={20} />
              <span>{t('responsibleForEvents')}</span>
            </article>
          </div>
        </section>

        <section className="responsible-editor-card">
          <div className="responsible-editor-card-header">
            <div>
              <span>{t('form')}</span>
              <h2>{t('responsibleData')}</h2>
            </div>
            <p>{t('responsibleHint')}</p>
          </div>

          <form className="responsible-form" onSubmit={submit}>
            {error && (
              <div className="auth-error-message" style={{ color: '#dc2626', marginBottom: '1rem' }}>
                {error}
              </div>
            )}

            <FormField label={t('responsibleName')}>
              <input placeholder={t('responsibleName')} value={name} onChange={(event) => setName(event.target.value)} required />
            </FormField>

            {institutions.length > 0 ? (
              <FormField label="Instituição">
                <select value={institutionId} onChange={(event) => setInstitutionId(event.target.value)} required>
                  <option value="">Selecione a instituição</option>
                  {institutions.map((institution) => (
                    <option key={institution.id || institution.Id} value={institution.id || institution.Id}>
                      {institution.nome || institution.Nome || institution.nomeAbreviado || institution.NomeAbreviado || `Instituição #${institution.id || institution.Id}`}
                    </option>
                  ))}
                </select>
              </FormField>
            ) : null}

            <FormField label={t('profilePhoto')}>
              <span className="profile-upload-box">
                <input type="file" accept="image/*" onChange={handleImage} required={!isEdit} />
                <img
                  src={preview}
                  alt={t('responsiblePreviewAlt')}
                  onError={(event) => {
                    event.currentTarget.src = getAssetUrl('avatar-placeholder.png');
                  }}
                />
                <span><Camera size={18} />{t('changePhoto')}</span>
              </span>
            </FormField>

            <div className="responsible-form-actions">
              <Button type="submit">{t('send')}</Button>
            </div>
          </form>
        </section>
      </main>
      <Modal
        open={open}
        title={isEdit ? t('editResponsible') : t('createResponsible')}
        message={isEdit ? 'Responsável atualizado com sucesso.' : t('responsibleCreated')}
        image={getAssetUrl('emoteAcess.png')}
        confirmText={t('ok')}
        onClose={() => navigate(routePrefix)}
        onConfirm={() => navigate(routePrefix)}
      />
    </>
  );
}
