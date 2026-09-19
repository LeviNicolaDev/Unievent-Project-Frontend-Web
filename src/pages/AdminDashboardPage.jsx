import {
  Award,
  Building2,
  CalendarDays,
  CheckCircle2,
  IdCard,
  ScanLine,
  UsersRound,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AdminHeader } from "../components/navigation/AdminHeader.jsx";
import { getAdminDashboard } from "../services/dashboardService.js";

const metricCards = [
  { key: "totalInstituicoes", label: "Instituições", icon: Building2 },
  { key: "instituicoesAtivas", label: "Instituições ativas", icon: CheckCircle2 },
  { key: "totalSecretarias", label: "Secretarias", icon: IdCard },
  { key: "secretariasPendentes", label: "Secretarias pendentes", icon: IdCard },
  { key: "totalAlunos", label: "Alunos", icon: UsersRound },
  { key: "totalEventos", label: "Eventos", icon: CalendarDays },
  { key: "totalInscricoes", label: "Inscrições", icon: UsersRound },
  { key: "totalPresencas", label: "Check-ins", icon: ScanLine },
  { key: "totalCertificadosEmitidos", label: "Certificados emitidos", icon: Award },
];

function formatNumber(value) {
  return Number(value ?? 0).toLocaleString("pt-BR");
}

export function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getAdminDashboard()
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
      <AdminHeader greeting="Dashboard UniEvent" backTo={null} />
      <main className="dashboard-home dashboard-home--analytics">
        <section className="dashboard-hero">
          <div>
            <span className="dashboard-eyebrow">Admin UniEvent</span>
            <h1>Visão global da plataforma</h1>
            <p>
              Indicadores consolidados de instituições, usuários, eventos,
              inscrições, presenças e certificados emitidos no UniEvent.
            </p>
          </div>
          <div className="dashboard-summary">
            <article>
              <Building2 size={20} />
              <strong>{formatNumber(dashboard?.totalInstituicoes)} instituições</strong>
              <span>{formatNumber(dashboard?.instituicoesAtivas)} ativas</span>
            </article>
            <article>
              <CalendarDays size={20} />
              <strong>{formatNumber(dashboard?.totalEventos)} eventos</strong>
              <span>{formatNumber(dashboard?.totalInscricoes)} inscrições</span>
            </article>
            <article>
              <Award size={20} />
              <strong>{formatNumber(dashboard?.totalCertificadosEmitidos)} certificados</strong>
              <span>{dashboard?.taxaComparecimento ?? 0}% de comparecimento</span>
            </article>
          </div>
        </section>

        {error ? <p className="dashboard-error" role="alert">{error}</p> : null}
        {isLoading ? <p className="dashboard-loading">Carregando indicadores...</p> : null}

        <section className="dashboard-metrics-grid" aria-label="Indicadores globais">
          {metricCards.map(({ key, label, icon: Icon }) => (
            <article className="dashboard-metric" key={key}>
              <Icon size={20} />
              <span>{label}</span>
              <strong>{formatNumber(dashboard?.[key])}</strong>
            </article>
          ))}
        </section>

        <div className="dashboard-section-title">
          <h2>Instituições</h2>
          <p>Comparativo por eventos, inscrições, presenças e certificados.</p>
        </div>

        <section className="events-table-panel">
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Instituição</th>
                  <th>Status</th>
                  <th>Eventos</th>
                  <th>Inscrições</th>
                  <th>Presenças</th>
                  <th>Certificados</th>
                  <th>Comparecimento</th>
                </tr>
              </thead>
              <tbody>
                {(dashboard?.instituicoes || []).map((item) => (
                  <tr key={item.instituicaoId}>
                    <td>{item.instituicaoNome}</td>
                    <td>{item.ativa ? "Ativa" : "Inativa"}</td>
                    <td>{formatNumber(item.eventos)}</td>
                    <td>{formatNumber(item.inscricoes)}</td>
                    <td>{formatNumber(item.presencas)}</td>
                    <td>{formatNumber(item.certificadosEmitidos)}</td>
                    <td>{item.taxaComparecimento}%</td>
                  </tr>
                ))}
                {!isLoading && (dashboard?.instituicoes || []).length === 0 ? (
                  <tr>
                    <td colSpan="7">Nenhuma instituição cadastrada.</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>

        <div className="dashboard-section-title">
          <h2>Ações globais</h2>
          <p>Cadastros e governança da plataforma.</p>
        </div>
        <section className="dashboard-actions-row">
          <Link to="/instituicoes">Gerenciar instituições</Link>
          <Link to="/secretarias">Gerenciar secretarias</Link>
          <Link to="/eventos">Todos os eventos</Link>
          <Link to="/certificados">Certificados</Link>
        </section>
      </main>
    </>
  );
}
