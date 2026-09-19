import { ArrowLeft, CalendarDays, CheckCircle2, Clock3, MapPin, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { TicketQrCode } from "../components/tickets/TicketQrCode.jsx";
import { getMyTicket } from "../services/ticketService.js";

function isCancelled(ticket) {
  return String(ticket?.statusInscricao).toLowerCase() === "cancelada";
}

export function PublicTicketDetailPage() {
  const { eventoId } = useParams();
  const [ticket, setTicket] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getMyTicket(eventoId)
      .then((item) => { if (active) setTicket(item); })
      .catch((err) => { if (active) setError(err.message || "Ingresso não encontrado."); })
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, [eventoId]);

  if (isLoading) {
    return <main className="public-ticket-detail"><p className="public-tickets-state">Carregando ingresso...</p></main>;
  }

  if (error || !ticket) {
    return (
      <main className="public-ticket-detail">
        <Link className="ticket-detail-back" to="/meus-ingressos"><ArrowLeft size={18} aria-hidden="true" /> Voltar para Meus Ingressos</Link>
        <p className="public-tickets-state public-tickets-state--error" role="alert">{error || "Ingresso não encontrado."}</p>
      </main>
    );
  }

  const cancelled = isCancelled(ticket);
  const date = new Date(ticket.dataEvento);
  const validDate = !Number.isNaN(date.getTime());

  return (
    <main className="public-ticket-detail">
      <Link className="ticket-detail-back" to="/meus-ingressos"><ArrowLeft size={18} aria-hidden="true" /> Voltar para Meus Ingressos</Link>
      <article className={`ticket-detail-card ${cancelled ? "ticket-detail-card--cancelled" : ""}`}>
        <div className="ticket-detail-copy">
          <span>Ingresso UniEvent</span>
          <h1>{ticket.nomeEvento}</h1>
          <p className="ticket-detail-institution">{ticket.instituicaoNome}</p>
          <ul>
            <li><CalendarDays size={19} /> {validDate ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" }).format(date) : "Data não informada"}</li>
            <li><Clock3 size={19} /> {validDate ? new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(date) : "Horário não informado"}</li>
            <li><MapPin size={19} /> {ticket.local}</li>
          </ul>
          {cancelled ? (
            <div className="ticket-detail-status ticket-detail-status--danger"><XCircle size={20} /> Inscrição cancelada</div>
          ) : ticket.presencaConfirmada ? (
            <div className="ticket-detail-status ticket-detail-status--success"><CheckCircle2 size={20} /> Check-in realizado</div>
          ) : (
            <div className="ticket-detail-status">Inscrição ativa · aguardando check-in</div>
          )}
          {ticket.eventoRealizado && <p className="ticket-detail-history">Este evento já aconteceu. O ingresso permanece no seu histórico.</p>}
        </div>

        <div className="ticket-detail-qr-panel">
          {cancelled ? (
            <div className="ticket-qr-unavailable">Este ingresso não pode ser usado para check-in.</div>
          ) : (
            <>
              <TicketQrCode value={ticket.conteudoQrCode} large used={ticket.presencaConfirmada} />
              <p>{ticket.presencaConfirmada ? "Este QR Code já foi utilizado no check-in." : "Apresente este QR Code na entrada do evento."}</p>
              <span>Código do ingresso</span>
              <code>{ticket.codigoIngresso}</code>
            </>
          )}
        </div>
      </article>
    </main>
  );
}
