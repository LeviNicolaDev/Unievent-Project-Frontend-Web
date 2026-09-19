import { request } from "./apiClient.js";

function normalizeTicket(ticket) {
  if (!ticket) return null;

  return {
    ...ticket,
    id: ticket.id ?? ticket.Id,
    eventoId: ticket.eventoId ?? ticket.EventoId,
    nomeEvento: ticket.nomeEvento ?? ticket.NomeEvento ?? "Evento",
    instituicaoNome: ticket.instituicaoNome ?? ticket.InstituicaoNome ?? "Instituição não informada",
    dataEvento: ticket.dataEvento ?? ticket.DataEvento,
    local: ticket.local ?? ticket.Local ?? "Local não informado",
    statusInscricao: ticket.statusInscricao ?? ticket.StatusInscricao ?? "ativa",
    presencaConfirmada: ticket.presencaConfirmada ?? ticket.PresencaConfirmada ?? false,
    dataCheckIn: ticket.dataCheckIn ?? ticket.DataCheckIn ?? null,
    codigoIngresso: ticket.codigoIngresso ?? ticket.CodigoIngresso ?? "",
    conteudoQrCode: ticket.conteudoQrCode ?? ticket.ConteudoQrCode ?? ticket.codigoIngresso ?? ticket.CodigoIngresso ?? "",
    eventoRealizado: ticket.eventoRealizado ?? ticket.EventoRealizado ?? false,
    podeRealizarCheckIn: ticket.podeRealizarCheckIn ?? ticket.PodeRealizarCheckIn ?? false,
  };
}

export async function listMyTickets() {
  const response = await request("/Evento/meus-ingressos", { method: "GET" });
  const data = response?.data || response;
  return Array.isArray(data) ? data.map(normalizeTicket).filter(Boolean) : [];
}

export async function getMyTicket(eventId) {
  const response = await request(`/Evento/${eventId}/ingresso`, { method: "GET" });
  return normalizeTicket(response?.data || response);
}
