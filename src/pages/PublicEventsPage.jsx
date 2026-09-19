import { CalendarDays, Filter, MapPin, Search, SlidersHorizontal, Ticket, UsersRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import logo from "../assets/images/logo.svg";
import { useAuth } from "../contexts/AuthContext.jsx";
import { isPublicParticipant } from "../services/authService.js";
import { getEventCategories, searchEvents } from "../services/eventService.js";
import { listPublicInstitutions } from "../services/institutionService.js";
import { formatDate, getAssetUrl } from "../utils/formatters.js";

const AUDIENCE_FILTER_OPTIONS = [
  { value: "", label: "Todos" },
  { value: "PublicoGeral", label: "Público geral" },
  { value: "Restrito", label: "Restrito" },
];

const DATE_OPTIONS = [
  { value: "", label: "Todas as datas" },
  { value: "today", label: "Hoje" },
  { value: "week", label: "Esta semana" },
  { value: "future", label: "Próximos eventos" },
];

const AUDIENCE_LABELS = {
  PublicoGeral: "Público geral",
  publicoGeral: "Público geral",
  TodosAlunosFatec: "Todos os alunos FATEC",
  todosAlunosFatec: "Todos os alunos FATEC",
  AlunosDaInstituicao: "Somente alunos desta instituição",
  alunosDaInstituicao: "Somente alunos desta instituição",
};

function getAudienceLabel(event) {
  return AUDIENCE_LABELS[event.audience || event.publicoPermitido] || "Público geral";
}

function getDateRange(value) {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);

  if (value === "today") {
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    return { inicio: start.toISOString(), fim: end.toISOString() };
  }

  if (value === "week") {
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    return { inicio: start.toISOString(), fim: end.toISOString() };
  }

  if (value === "future") {
    return { inicio: start.toISOString() };
  }

  return {};
}

function getInstitutionSearchParams(value) {
  if (!value) return {};
  if (value.startsWith("id:")) return { InstituicaoId: value.slice(3) };
  return { InstituicaoId: value };
}

