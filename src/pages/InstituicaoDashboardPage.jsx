import { Award, CalendarDays, CheckCircle2, ScanLine, UserRoundCheck, UsersRound } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AdminHeader } from "../components/navigation/AdminHeader.jsx";
import { getInstituicaoDashboard } from "../services/dashboardService.js";
import { formatDate } from "../utils/formatters.js";

const metricCards = [
  { key: "totalEventos", label: "Eventos cadastrados", icon: CalendarDays },
  { key: "eventosFuturos", label: "Próximos eventos", icon: CalendarDays },
  { key: "eventosRealizados", label: "Eventos realizados", icon: CheckCircle2 },
  { key: "totalResponsaveis", label: "Responsáveis cadastrados", icon: UserRoundCheck },
  { key: "totalInscricoes", label: "Inscrições", icon: UsersRound },
  { key: "totalPresencas", label: "Check-ins realizados", icon: ScanLine },
  { key: "totalCertificadosEmitidos", label: "Certificados emitidos", icon: Award },
];

function formatNumber(value) {
  return Number(value ?? 0).toLocaleString("pt-BR");
}

function EventList({ title, items }) {
  return (
    <section className="dashboard-event-list">
      <h2>{title}</h2>
      {(items || []).length === 0 ? (
        <p>Nenhum evento para exibir.</p>
      ) : (
        <ul>
          {items.map((item) => (
            <li key={`${title}-${item.id}`}>
              <div>
                <strong>{item.nome}</strong>
                <span>{formatDate(item.dataEvento, "pt")}</span>
              </div>
              <span>{formatNumber(item.inscricoes)} inscrições</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function InstituicaoDashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getInstituicaoDashboard()
      .then((data) => {
        if (active) setDashboard(data);
      })
      .catch((err) => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      <AdminHeader greeting="Dashboard institucional" backTo={null} />
      <main className="dashboard-home dashboard-home--analytics">
        <section className="dashboard-hero">
          <div>
            <span className="dashboard-eyebrow">Secretaria</span>
            <h1>Dashboard — {dashboard?.instituicaoNome || "sua instituição"}</h1>
            <p>
              Indicadores restritos aos eventos, responsáveis, inscrições,
              check-ins e certificados da instituição vinculada ao seu usuário.
            </p>
          </div>
          <div className="dashboard-summary">
            <article>
              <CalendarDays size={20} />
              <strong>{formatNumber(dashboard?.totalEventos)} eventos</strong>
              <span>{formatNumber(dashboard?.eventosFuturos)} próximos</span>
            </article>
            <article>
              <ScanLine size={20} />
              <strong>{formatNumber(dashboard?.totalPresencas)} check-ins</strong>
              <span>{dashboard?.taxaComparecimento ?? 0}% de comparecimento</span>
            </article>
            <article>
              <Award size={20} />
              <strong>{formatNumber(dashboard?.totalCertificadosEmitidos)} certificados</strong>
              <span>{formatNumber(dashboard?.totalInscricoes)} inscrições</span>
            </article>
          </div>
        </section>

        {error ? <p className="dashboard-error" role="alert">{error}</p> : null}
        {isLoading ? <p className="dashboard-loading">Carregando indicadores...</p> : null}

        <section className="dashboard-metrics-grid" aria-label="Indicadores institucionais">
          {metricCards.map(({ key, label, icon: Icon }) => (
            <article className="dashboard-metric" key={key}>
              <Icon size={20} />
              <span>{label}</span>
              <strong>{formatNumber(dashboard?.[key])}</strong>
            </article>
          ))}
          <article className="dashboard-metric">
            <CheckCircle2 size={20} />
            <span>Taxa de comparecimento</span>
            <strong>{dashboard?.taxaComparecimento ?? 0}%</strong>
          </article>
        </section>

        <section className="dashboard-events-columns">
          <EventList title="Próximos eventos" items={dashboard?.proximosEventos} />
          <EventList title="Eventos recentes" items={dashboard?.eventosRecentes} />
        </section>

        <div className="dashboard-section-title">
          <h2>Métricas por evento</h2>
          <p>Inscritos, presentes, ausentes e certificados emitidos.</p>
        </div>

        <section className="events-table-panel">
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Evento</th>
                  <th>Data</th>
                  <th>Inscritos</th>
                  <th>Presentes</th>
                  <th>Ausentes</th>
                  <th>Certificados</th>
                  <th>Comparecimento</th>
                </tr>
              </thead>
              <tbody>
                {(dashboard?.metricasPorEvento || []).map((item) => (
                  <tr key={item.id}>
                    <td>{item.nome}</td>
                    <td>{formatDate(item.dataEvento, "pt")}</td>
                    <td>{formatNumber(item.inscricoes)}</td>
                    <td>{formatNumber(item.presentes)}</td>
                    <td>{formatNumber(item.ausentes)}</td>
                    <td>{formatNumber(item.certificadosEmitidos)}</td>
                    <td>{item.taxaComparecimento}%</td>
                  </tr>
                ))}
                {!isLoading && (dashboard?.metricasPorEvento || []).length === 0 ? (
                  <tr>
                    <td colSpan="7">Nenhum evento cadastrado para esta instituição.</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>

        <div className="dashboard-section-title">
          <h2>Ações da secretaria</h2>
          <p>Operações restritas à sua instituição.</p>
        </div>
        <section className="dashboard-actions-row">
          <Link to="/instituicao/eventos/novo">Cadastrar evento</Link>
          <Link to="/instituicao/eventos">Gerenciar eventos</Link>
          <Link to="/instituicao/responsaveis">Responsáveis</Link>
          <Link to="/instituicao/check-in">Validar check-in</Link>
        </section>
      </main>
    </>
  );
}
