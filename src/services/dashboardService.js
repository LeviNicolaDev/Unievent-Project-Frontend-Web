import { request } from "./apiClient.js";

export function getAdminDashboard() {
  return request("/admin/dashboard", { method: "GET" });
}

export function getInstituicaoDashboard() {
  return request("/instituicao/dashboard", { method: "GET" });
}

export function getEventoDashboard(eventId) {
  return request(`/Evento/${eventId}/dashboard`, { method: "GET" });
}
