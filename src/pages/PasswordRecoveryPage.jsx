import { KeyRound, Mail } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { requestPasswordRecovery, resetPassword } from '../services/passwordRecoveryService.js';

export function PasswordRecoveryPage({ reset = false }) {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const perfil = ['publico', 'administrativo', 'mobile'].includes(params.get('perfil')) ? params.get('perfil') : 'publico';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [result, setResult] = useState(null);
  const loginPath = result ? (result.tipoUsuario === 'Publico' ? '/entrar' : '/login') : perfil === 'administrativo' ? '/login' : '/entrar';
  const invalidToken = reset && !/^[a-fA-F0-9]{64}$/.test(token);
  useEffect(() => {
    setError('');
    setSuccess('');
    setResult(null);
    setPassword('');
    setConfirmation('');
  }, [token, reset]);

  async function submit(event) {
    event.preventDefault();
    if (busy) return;
    setError('');
    if (reset && (password !== confirmation || password.length < 8 || new TextEncoder().encode(password).length > 72)) {
      setError('Informe senhas iguais, com no mínimo 8 caracteres e no máximo 72 bytes.');
      return;
    }
    setBusy(true);
    try {
      if (reset) {
        const response = await resetPassword(token, password, confirmation);
        setResult(response);
        setSuccess(response.mensagem);
        setPassword('');
        setConfirmation('');
        window.history.replaceState(window.history.state, '', window.location.pathname);
      } else {
        const response = await requestPasswordRecovery(email.trim(), perfil);
        setSuccess(response.mensagem);
      }
    } catch (err) {
      setError(err.status === 429 ? 'Muitas tentativas. Aguarde um minuto e tente novamente.' : err.message || 'Não foi possível concluir. Tente novamente.');
    } finally { setBusy(false); }
  }

  return (
    <main className="auth-page">
      <section className="auth-shell">
        <aside className="auth-intro">
          <span className="auth-eyebrow">UniEvent</span>
          <h1>{reset ? 'Definir nova senha' : 'Recuperar senha'}</h1>
          <p>{reset ? 'Escolha uma nova senha para sua conta.' : 'Informe o e-mail da sua conta. Se houver um cadastro, enviaremos um link válido por 30 minutos.'}</p>
        </aside>
        <section className="auth-card">
          {success && <div className="auth-success-message" role="status">{success}</div>}
          {error && <div className="auth-error-message" role="alert">{error}</div>}
          {invalidToken && !result && <p role="alert">Link de recuperação inválido ou ausente. Solicite um novo link.</p>}
          {!success && !invalidToken && <form className="auth-form" onSubmit={submit}>
            {!reset ? <label className="auth-field"><span>E-mail</span><div><Mail size={18} />
              <input type="email" autoComplete="email" required maxLength={254} value={email} onChange={event => setEmail(event.target.value)} />
            </div></label> : <>
              <label className="auth-field"><span>Nova senha</span><div><KeyRound size={18} />
                <input type="password" autoComplete="new-password" required minLength={8} maxLength={72} value={password} onChange={event => setPassword(event.target.value)} />
              </div></label>
              <label className="auth-field"><span>Confirmar nova senha</span><div><KeyRound size={18} />
                <input type="password" autoComplete="new-password" required minLength={8} maxLength={72} value={confirmation} onChange={event => setConfirmation(event.target.value)} />
              </div></label>
            </>}
            <button className="auth-submit" type="submit" disabled={busy}>{busy ? 'Aguarde...' : reset ? 'Salvar nova senha' : 'Enviar link de recuperação'}</button>
          </form>}
          {reset && !result && <Link to={`/recuperar-senha?perfil=${perfil}`}>Solicitar novo link</Link>}
          {result?.tipoUsuario === 'Aluno' ? <>
            <p>Abra o aplicativo e entre com sua nova senha.</p>
            {String(result.destino || '').startsWith('unievent://') && <a className="auth-submit" href={result.destino}>Abrir aplicativo UniEvent</a>}
          </> : <Link className="auth-back-link" to={loginPath}>Voltar para o login</Link>}
        </section>
      </section>
    </main>
  );
}