export function PublicEventsPage() {
  const { user, logout } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [events, setEvents] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [meta, setMeta] = useState({ page: 1, pageSize: 12, totalItems: 0, totalPages: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const publicUser = isPublicParticipant(user);

  const filters = useMemo(() => ({
    instituicao: searchParams.get("instituicao") || searchParams.get("instituicaoId") || "",
    categoria: searchParams.get("categoria") || "",
    publico: searchParams.get("publico") || "",
    data: searchParams.get("data") || "",
    cidade: searchParams.get("cidade") || "",
    search: searchParams.get("search") || "",
    page: Number(searchParams.get("page") || 1),
  }), [searchParams]);

  useEffect(() => {
    async function loadOptions() {
      const [loadedInstitutions, loadedCategories] = await Promise.all([
        listPublicInstitutions(),
        getEventCategories(),
      ]);
      setInstitutions((Array.isArray(loadedInstitutions) ? loadedInstitutions : []).filter((institution) => institution.id));
      setCategories(loadedCategories);
    }

    loadOptions().catch((err) => {
      console.error(err);
    });
  }, []);

  useEffect(() => {
    async function loadEvents() {
      setIsLoading(true);
      setError(null);
      try {
        const range = getDateRange(filters.data);
        const result = await searchEvents({
          ...getInstitutionSearchParams(filters.instituicao),
          Categoria: filters.categoria,
          Publico: filters.publico,
          Cidade: filters.cidade,
          Search: filters.search,
          Page: filters.page,
          PageSize: 12,
          ...range,
        });
        setEvents(result.items || []);
        setMeta({
          page: result.page || 1,
          pageSize: result.pageSize || 12,
          totalItems: result.totalItems || 0,
          totalPages: result.totalPages || 0,
        });
      } catch (err) {
        setError(err.message || "Erro ao carregar eventos");
      } finally {
        setIsLoading(false);
      }
    }

    loadEvents();
  }, [filters]);

  function updateFilter(key, value) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    next.set("page", "1");
    setSearchParams(next);
  }

  function setPage(page) {
    const next = new URLSearchParams(searchParams);
    next.set("page", String(page));
    setSearchParams(next);
  }

  return (
    <main className="public-events-page">
      <header className="public-events-header">
        <Link className="public-events-brand" to="/">
          <img src={logo} alt="UniEvent" />
        </Link>
        <div className="public-events-account">
          {publicUser ? (
            <>
              <Link className="public-account-link" to="/meus-ingressos">Meus Ingressos</Link>
              <span>{user.email}</span>
              <button className="public-events-login" type="button" onClick={logout}>Sair</button>
            </>
          ) : (
            <>
              <Link className="public-events-login" to="/entrar">Entrar</Link>
              <Link className="public-events-login" to="/criar-conta">Criar conta</Link>
            </>
          )}
        </div>
      </header>

      <section className="public-events-hero">
        <div>
          <span>Eventos UniEvent</span>
          <h1>Encontre eventos por unidade FATEC.</h1>
          <p>Filtre por instituição, categoria, acesso, cidade e data.</p>
        </div>
      </section>

      <section className="public-events-filters" aria-label="Filtros de eventos">
        <label>
          <Search size={18} />
          <input
            value={filters.search}
            onChange={(event) => updateFilter("search", event.target.value)}
            placeholder="Pesquisar evento"
          />
        </label>

        <label>
          <Filter size={18} />
          <select
            value={filters.instituicao}
            onChange={(event) => updateFilter("instituicao", event.target.value)}
          >
            <option value="">Todas as instituições</option>
            {institutions.map((institution) => (
              <option key={institution.id} value={institution.id}>
                {institution.nome || institution.nomeAbreviado || `Instituição #${institution.id}`}
              </option>
            ))}
          </select>
        </label>

        <label>
          <SlidersHorizontal size={18} />
          <select
            value={filters.categoria}
            onChange={(event) => updateFilter("categoria", event.target.value)}
          >
            <option value="">Todas as categorias</option>
            {categories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </label>

        <select
          value={filters.publico}
          onChange={(event) => updateFilter("publico", event.target.value)}
        >
          {AUDIENCE_FILTER_OPTIONS.map((option) => (
            <option key={option.label} value={option.value}>{option.label}</option>
          ))}
        </select>

        <select value={filters.data} onChange={(event) => updateFilter("data", event.target.value)}>
          {DATE_OPTIONS.map((option) => (
            <option key={option.label} value={option.value}>{option.label}</option>
          ))}
        </select>

        <label>
          <MapPin size={18} />
          <input
            value={filters.cidade}
            onChange={(event) => updateFilter("cidade", event.target.value)}
            placeholder="Cidade"
          />
        </label>
      </section>

      {error && <div className="public-events-error">{error}</div>}

      <section className="public-events-grid" aria-busy={isLoading}>
        {isLoading && <p className="public-events-empty">Carregando eventos...</p>}
        {!isLoading && events.length === 0 && (
          <p className="public-events-empty">Nenhum evento encontrado para os filtros selecionados.</p>
        )}

        {!isLoading && events.map((event) => (
          <article className="public-event-card" key={event.id}>
            <img
              src={event.image || getAssetUrl("evento.png")}
              alt=""
              onError={(img) => {
                img.currentTarget.src = getAssetUrl("evento.png");
              }}
            />
            <div>
              <span>{event.instituicaoNome || "Instituição não informada"}</span>
              <h2>{event.nome}</h2>
              <p>{event.descricao}</p>
              <dl>
                <div>
                  <CalendarDays size={16} />
                  <dd>{formatDate(event.dataEvento, "pt")}</dd>
                </div>
                <div>
                  <Ticket size={16} />
                  <dd>{getAudienceLabel(event)}</dd>
                </div>
                <div>
                  <UsersRound size={16} />
                  <dd>
                    {event.vagasDisponiveis === 0
                      ? "Lotado"
                      : `${event.vagasDisponiveis ?? event.capacidade} vagas disponíveis`}
                  </dd>
                </div>
                {event.local && (
                  <div>
                    <MapPin size={16} />
                    <dd>{event.local}</dd>
                  </div>
                )}
                {(event.cidade || event.estado) && (
                  <div>
                    <MapPin size={16} />
                    <dd>{[event.cidade, event.estado].filter(Boolean).join(" - ")}</dd>
                  </div>
                )}
              </dl>
              <Link to={`/descobrir-eventos/${event.id}`}>Ver detalhes</Link>
            </div>
          </article>
        ))}
      </section>

      {meta.totalPages > 1 && (
        <nav className="public-events-pagination" aria-label="Paginação">
          <button type="button" disabled={meta.page <= 1} onClick={() => setPage(meta.page - 1)}>
            Anterior
          </button>
          <span>{meta.page} / {meta.totalPages}</span>
          <button type="button" disabled={meta.page >= meta.totalPages} onClick={() => setPage(meta.page + 1)}>
            Próxima
          </button>
        </nav>
      )}
    </main>
  );
}
