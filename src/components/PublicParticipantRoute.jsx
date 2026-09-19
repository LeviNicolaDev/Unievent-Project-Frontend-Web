import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import { isPublicParticipant } from "../services/authService.js";

export function PublicParticipantRoute({ children }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <main className="public-tickets-page"><p className="public-tickets-state">Carregando sessão...</p></main>;
  }

  if (!isAuthenticated || !isPublicParticipant(user)) {
    return <Navigate to="/entrar" replace state={{ from: location.pathname }} />;
  }

  return children;
}
