import { Award, CalendarDays, FileText } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FormField } from "../components/forms/FormField.jsx";
import { AdminHeader } from "../components/navigation/AdminHeader.jsx";
import { Button } from "../components/ui/Button.jsx";
import { Modal } from "../components/ui/Modal.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useLanguage } from "../hooks/useLanguage.js";
import {
  getCertificateById,
  saveCertificate,
} from "../services/certificateService.js";
import { listEvents } from "../services/eventService.js";
import { getAssetUrl } from "../utils/formatters.js";

const initialForm = {
  certificateDate: "",
  text: "",
  eventId: "",
};

export function CertificateFormPage({ mode = "create" }) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { id } = useParams();
  const [form, setForm] = useState(initialForm);
  const [events, setEvents] = useState([]);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(mode === "edit");
  const navigate = useNavigate();
  const isEdit = mode === "edit";
  const routePrefix = user?.roleUsuario === "Secretaria" ? "/instituicao/certificados" : "/certificados";

  const selectedEvent = events.find((e) => e.id === Number(form.eventId));
  useEffect(() => {
    let isMounted = true;

    async function loadFormData() {
      setIsLoading(true);
      setError("");

      try {
        const [eventsData, certificate] = await Promise.all([
          listEvents(),
          isEdit ? getCertificateById(id) : Promise.resolve(null),
        ]);

        if (!isMounted) return;

        setEvents(Array.isArray(eventsData) ? eventsData : []);

        if (isEdit && certificate) {
          setForm({
            certificateDate: String(certificate.certificateDate || "").slice(0, 10),
            text: certificate.text || "",
            eventId: certificate.eventId ? String(certificate.eventId) : "",
          });
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Erro ao carregar certificado");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadFormData();

    return () => {
      isMounted = false;
    };
  }, [id, isEdit]);

  function updateField(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    setError("");

    try {
      await saveCertificate({ ...form, id: isEdit ? id : undefined });
      setOpen(true);
    } catch (err) {
      setError(err.message || "Erro ao salvar certificado");
    }
  }

  if (isLoading) {
    return (
      <>
        <AdminHeader title={isEdit ? t("edit") : t("createCertificate")} backTo={routePrefix} />
        <main className="certificate-editor-page" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
          <p>{t("loading") || "Carregando..."}</p>
        </main>
      </>
    );
  }

  return (
    <>
      <AdminHeader title={isEdit ? t("edit") : t("createCertificate")} backTo={routePrefix} />

      <main className="certificate-editor-page">
        <section className="certificate-editor-hero">
          <div>
            <span className="certificate-editor-eyebrow">
              {t("certificateNewEyebrow")}
            </span>
            <h1>{t("certificateNewTitle")}</h1>
            <p>{t("certificateNewCopy")}</p>
          </div>

          <div
            className="certificate-editor-notes"
            aria-label={t("certificateFields")}
          >
            <article>
              <CalendarDays size={20} />
              <span>{t("certificateDate")}</span>
            </article>
            <article>
              <FileText size={20} />
              <span>{t("eventId")}</span>
            </article>
          </div>
        </section>

        <section className="certificate-editor-card">
          <div className="certificate-editor-card-header">
            <div>
              <span>{t("form")}</span>
              <h2>{t("certificateData")}</h2>
            </div>
            <p>{t("certificateHint")}</p>
          </div>

          <form className="certificate-form" onSubmit={submit}>
            <p>Ao vincular este modelo ao evento, alunos FATEC e Público Geral com presença confirmada pela Secretaria recebem automaticamente o certificado em PDF por e-mail. Informe a carga horária no texto, quando aplicável.</p>
            {error ? (
              <div
                className="auth-error-message"
                style={{ color: "#dc2626", marginBottom: "1rem" }}
              >
                {error}
              </div>
            ) : null}

            <div className="certificate-form-grid">
              <FormField label={t("certificateDate")}>
                <input
                  type="date"
                  value={form.certificateDate}
                  onChange={(event) =>
                    updateField("certificateDate", event.target.value)
                  }
                  required
                />
              </FormField>

              <FormField label={t("eventId")}>
                <select
                  value={form.eventId}
                  onChange={(event) =>
                    updateField("eventId", event.target.value)
                  }
                  required
                >
                  <option value="">{t("selectEvent")}</option>
                  {events.map((event) => (
                    <option key={event.id} value={event.id}>
                      #{event.id} - {event.title}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label={t("message")}>
                <textarea
                  placeholder={t("certificateTextPlaceholder")}
                  value={form.text}
                  onChange={(event) => updateField("text", event.target.value)}
                  required
                />
              </FormField>
            </div>

            <div className="certificate-preview-card">
              <Award size={34} />
              <span>{t("certificatePreview")}</span>
              <h3>{selectedEvent?.nome ?? t("eventNotSelected")}</h3>
              <p>{form.text || t("certificateTextFallback")}</p>
            </div>

            <div className="certificate-form-actions">
              <Button type="submit">
                {isEdit ? t("edit") : t("createCertificate")}
              </Button>
            </div>
          </form>
        </section>
      </main>

      <Modal
        open={open}
        title={isEdit ? t("edit") : t("createCertificate")}
        message={
          isEdit ? "Certificado atualizado com sucesso." : t("certificateCreated")
        }
        image={getAssetUrl("emoteAcess.png")}
        confirmText={t("ok")}
        onClose={() => navigate(routePrefix)}
        onConfirm={() => navigate(routePrefix)}
      />
    </>
  );
}
