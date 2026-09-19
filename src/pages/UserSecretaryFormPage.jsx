import { Building2, IdCard, KeyRound, Mail, ShieldCheck, UserRoundPlus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FormField } from '../components/forms/FormField.jsx';
import { AdminHeader } from '../components/navigation/AdminHeader.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Modal } from '../components/ui/Modal.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { listInstitutions } from '../services/institutionService.js';
import { getUserSecretaryById, saveUserSecretary } from '../services/userSecretaryService.js';
import { getAssetUrl } from '../utils/formatters.js';

function generateConfirmationKey() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}

const emptyForm = {
  nomeUsuario: '',
  emailUsuario: '',
  senha: '',
  instituicaoId: '',
};

export function UserSecretaryFormPage({ mode = 'create' }) {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [institutions, setInstitutions] = useState([]);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const isEdit = mode === 'edit';
  const isGlobalAdmin = user?.roleUsuario === 'Admin' && !user?.instituicaoId;

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      if (!isGlobalAdmin) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError('');

      try {
        const [loadedInstitutions, loadedUser] = await Promise.all([
          listInstitutions(),
          isEdit ? getUserSecretaryById(id) : Promise.resolve(null),
        ]);
        if (!isMounted) return;

        setInstitutions(Array.isArray(loadedInstitutions) ? loadedInstitutions : []);
        if (loadedUser) {
          setForm({
            nomeUsuario: loadedUser.nomeUsuario || '',
            emailUsuario: loadedUser.emailUsuario || '',
            senha: '',
            instituicaoId: loadedUser.instituicaoId ? String(loadedUser.instituicaoId) : '',
          });
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Erro ao carregar cadastro');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [id, isEdit, isGlobalAdmin]);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    setError('');

    if (!isGlobalAdmin) {
      setError('Apenas o Admin UniEvent pode cadastrar usuários Secretaria.');
      return;
    }

    if (!form.instituicaoId) {
      setError('Selecione a instituição que esse usuário Secretaria vai administrar.');
      return;
    }

    try {
      await saveUserSecretary({
        id: isEdit ? id : undefined,
        nomeUsuario: form.nomeUsuario,
        emailUsuario: form.emailUsuario,
        senha: form.senha,
        roleUsuario: 'Secretaria',
        role: 'Secretaria',
        chave: generateConfirmationKey(),
        instituicaoId: form.instituicaoId,
      });
      setOpen(true);
    } catch (err) {
      setError(err.message || 'Erro ao salvar usuário Secretaria');
    }
  }

  if (!isGlobalAdmin) {
    return (
      <>
        <AdminHeader title="Cadastro Usuário Secretaria" backTo="/secretarias" />
        <main className="responsible-editor-page">
          <section className="people-panel">
            <div className="people-empty">
              <IdCard size={36} />
              <p>Apenas o Admin UniEvent pode cadastrar usuários Secretaria.</p>
            </div>
          </section>
        </main>
      </>
    );
  }

  if (isLoading) {
    return (
      <>
        <AdminHeader title="Cadastro Usuário Secretaria" backTo="/secretarias" />
        <main className="responsible-editor-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
          <p>Carregando...</p>
        </main>
      </>
    );
  }

  return (
    <>
      <AdminHeader title="Cadastro Usuário Secretaria" backTo="/secretarias" />
      <main className="responsible-editor-page">
        <section className="responsible-editor-hero">
          <div>
            <span className="responsible-editor-eyebrow">Cadastro Usuário Secretaria</span>
            <h1>{isEdit ? 'Editar usuário Secretaria' : 'Cadastrar usuário Secretaria'}</h1>
            <p>Esse usuário administra somente a instituição selecionada e não acessa dados de outras FATECs.</p>
          </div>

          <div className="responsible-editor-notes" aria-label="Resumo do cadastro">
            <article>
              <UserRoundPlus size={20} />
              <span>Perfil Secretaria</span>
            </article>
            <article>
              <Building2 size={20} />
              <span>Vínculo institucional</span>
            </article>
            <article>
              <ShieldCheck size={20} />
              <span>Acesso isolado</span>
            </article>
          </div>
        </section>

        <section className="responsible-editor-card admin-flow-form-card">
          <div className="responsible-editor-card-header">
            <div>
              <span>Formulário</span>
              <h2>Dados do usuário Secretaria</h2>
            </div>
            <p>Selecione a instituição antes de salvar para que o acesso fique limitado à FATEC correta.</p>
          </div>

          <form className="responsible-form" onSubmit={submit}>
            {error && <div className="admin-flow-alert">{error}</div>}

            <FormField label="Nome do usuário">
              <input value={form.nomeUsuario} onChange={(event) => updateField('nomeUsuario', event.target.value)} placeholder="Secretaria Fatec" required />
            </FormField>

            <FormField label="Email do usuário">
              <span className="admin-flow-input-icon">
                <Mail size={18} />
                <input type="email" value={form.emailUsuario} onChange={(event) => updateField('emailUsuario', event.target.value)} placeholder="secretaria@fatec.sp.gov.br" required />
              </span>
            </FormField>

            <FormField label={isEdit ? 'Nova senha' : 'Senha inicial'}>
              <span className="admin-flow-input-icon">
                <KeyRound size={18} />
                <input type="password" value={form.senha} onChange={(event) => updateField('senha', event.target.value)} placeholder={isEdit ? 'Preencha apenas se quiser alterar' : 'Senha inicial'} required={!isEdit} />
              </span>
            </FormField>

            <FormField label="Instituição administrada">
              <select value={form.instituicaoId} onChange={(event) => updateField('instituicaoId', event.target.value)} required>
                <option value="">Selecione a instituição</option>
                {institutions.map((institution) => (
                  <option key={institution.id} value={institution.id}>
                    {institution.nome || institution.nomeAbreviado || `Instituição #${institution.id}`}
                  </option>
                ))}
              </select>
            </FormField>

            <div className="admin-flow-fixed-role">
              <IdCard size={18} />
              <span>Perfil aplicado: Secretaria</span>
            </div>

            <div className="responsible-form-actions">
              <Button type="submit">{isEdit ? 'Salvar usuário Secretaria' : 'Cadastrar usuário Secretaria'}</Button>
            </div>
          </form>
        </section>
      </main>

      <Modal
        open={open}
        title="Cadastro Usuário Secretaria"
        message={isEdit ? 'Usuário Secretaria atualizado com sucesso.' : 'Usuário Secretaria cadastrado com sucesso.'}
        image={getAssetUrl('emoteAcess.png')}
        confirmText="Ok"
        onClose={() => navigate('/secretarias')}
        onConfirm={() => navigate('/secretarias')}
      />
    </>
  );
}
