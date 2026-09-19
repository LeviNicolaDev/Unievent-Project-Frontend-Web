import { Ban, CheckCircle2, IdCard, Pencil, Plus, Search, ShieldCheck, Trash2, UsersRound, XCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminHeader } from '../components/navigation/AdminHeader.jsx';
import { Modal } from '../components/ui/Modal.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { listInstitutions } from '../services/institutionService.js';
import { changeUserSecretaryStatus, deleteUserSecretary, listUsersSecretary } from '../services/userSecretaryService.js';
import { getAssetUrl } from '../utils/formatters.js';

function getUserName(user) {
  return user.nomeUsuario || user.nome || `Usuário #${user.id}`;
}

function getInstitutionName(institutions, instituicaoId) {
  const institution = institutions.find((item) => String(item.id) === String(instituicaoId));
  return institution?.nome || institution?.nomeAbreviado || (instituicaoId ? `Instituição #${instituicaoId}` : 'Admin UniEvent');
}

function normalizeStatus(status) {
  return status || 'Ativo';
}

export function UsersSecretaryPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [search, setSearch] = useState('');
  const [userToDelete, setUserToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const isGlobalAdmin = user?.roleUsuario === 'Admin' && !user?.instituicaoId;

  useEffect(() => {
    if (!isGlobalAdmin) {
      setIsLoading(false);
      return;
    }

    loadData();
  }, [isGlobalAdmin]);

  async function loadData() {
    setIsLoading(true);
    setError('');

    try {
      const [loadedUsers, loadedInstitutions] = await Promise.all([
        listUsersSecretary(),
        listInstitutions().catch(() => []),
      ]);
      setUsers(Array.isArray(loadedUsers) ? loadedUsers : []);
      setInstitutions(Array.isArray(loadedInstitutions) ? loadedInstitutions : []);
    } catch (err) {
      setError(err.message || 'Erro ao carregar usuários da secretaria');
    } finally {
      setIsLoading(false);
    }
  }

  const filteredUsers = useMemo(() => {
    const value = search.trim().toLowerCase();
    if (!value) return users;

    return users.filter((item) => {
      const text = [
        item.nomeUsuario,
        item.emailUsuario,
        item.roleUsuario,
        getInstitutionName(institutions, item.instituicaoId),
      ].filter(Boolean).join(' ').toLowerCase();

      return text.includes(value);
    });
  }, [institutions, search, users]);

  async function confirmDelete() {
    try {
      await deleteUserSecretary(userToDelete.id);
      setUsers((current) => current.filter((item) => item.id !== userToDelete.id));
      setUserToDelete(null);
    } catch (err) {
      setError(err.message || 'Erro ao excluir usuário secretaria');
    }
  }

  async function changeStatus(item, action) {
    try {
      const updated = await changeUserSecretaryStatus(item.id, action);
      setUsers((current) => current.map((userItem) => (userItem.id === item.id ? updated : userItem)));
    } catch (err) {
      setError(err.message || 'Erro ao alterar status do usuário secretaria');
    }
  }

  if (!isGlobalAdmin) {
    return (
      <>
        <AdminHeader title="Cadastro Usuário Secretaria" />
        <main className="people-page">
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
        <AdminHeader title="Cadastro Usuário Secretaria" />
        <main className="people-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
          <p>Carregando...</p>
        </main>
      </>
    );
  }

  return (
    <>
      <AdminHeader title="Cadastro Usuário Secretaria" />
      <main className="people-page">
        {error && <div className="admin-flow-alert">{error}</div>}

        <section className="people-toolbar">
          <div>
            <span className="people-eyebrow">Cadastro Usuário Secretaria</span>
            <h1>Usuários Secretaria</h1>
            <p>Cadastre o acesso administrativo da Secretaria depois que a instituição FATEC já existir.</p>
          </div>

          <Link className="people-create-link" to="/secretarias/novo">
            <Plus size={18} />
            <span>Novo usuário Secretaria</span>
          </Link>
        </section>

        <section className="people-summary" aria-label="Resumo de usuários secretaria">
          <article>
            <UsersRound size={20} />
            <strong>{users.length}</strong>
            <span>Usuários</span>
          </article>
          <article>
            <ShieldCheck size={20} />
            <strong>{users.filter((item) => normalizeStatus(item.status) === 'Pendente').length}</strong>
            <span>Pendentes</span>
          </article>
        </section>

        <section className="people-panel">
          <div className="people-panel-header">
            <div>
              <h2>Usuários cadastrados</h2>
              <p>{filteredUsers.length} registro(s) encontrado(s)</p>
            </div>

            <label className="people-search">
              <Search size={18} />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar usuário" />
            </label>
          </div>

          {filteredUsers.length ? (
            <div className="admin-flow-list">
              {filteredUsers.map((item) => (
                <article className="admin-flow-row" key={item.id}>
                  <div className="admin-flow-row-main">
                    <IdCard size={22} />
                    <div>
                      <span>{item.roleUsuario || 'Secretaria'}</span>
                      <h3>{getUserName(item)}</h3>
                      <p>{item.emailUsuario || 'Email não informado'} • {getInstitutionName(institutions, item.instituicaoId)}</p>
                      <strong className={`admin-flow-status admin-flow-status-${normalizeStatus(item.status).toLowerCase()}`}>
                        {normalizeStatus(item.status)}
                      </strong>
                    </div>
                  </div>

                  <div className="admin-flow-row-actions">
                    {normalizeStatus(item.status) !== 'Ativo' && (
                      <button type="button" onClick={() => changeStatus(item, 'aprovar')} title="Aprovar Secretaria">
                        <CheckCircle2 size={17} />
                      </button>
                    )}
                    {normalizeStatus(item.status) === 'Pendente' && (
                      <button type="button" onClick={() => changeStatus(item, 'recusar')} title="Recusar solicitação">
                        <XCircle size={17} />
                      </button>
                    )}
                    {normalizeStatus(item.status) === 'Ativo' && (
                      <button type="button" onClick={() => changeStatus(item, 'bloquear')} title="Bloquear Secretaria">
                        <Ban size={17} />
                      </button>
                    )}
                    <Link to={`/secretarias/${item.id}/editar`} title="Editar usuário Secretaria">
                      <Pencil size={17} />
                    </Link>
                    <button type="button" onClick={() => setUserToDelete(item)} title="Excluir usuário Secretaria">
                      <Trash2 size={17} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="people-empty">
              <IdCard size={36} />
              <p>Nenhum usuário Secretaria encontrado.</p>
            </div>
          )}
        </section>
      </main>

      <Modal
        open={Boolean(userToDelete)}
        title="Excluir usuário Secretaria"
        message="Tem certeza que deseja remover este usuário?"
        image={getAssetUrl('warning.jpg')}
        onClose={() => setUserToDelete(null)}
        onConfirm={confirmDelete}
      />
    </>
  );
}
