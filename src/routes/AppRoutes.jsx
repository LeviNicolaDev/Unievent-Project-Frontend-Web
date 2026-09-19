import { Navigate, Route, Routes } from 'react-router-dom';
import { PrivateRoute } from '../components/PrivateRoute.jsx';
import { PublicParticipantRoute } from '../components/PublicParticipantRoute.jsx';
import { AdminLayout } from '../layouts/AdminLayout.jsx';
import { PublicLayout } from '../layouts/PublicLayout.jsx';
import { CertificateFormPage } from '../pages/CertificateFormPage.jsx';
import { CertificatesPage } from '../pages/CertificatesPage.jsx';
import { CheckInPage } from '../pages/CheckInPage.jsx';
import { ConfirmEmailPage } from '../pages/ConfirmEmailPage.jsx';
import { AdminDashboardPage } from '../pages/AdminDashboardPage.jsx';
import { EventFormPage } from '../pages/EventFormPage.jsx';
import { EventoDashboardPage } from '../pages/EventoDashboardPage.jsx';
import { EventPreviewPage } from '../pages/EventPreviewPage.jsx';
import { EventsPage } from '../pages/EventsPage.jsx';
import { InstitutionFormPage } from '../pages/InstitutionFormPage.jsx';
import { InstituicaoDashboardPage } from '../pages/InstituicaoDashboardPage.jsx';
import { InstitutionsPage } from '../pages/InstitutionsPage.jsx';
import { LandingPage } from '../pages/LandingPage.jsx';
import { LoginPage } from '../pages/LoginPage.jsx';
import { NotFoundPage } from '../pages/NotFoundPage.jsx';
import { PeopleManagementPage } from '../pages/PeopleManagementPage.jsx';
import { PublicEventDetailPage } from '../pages/PublicEventDetailPage.jsx';
import { PublicEventsPage } from '../pages/PublicEventsPage.jsx';
import { PublicAuthPage } from '../pages/PublicAuthPage.jsx';
import { PublicTicketDetailPage } from '../pages/PublicTicketDetailPage.jsx';
import { PublicTicketsPage } from '../pages/PublicTicketsPage.jsx';
import { ResponsibleFormPage } from '../pages/ResponsibleFormPage.jsx';
import { SecretaryRegistrationPage } from '../pages/SecretaryRegistrationPage.jsx';
import { UserSecretaryFormPage } from '../pages/UserSecretaryFormPage.jsx';
import { UsersSecretaryPage } from '../pages/UsersSecretaryPage.jsx';
import { SupportPage } from '../pages/SupportPage.jsx';

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/descobrir-eventos" element={<PublicEventsPage />} />
        <Route path="/descobrir-eventos/:id" element={<PublicEventDetailPage />} />
        <Route path="/entrar" element={<PublicAuthPage />} />
        <Route path="/criar-conta" element={<PublicAuthPage initialMode="signup" />} />
        <Route path="/meus-ingressos" element={<PublicParticipantRoute><PublicTicketsPage /></PublicParticipantRoute>} />
        <Route path="/meus-ingressos/:eventoId" element={<PublicParticipantRoute><PublicTicketDetailPage /></PublicParticipantRoute>} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/secretaria/cadastro" element={<SecretaryRegistrationPage />} />
        <Route path="/confirmar-email" element={<ConfirmEmailPage />} />
      </Route>

      <Route element={<AdminLayout />}>
        <Route path="/home" element={<PrivateRoute globalOnly><AdminDashboardPage /></PrivateRoute>} />
        <Route path="/instituicoes" element={<PrivateRoute globalOnly><InstitutionsPage /></PrivateRoute>} />
        <Route path="/instituicoes/nova" element={<PrivateRoute globalOnly><InstitutionFormPage /></PrivateRoute>} />
        <Route path="/instituicoes/:id/editar" element={<PrivateRoute globalOnly><InstitutionFormPage mode="edit" /></PrivateRoute>} />
        <Route path="/secretarias" element={<PrivateRoute globalOnly><UsersSecretaryPage /></PrivateRoute>} />
        <Route path="/secretarias/novo" element={<PrivateRoute globalOnly><UserSecretaryFormPage /></PrivateRoute>} />
        <Route path="/secretarias/:id/editar" element={<PrivateRoute globalOnly><UserSecretaryFormPage mode="edit" /></PrivateRoute>} />
        <Route path="/eventos" element={<PrivateRoute globalOnly><EventsPage /></PrivateRoute>} />
        <Route path="/eventos/novo" element={<PrivateRoute globalOnly><EventFormPage mode="create" /></PrivateRoute>} />
        <Route path="/eventos/:id/editar" element={<PrivateRoute globalOnly><EventFormPage mode="edit" /></PrivateRoute>} />
        <Route path="/eventos/:id/dashboard" element={<PrivateRoute globalOnly><EventoDashboardPage /></PrivateRoute>} />
        <Route path="/eventos/preview" element={<PrivateRoute globalOnly><EventPreviewPage /></PrivateRoute>} />
        <Route path="/responsaveis" element={<PrivateRoute globalOnly><PeopleManagementPage /></PrivateRoute>} />
        <Route path="/responsaveis/novo" element={<PrivateRoute globalOnly><ResponsibleFormPage /></PrivateRoute>} />
        <Route path="/responsaveis/:id/editar" element={<PrivateRoute globalOnly><ResponsibleFormPage mode="edit" /></PrivateRoute>} />
        <Route path="/certificados" element={<PrivateRoute globalOnly><CertificatesPage /></PrivateRoute>} />
        <Route path="/certificados/novo" element={<PrivateRoute globalOnly><CertificateFormPage /></PrivateRoute>} />
        <Route path="/certificados/:id/editar" element={<PrivateRoute globalOnly><CertificateFormPage mode="edit" /></PrivateRoute>} />
        <Route path="/check-in" element={<PrivateRoute globalOnly><CheckInPage /></PrivateRoute>} />
        <Route path="/suporte" element={<PrivateRoute><SupportPage /></PrivateRoute>} />
        <Route path="/instituicao/suporte" element={<PrivateRoute secretariaOnly><SupportPage /></PrivateRoute>} />
        <Route path="/instituicao/dashboard" element={<PrivateRoute secretariaOnly><InstituicaoDashboardPage /></PrivateRoute>} />
        <Route path="/instituicao/eventos" element={<PrivateRoute secretariaOnly><EventsPage /></PrivateRoute>} />
        <Route path="/instituicao/eventos/novo" element={<PrivateRoute secretariaOnly><EventFormPage mode="create" /></PrivateRoute>} />
        <Route path="/instituicao/eventos/:id/editar" element={<PrivateRoute secretariaOnly><EventFormPage mode="edit" /></PrivateRoute>} />
        <Route path="/instituicao/eventos/:id/dashboard" element={<PrivateRoute secretariaOnly><EventoDashboardPage /></PrivateRoute>} />
        <Route path="/instituicao/eventos/preview" element={<PrivateRoute secretariaOnly><EventPreviewPage /></PrivateRoute>} />
        <Route path="/instituicao/responsaveis" element={<PrivateRoute secretariaOnly><PeopleManagementPage /></PrivateRoute>} />
        <Route path="/instituicao/responsaveis/novo" element={<PrivateRoute secretariaOnly><ResponsibleFormPage /></PrivateRoute>} />
        <Route path="/instituicao/responsaveis/:id/editar" element={<PrivateRoute secretariaOnly><ResponsibleFormPage mode="edit" /></PrivateRoute>} />
        <Route path="/instituicao/certificados" element={<PrivateRoute secretariaOnly><CertificatesPage /></PrivateRoute>} />
        <Route path="/instituicao/certificados/novo" element={<PrivateRoute secretariaOnly><CertificateFormPage /></PrivateRoute>} />
        <Route path="/instituicao/certificados/:id/editar" element={<PrivateRoute secretariaOnly><CertificateFormPage mode="edit" /></PrivateRoute>} />
        <Route path="/instituicao/check-in" element={<PrivateRoute secretariaOnly><CheckInPage /></PrivateRoute>} />
      </Route>

      <Route path="/index.php" element={<Navigate to="/" replace />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
