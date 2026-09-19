import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { isUserSecretary } from '../services/authService.js';

export function PrivateRoute({ children, globalOnly = false, secretariaOnly = false }) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <p>Carregando...</p>
      </div>
    );
  }

  if (!isAuthenticated || !isUserSecretary(user)) {
    return <Navigate to="/login" replace />;
  }

  const isGlobalAdmin = user?.roleUsuario === 'Admin' && !user?.instituicaoId;
  const isSecretaria = user?.roleUsuario === 'Secretaria' && Boolean(user?.instituicaoId);

  if (globalOnly && !isGlobalAdmin) {
    return <Navigate to={isSecretaria ? '/instituicao/dashboard' : '/login'} replace />;
  }

  if (secretariaOnly && !isSecretaria) {
    return <Navigate to={isGlobalAdmin ? '/home' : '/login'} replace />;
  }

  return children;
}
