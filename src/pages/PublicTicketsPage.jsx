import { ArrowUpRight, CalendarDays, Clock3, Compass, LogOut, MapPin, QrCode, Ticket, UserRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/images/logo.svg";
import { TicketQrCode } from "../components/tickets/TicketQrCode.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import { listMyTickets } from "../services/ticketService.js";

function isCancelled(ticket) {
  return String(ticket.statusInscricao).toLowerCase() === "cancelada";
}

function formatEventDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return { date: "Data não informada", time: "" };
  return {
    date: new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" }).format(date),
    time: new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(date),
  };
}

function TicketCard({ ticket }) {
  const cancelled = isCancelled(ticket);
  const when = formatEventDate(ticket.dataEvento);

  return (
    <article className={`digital-ticket ${cancelled ? "digital-ticket--cancelled" : ""}`}>
      <div className="digital-ticket__details">
        <span className="digital-ticket__eyebrow"><Ticket size={15} /> Ingresso UniEvent</span>
        <h3>{ticket.nomeEvento}</h3>
        <p className="digital-ticket__institution">{ticket.instituicaoNome}</p>
        <dl>
          <div><dt><CalendarDays size={17} /> Data</dt><dd>{when.date}</dd></div>
          <div><dt><Clock3 size={17} /> Horário</dt><dd>{when.time || "Não informado"}</dd></div>
          <div><dt><MapPin size={17} /> Local</dt><dd>{ticket.local}</dd></div>
        </dl>
        <div className="digital-ticket__statuses">
          <span className={cancelled ? "status-chip status-chip--danger" : "status-chip"}>
            {cancelled ? "Inscrição cancelada" : "Inscrito"}
          </span>
          <span className={ticket.presencaConfirmada ? "status-chip status-chip--success" : "status-chip status-chip--neutral"}>
            {ticket.presencaConfirmada ? "Check-in realizado" : "Aguardando check-in"}
          </span>
          {ticket.eventoRealizado && <span className="status-chip status-chip--neutral">Evento realizado</span>}
        </div>
        <Link className="digital-ticket__open" to={`/meus-ingressos/${ticket.eventoId}`}>
          <QrCode size={18} aria-hidden="true" /> Abrir ingresso
          <ArrowUpRight size={16} aria-hidden="true" />
        </Link>
      </div>
      <div className="digital-ticket__qr-column">
        {cancelled ? (
          <div className="ticket-qr-unavailable">QR Code indisponível</div>
        ) : (
          <TicketQrCode value={ticket.conteudoQrCode} used={ticket.presencaConfirmada} />
        )}
        {!cancelled && <code>{ticket.codigoIngresso}</code>}
      </div>
    </article>
  );
}

function TicketGroup({ title, tickets }) {
  if (tickets.length === 0) return null;
  return (
    <section className="public-ticket-group">
      <h2>{title}</h2>
      <div className="public-ticket-list">
        {tickets.map((ticket) => <TicketCard key={ticket.id} ticket={ticket} />)}
      </div>
    </section>
  );
}

export function PublicTicketsPage() {
  const { user, logout } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    listMyTickets()
      .then((items) => { if (active) setTickets(items); })
      .catch((err) => { if (active) setError(err.message || "Não foi possível carregar seus ingressos."); })
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, []);

  const groups = useMemo(() => ({
    upcoming: tickets.filter((ticket) => !ticket.eventoRealizado),
    past: tickets.filter((ticket) => ticket.eventoRealizado),
  }), [tickets]);

  return (
    <main className="public-tickets-page">
      <header className="public-events-header">
        <Link className="public-events-brand" to="/"><img src={logo} alt="UniEvent" /></Link>
        <nav className="public-events-account" aria-label="Minha conta">
          <Link className="public-ticket-action" to="/descobrir-eventos">
            <Compass size={18} aria-hidden="true" /> Explorar eventos
          </Link>
          <div className="public-tickets-account-identity">
            <UserRound size={17} aria-hidden="true" />
            <span title={user.email}>{user.email}</span>
          </div>
          <button className="public-ticket-action public-ticket-action--secondary" type="button" onClick={() => logout()}>
            <LogOut size={18} aria-hidden="true" /> Sair
          </button>
        </nav>
      </header>

      <section className="public-tickets-hero">
        <span>Minha conta</span>
        <h1>Meus Ingressos</h1>
        <p>Acesse seus eventos e apresente o QR Code na entrada para a Secretaria realizar o check-in.</p>
      </section>

      {isLoading && <p className="public-tickets-state" aria-live="polite">Carregando seus ingressos...</p>}
      {!isLoading && error && <p className="public-tickets-state public-tickets-state--error" role="alert">{error}</p>}
      {!isLoading && !error && tickets.length === 0 && (
        <section className="public-tickets-state public-tickets-empty">
          <div className="public-tickets-empty-icon"><Ticket size={32} aria-hidden="true" /></div>
          <h2>Você ainda não possui ingressos.</h2>
          <p>Explore os eventos disponíveis e realize sua primeira inscrição.</p>
          <Link to="/descobrir-eventos"><Compass size={18} aria-hidden="true" /> Explorar eventos</Link>
        </section>
      )}
      {!isLoading && !error && (
        <>
          <TicketGroup title="Próximos eventos" tickets={groups.upcoming} />
          <TicketGroup title="Eventos anteriores" tickets={groups.past} />
        </>
      )}
    </main>
  );
}
