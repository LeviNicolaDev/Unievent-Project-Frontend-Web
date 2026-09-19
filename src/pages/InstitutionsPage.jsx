import { Building2, CheckCircle2, Pencil, Plus, Search, Trash2, XCircle } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminHeader } from '../components/navigation/AdminHeader.jsx';
import { Modal } from '../components/ui/Modal.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';
import { deleteInstitution, listInstitutions, setInstitutionActive } from '../services/institutionService.js';
import { getAssetUrl } from '../utils/formatters.js';

function getInstitutionName(institution) {
  return institution.nome || institution.nomeAbreviado || `Instituição #${institution.id}`;
}

export function InstitutionsPage() {
  const { user } = useAuth();
  const [institutions, setInstitutions] = useState([]);
  const [search, setSearch] = useState('');
  const [institutionToDelete, setInstitutionToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const isGlobalAdmin = user?.roleUsuario === 'Admin' && !user?.instituicaoId;

  useEffect(() => {
    if (!isGlobalAdmin) {
      setIsLoading(false);
      return;
    }

    loadInstitutions();
  }, [isGlobalAdmin]);

  async function loadInstitutions() {
    setIsLoading(true);
    setError('');

    try {
      const data = await listInstitutions();
      setInstitutions(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Erro ao carregar instituições');
    } finally {
      setIsLoading(false);
    }
  }

  const filteredInstitutions = useMemo(() => {
    const value = search.trim().toLowerCase();
    if (!value) return institutions;

    return institutions.filter((institution) => {
      const text = [
        institution.nome,
        institution.nomeAbreviado,
        institution.codigo,
        institution.cidade,
      ].filter(Boolean).join(' ').toLowerCase();

      return text.includes(value);
    });
  }, [institutions, search]);

  async function confirmDelete() {
    try {
      await deleteInstitution(institutionToDelete.id);
      setInstitutions((current) => current.filter((institution) => institution.id !== institutionToDelete.id));
      setInstitutionToDelete(null);
    } catch (err) {
      setError(err.message || 'Erro ao excluir instituição');
    }
  }

  async function toggleStatus(institution) {
    try {
      const updated = await setInstitutionActive(institution.id, !institution.isAtivo);
      setInstitutions((current) => current.map((item) => (item.id === institution.id ? updated : item)));
    } catch (err) {
      setError(err.message || 'Erro ao alterar status da instituição');
    }
  }

  if (!isGlobalAdmin) {
    return (
      <>
        <AdminHeader title="Cadastro Instituição" />
        <main className="people-page">
          <section className="people-panel">
            <div className="people-empty">
              <Building2 size={36} />
              <p>Apenas o Admin UniEvent pode cadastrar e administrar instituições.</p>
            </div>
          </section>
        </main>
      </>
    );
  }

  if (isLoading) {
    return (
      <>
        <AdminHeader title="Cadastro Instituição" />
        <main className="people-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
          <p>Carregando...</p>
        </main>
      </>
    );
  }

  return (
    <>
      <AdminHeader title="Cadastro Instituição" />
      <main className="people-page">
        {error && <div className="admin-flow-alert">{error}</div>}

        <section className="people-toolbar">
          <div>
            <span className="people-eyebrow">Cadastro Instituição</span>
            <h1>Instituições FATEC</h1>
            <p>Cadastre cada FATEC antes de criar o usuário Secretaria responsável por administrá-la.</p>
          </div>

          <Link className="people-create-link" to="/instituicoes/nova">
            <Plus size={18} />
            <span>Nova instituição</span>
          </Link>
        </section>

        <section className="people-summary" aria-label="Resumo de instituições">
          <article>
            <Building2 size={20} />
            <strong>{institutions.length}</strong>
            <span>Instituições</span>
          </article>
          <article>
            <CheckCircle2 size={20} />
            <strong>{institutions.filter((institution) => institution.isAtivo).length}</strong>
            <span>Ativas</span>
          </article>
        </section>

        <section className="people-panel">
          <div className="people-panel-header">
            <div>
              <h2>Instituições cadastradas</h2>
              <p>{filteredInstitutions.length} registro(s) encontrado(s)</p>
            </div>

            <label className="people-search">
              <Search size={18} />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar instituição" />
            </label>
          </div>

          {filteredInstitutions.length ? (
            <div className="admin-flow-list">
              {filteredInstitutions.map((institution) => (
                <article className="admin-flow-row" key={institution.id}>
                  <div className="admin-flow-row-main">
                    <Building2 size={22} />
                    <div>
                      <span>{institution.codigo || 'FATEC'}</span>
                      <h3>{getInstitutionName(institution)}</h3>
                      <p>{institution.cidade || 'Cidade não informada'} {institution.estado ? `• ${institution.estado}` : ''}</p>
                    </div>
                  </div>

                  <div className="admin-flow-row-actions">
                    <button type="button" onClick={() => toggleStatus(institution)} title={institution.isAtivo ? 'Desativar instituição' : 'Ativar instituição'}>
                      {institution.isAtivo ? <CheckCircle2 size={17} /> : <XCircle size={17} />}
                    </button>
                    <Link to={`/instituicoes/${institution.id}/editar`} title="Editar instituição">
                      <Pencil size={17} />
                    </Link>
                    <button type="button" onClick={() => setInstitutionToDelete(institution)} title="Excluir instituição">
                      <Trash2 size={17} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="people-empty">
              <Building2 size={36} />
              <p>Nenhuma instituição encontrada.</p>
            </div>
          )}
        </section>
      </main>

      <Modal
        open={Boolean(institutionToDelete)}
        title="Excluir instituição"
        message="Tem certeza que deseja remover esta instituição?"
        image={getAssetUrl('warning.jpg')}
        onClose={() => setInstitutionToDelete(null)}
        onConfirm={confirmDelete}
      />
    </>
  );
}
