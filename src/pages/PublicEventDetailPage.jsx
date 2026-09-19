import {
  ArrowLeft,
  Award,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Download,
  MapPin,
  RefreshCw,
  Ticket,
  UsersRound,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import { isPublicParticipant } from "../services/authService.js";
import { getEventById, getMyEventRegistration, registerForEvent } from "../services/eventService.js";
import { formatDate, getAssetUrl } from "../utils/formatters.js";
import { downloadMyCertificate } from "../services/certificateService.js";
import { request } from "../services/apiClient.js";

const AUDIENCE_LABELS = {
  PublicoGeral: "Público geral",
  publicoGeral: "Público geral",
  TodosAlunosFatec: "Todos os alunos FATEC",
  todosAlunosFatec: "Todos os alunos FATEC",
  AlunosDaInstituicao: "Somente alunos desta instituição",
  alunosDaInstituicao: "Somente alunos desta instituição",
};

function getAudienceLabel(event) {
  return (
    AUDIENCE_LABELS[event.audience || event.publicoPermitido] || "Público geral"
  );
}

function normalizeAudience(value) {
  return String(value || "").trim().toLowerCase();
}

export function PublicEventDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [registration, setRegistration] = useState(null);
  const [error, setError] = useState(null);
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [ticketCode, setTicketCode] = useState("");
  const [downloading, setDownloading] = useState(false);
  const publicUser = isPublicParticipant(user);

  useEffect(() => {
    async function loadEvent() {
      setIsLoading(true);
      setError(null);
      try {
        const loadedEvent = await getEventById(id, { skipAuth: !publicUser });
        setEvent(loadedEvent);
        if (publicUser) {
          setRegistration(await getMyEventRegistration(id));
        } else {
          setRegistration(null);
        }
      } catch (err) {
        setError(err.message || "Evento não encontrado");
      } finally {
        setIsLoading(false);
      }
    }

    loadEvent();
  }, [id, publicUser]);

  useEffect(() => {
    let active = true;
    setTicketCode("");
    if (registration && publicUser) {
      request(`/Evento/${id}/ingresso`).then(ticket => {
        if (active) setTicketCode(ticket.codigoIngresso);
      }).catch(err => { if (active) setActionError(err.message); });
    }
    return () => { active = false; };
  }, [id, Boolean(registration), publicUser]);

  async function refreshRegistration() {
    setActionError("");
    try {
      setRegistration(await getMyEventRegistration(id));
      setActionSuccess("Status da inscrição atualizado.");
    }
    catch (err) { setActionError(err.message); }
  }

  async function downloadCertificate() {
    setDownloading(true);
    try { await downloadMyCertificate(id); }
    catch (err) { setActionError(err.message); }
    finally { setDownloading(false); }
  }

  async function handleRegister() {
    setActionError("");
    setActionSuccess("");
    setIsRegistering(true);

    try {
      const result = await registerForEvent(id);
      setRegistration(result);
      setEvent(await getEventById(id, { skipAuth: false }));
      setActionSuccess("Inscrição realizada com sucesso.");
    } catch (err) {
      setActionError(err.message || "Não foi possível realizar a inscrição.");
    } finally {
      setIsRegistering(false);
    }
  }

  if (isLoading) {
    return (
      <main className="public-event-detail">
        <p className="public-event-detail__state" aria-live="polite">Carregando evento...</p>
      </main>
    );
  }

  if (error || !event) {
    return (
      <main className="public-event-detail">
        <Link className="public-event-detail__back" to="/descobrir-eventos">
          <ArrowLeft size={18} aria-hidden="true" /> Voltar para eventos
        </Link>
        <p className="public-event-detail__state public-event-detail__state--error">
          {error || "Evento não encontrado"}
        </p>
      </main>
    );
  }

  const audience = normalizeAudience(event.audience || event.publicoPermitido);
  const isPublicEvent = audience === "publicogeral";
  const vagasDisponiveis = event.vagasDisponiveis ?? event.capacidade;
  const isFull = Number(vagasDisponiveis) <= 0;
  const cannotRegister = !publicUser || !isPublicEvent || isFull || Boolean(registration);
  const address = [event.rua, event.numero, event.bairro, event.cidade, event.estado]
    .filter(Boolean)
    .join(", ");
  const eventImage = event.image || getAssetUrl("evento.png");
  const useFallbackImage = (image) => {
    image.currentTarget.src = getAssetUrl("evento.png");
  };

  return (
    <main className="public-event-detail">
      <Link className="public-event-detail__back" to="/descobrir-eventos">
        <ArrowLeft size={18} aria-hidden="true" /> Voltar para eventos
      </Link>

      <article className="public-event-detail-card">
        <figure className="public-event-detail__media">
          <img
            className="public-event-detail__image-backdrop"
            src={eventImage}
            alt=""
            aria-hidden="true"
            onError={useFallbackImage}
          />
          <img
            className="public-event-detail__image"
            src={eventImage}
            alt={`Imagem do evento ${event.nome}`}
            onError={useFallbackImage}
          />
          <figcaption>
            {event.categoria && <span>{event.categoria}</span>}
            <span>{getAudienceLabel(event)}</span>
          </figcaption>
        </figure>

        <div className="public-event-detail__content">
          <span className="public-event-detail__institution">
            <Building2 size={16} aria-hidden="true" />
            {event.instituicaoNome || "Instituição não informada"}
          </span>
          <h1>{event.nome}</h1>
          <p className="public-event-detail__description">{event.descricao}</p>

          <dl className="public-event-detail__facts">
            <div>
              <dt><CalendarDays size={18} aria-hidden="true" /> Data</dt>
              <dd>{formatDate(event.dataEvento, "pt")}</dd>
            </div>
            <div>
              <dt><Clock3 size={18} aria-hidden="true" /> Horário</dt>
              <dd>{event.time || "Não informado"}</dd>
            </div>
            <div>
              <dt><UsersRound size={18} aria-hidden="true" /> Disponibilidade</dt>
              <dd>{isFull ? "Evento lotado" : `${vagasDisponiveis} de ${event.capacidade} vagas disponíveis`}</dd>
            </div>
            {event.local && (
              <div>
                <dt><MapPin size={18} aria-hidden="true" /> Local</dt>
                <dd>{event.local}</dd>
              </div>
            )}
            {address && (
              <div className="public-event-detail__address">
                <dt><MapPin size={18} aria-hidden="true" /> Endereço</dt>
                <dd>{address}</dd>
              </div>
            )}
          </dl>

          {actionSuccess && <div className="public-event-detail__feedback public-event-detail__feedback--success" role="status">{actionSuccess}</div>}
          {actionError && <div className="public-event-detail__feedback public-event-detail__feedback--error" role="alert">{actionError}</div>}

          {registration && (
            <aside className="public-event-registration" aria-label="Sua inscrição">
              <div className="public-event-registration__heading">
                <span className="public-event-registration__icon"><CheckCircle2 size={22} aria-hidden="true" /></span>
                <div>
                  <span>Sua inscrição</span>
                  <h2>Você já está inscrito</h2>
                </div>
              </div>

              <div className="public-event-registration__status">
                <div>
                  <CheckCircle2 size={18} aria-hidden="true" />
                  <p>
                    <strong>Presença</strong>
                    {registration.presencaGarantida
                      ? "Confirmada pela Secretaria"
                      : "Aguardando confirmação da Secretaria"}
                  </p>
                </div>
                {registration.certificadoEnviadoPorEmail && (
                  <div>
                    <Award size={18} aria-hidden="true" />
                    <p><strong>Certificado enviado</strong>O PDF também foi enviado para seu e-mail</p>
                  </div>
                )}
              </div>

              <div className="public-event-registration__actions">
                {ticketCode && (
                  <Link className="public-event-detail__button public-event-detail__button--primary" to={`/meus-ingressos/${id}`}>
                    <Ticket size={18} aria-hidden="true" /> Ver meu ingresso
                  </Link>
                )}
                <button className="public-event-detail__button" type="button" onClick={refreshRegistration}>
                  <RefreshCw size={18} aria-hidden="true" /> Atualizar presença
                </button>
                {registration.certificadoPdfDisponivel && (
                  <button className="public-event-detail__button" type="button" disabled={downloading} onClick={downloadCertificate}>
                    <Download size={18} aria-hidden="true" />
                    {downloading ? "Baixando..." : "Baixar certificado"}
                  </button>
                )}
              </div>
            </aside>
          )}

          {!registration && <div className="public-event-actions">
            {!publicUser && <Link to="/entrar">Entrar para se inscrever</Link>}
            {publicUser && (
              <button type="button" disabled={cannotRegister || isRegistering} onClick={handleRegister}>
                {registration
                  ? "Você já está inscrito"
                  : isRegistering
                    ? "Inscrevendo..."
                    : isFull
                      ? "Evento lotado"
                      : isPublicEvent
                        ? "Inscrever-se"
                        : "Público não permitido"}
              </button>
            )}
            {!isPublicEvent && (
              <p>Inscrição disponível somente para o público definido pela instituição.</p>
            )}
          </div>}
        </div>
      </article>
    </main>
  );
}
