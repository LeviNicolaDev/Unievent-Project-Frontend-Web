import { Award, CalendarDays, CheckCircle2, MapPin, Percent, Ticket, UserRoundCheck, UsersRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AdminHeader } from "../components/navigation/AdminHeader.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import { getEventoDashboard } from "../services/dashboardService.js";
import { formatDate } from "../utils/formatters.js";

const AUDIENCE_LABELS = {
  PublicoGeral: "Público geral",
  publicoGeral: "Público geral",
  TodosAlunosFatec: "Todos os alunos FATEC",
  todosAlunosFatec: "Todos os alunos FATEC",
  AlunosDaInstituicao: "Somente alunos desta instituição",
  alunosDaInstituicao: "Somente alunos desta instituição",
};

function formatNumber(value) {
  return Number(value ?? 0).toLocaleString("pt-BR");
}

function formatPercent(value) {
  return `${Number(value ?? 0).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`;
}

export function EventoDashboardPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const routePrefix = user?.roleUsuario === "Secretaria" ? "/instituicao/eventos" : "/eventos";
  const checkInPath = user?.roleUsuario === "Secretaria" ? "/instituicao/check-in" : "/check-in";

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError("");

    getEventoDashboard(id)
      .then((data) => {
        if (active) setDashboard(data);
      })
      .catch((err) => {
        if (active) setError(err.message || "Erro ao carregar dashboard do evento");
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  const metrics = useMemo(() => [
    { label: "Vagas totais", value: formatNumber(dashboard?.capacidadeTotal), icon: UsersRound },
    { label: "Inscrições", value: formatNumber(dashboard?.totalInscricoes), icon: Ticket },
    { label: "Vagas restantes", value: formatNumber(dashboard?.vagasRestantes), icon: UsersRound },
    { label: "Check-ins", value: formatNumber(dashboard?.checkInsRealizados), icon: CheckCircle2 },
    { label: "Sem check-in", value: formatNumber(dashboard?.ausentesSemCheckIn), icon: UserRoundCheck },
    { label: "Ocupação", value: formatPercent(dashboard?.percentualOcupacao), icon: Percent },
    { label: "Presença", value: formatPercent(dashboard?.percentualPresenca), icon: Percent },
    { label: "Certificados emitidos", value: formatNumber(dashboard?.certificadosEmitidos), icon: Award },
  ], [dashboard]);

  return (
    <>
      <AdminHeader greeting="Dashboard do evento" backTo={routePrefix} />
      <main className="dashboard-home dashboard-home--analytics">
        <section className="dashboard-hero">
          <div>
            <span className="dashboard-eyebrow">{dashboard?.instituicaoNome || "Secretaria"}</span>
            <h1>{dashboard?.nome || "Evento"}</h1>
            <p>
              {isLoading
                ? "Carregando indicadores do evento..."
                : `${dashboard?.statusEvento || "Status indisponível"} · ${AUDIENCE_LABELS[dashboard?.publicoPermitido] || "Público geral"}`}
            </p>
          </div>
          <div className="dashboard-summary">
            <article>
              <CalendarDays size={20} />
              <strong>{dashboard ? formatDate(dashboard.dataEvento, "pt") : "-"}</strong>
              <span>{dashboard?.local || "Local não informado"}</span>
            </article>
            <article>
              <MapPin size={20} />
              <strong>{dashboard?.instituicaoNome || "-"}</strong>
              <span>Instituição responsável</span>
            </article>
            <article>
              <UserRoundCheck size={20} />
              <strong>{dashboard?.responsavelEventoNome || "-"}</strong>
              <span>Responsável pelo evento</span>
            </article>
          </div>
        </section>

        {error ? <p className="dashboard-error" role="alert">{error}</p> : null}

        <section className="dashboard-metrics-grid" aria-label="Indicadores do evento">
          {metrics.map(({ label, value, icon: Icon }) => (
            <article className="dashboard-metric" key={label}>
              <Icon size={20} />
              <span>{label}</span>
              <strong>{value}</strong>
            </article>
          ))}
        </section>

        <section className="events-table-panel">
          <div className="dashboard-section-title">
            <h2>Participantes</h2>
            <p>Distribuição das inscrições no mesmo controle de vagas.</p>
          </div>
          <div className="dashboard-actions-row">
            <span>Alunos FATEC: {formatNumber(dashboard?.inscricoesAlunosFatec)}</span>
            <span>Público geral: {formatNumber(dashboard?.inscricoesPublicoGeral)}</span>
            <span>Certificado: {dashboard?.possuiCertificado ? "Sim" : "Não"}</span>
          </div>
        </section>

        <section className="dashboard-actions-row">
          <Link to={`${routePrefix}/${id}/editar`}>Editar evento</Link>
          <Link to={checkInPath}>Validar check-in</Link>
        </section>
      </main>
    </>
  );
}
