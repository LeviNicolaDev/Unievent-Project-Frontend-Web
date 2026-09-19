import { Building2, CheckCircle2, KeyRound, Mail, Send, UserRoundPlus } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FormField } from '../components/forms/FormField.jsx';
import { Button } from '../components/ui/Button.jsx';
import { listPublicInstitutions } from '../services/institutionService.js';
import { requestUserSecretaryRegistration } from '../services/userSecretaryService.js';

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
  confirmSenha: '',
  instituicaoId: '',
};

export function SecretaryRegistrationPage() {
  const [form, setForm] = useState(emptyForm);
  const [institutions, setInstitutions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadInstitutions() {
      setIsLoading(true);
      setError('');

      try {
        const data = await listPublicInstitutions();
        if (!isMounted) return;
        setInstitutions((Array.isArray(data) ? data : []).filter((institution) => institution.id));
      } catch (err) {
        if (isMounted) setError(err.message || 'Erro ao carregar instituições');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadInstitutions();

    return () => {
      isMounted = false;
    };
  }, []);

  const sortedInstitutions = useMemo(() => {
    return [...institutions].sort((a, b) => String(a.nome).localeCompare(String(b.nome), 'pt-BR'));
  }, [institutions]);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    setError('');

    if (form.senha !== form.confirmSenha) {
      setError('As senhas não conferem.');
      return;
    }

    setIsSubmitting(true);

    try {
      await requestUserSecretaryRegistration({
        nomeUsuario: form.nomeUsuario,
        emailUsuario: form.emailUsuario,
        senha: form.senha,
        chave: generateConfirmationKey(),
        instituicaoId: form.instituicaoId,
      });
      setSuccess(true);
      setForm(emptyForm);
    } catch (err) {
      setError(err.message || 'Erro ao enviar solicitação');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="responsible-editor-page secretary-registration-page">
      <section className="responsible-editor-hero">
        <div>
          <span className="responsible-editor-eyebrow">Cadastro de Secretaria</span>
          <h1>Solicitar acesso ao Portal da Instituição</h1>
          <p>Escolha uma instituição já cadastrada pelo Admin UniEvent. O acesso só será liberado após aprovação.</p>
        </div>

        <div className="responsible-editor-notes" aria-label="Resumo do fluxo">
          <article>
            <Building2 size={20} />
            <span>Instituição existente</span>
          </article>
          <article>
            <UserRoundPlus size={20} />
            <span>Status pendente</span>
          </article>
          <article>
            <CheckCircle2 size={20} />
            <span>Aprovação do Admin</span>
          </article>
        </div>
      </section>

      <section className="responsible-editor-card admin-flow-form-card">
        <div className="responsible-editor-card-header">
          <div>
            <span>Solicitação</span>
            <h2>Dados da Secretaria</h2>
          </div>
          <p>Após o envio, aguarde a análise do Admin UniEvent antes de tentar acessar o portal.</p>
        </div>

        {success ? (
          <div className="people-empty">
            <CheckCircle2 size={42} />
            <p>
              Enviamos um e-mail de confirmação para o endereço institucional informado.
              Após confirmar o e-mail, aguarde a aprovação do Admin UniEvent para acessar o portal.
            </p>
            <Link className="people-create-link" to="/login">Ir para o login</Link>
          </div>
        ) : (
          <form className="responsible-form" onSubmit={submit}>
            {error && <div className="admin-flow-alert">{error}</div>}

            <FormField label="Nome">
              <input value={form.nomeUsuario} onChange={(event) => updateField('nomeUsuario', event.target.value)} placeholder="Maria Silva" required />
            </FormField>

            <FormField label="Email institucional">
              <span className="admin-flow-input-icon">
                <Mail size={18} />
                <input type="email" value={form.emailUsuario} onChange={(event) => updateField('emailUsuario', event.target.value)} placeholder="maria@fatec.sp.gov.br" required />
              </span>
            </FormField>

            <FormField label="Senha">
              <span className="admin-flow-input-icon">
                <KeyRound size={18} />
                <input type="password" value={form.senha} onChange={(event) => updateField('senha', event.target.value)} placeholder="Senha de acesso" required minLength={6} />
              </span>
            </FormField>

            <FormField label="Confirmar senha">
              <span className="admin-flow-input-icon">
                <KeyRound size={18} />
                <input type="password" value={form.confirmSenha} onChange={(event) => updateField('confirmSenha', event.target.value)} placeholder="Repita a senha" required minLength={6} />
              </span>
            </FormField>

            <FormField label="Instituição">
              <select value={form.instituicaoId} onChange={(event) => updateField('instituicaoId', event.target.value)} required disabled={isLoading}>
                <option value="">{isLoading ? 'Carregando instituições...' : 'Selecione uma instituição'}</option>
                {sortedInstitutions.map((institution) => (
                  <option key={institution.id} value={institution.id}>
                    {institution.nome || institution.nomeAbreviado || `Instituição #${institution.id}`}
                  </option>
                ))}
              </select>
            </FormField>

            <div className="responsible-form-actions">
              <Button type="submit" icon={Send} disabled={isSubmitting || isLoading}>
                {isSubmitting ? 'Enviando...' : 'Enviar solicitação'}
              </Button>
            </div>
          </form>
        )}
      </section>
    </main>
  );
}
