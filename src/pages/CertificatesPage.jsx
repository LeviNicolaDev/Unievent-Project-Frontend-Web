import {
  Award,
  CalendarDays,
  FileText,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AdminHeader } from "../components/navigation/AdminHeader.jsx";
import { Modal } from "../components/ui/Modal.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useLanguage } from "../hooks/useLanguage.js";
import {
  deleteCertificate,
  listCertificates,
} from "../services/certificateService.js";
import { listEvents } from "../services/eventService.js";
import { formatDate, getAssetUrl } from "../utils/formatters.js";

export function CertificatesPage() {
  const { language, t } = useLanguage();
  const { user } = useAuth();
  const [certificates, setCertificates] = useState([]);
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState("");
  const [certificateToDelete, setCertificateToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const routePrefix = user?.roleUsuario === "Secretaria" ? "/instituicao/certificados" : "/certificados";

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setIsLoading(true);
    setError(null);
    try {
      const [certsData, eventsData] = await Promise.all([
        listCertificates(),
        listEvents(),
      ]);
      setCertificates(Array.isArray(certsData) ? certsData : []);
      setEvents(Array.isArray(eventsData) ? eventsData : []);
    } catch (err) {
      setError(err.message || "Erro ao carregar dados");
      console.error("Erro:", err);
    } finally {
      setIsLoading(false);
    }
  }

  function getEventTitle(event) {
    return event.titulo || event.title || "";
  }

  const eventTitlesById = useMemo(() => {
    return events.reduce(
      (map, event) => ({ ...map, [event.id]: getEventTitle(event) }),
      {},
    );
  }, [events]);

  const filteredCertificates = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return certificates;
    }

    return certificates.filter((certificate) => {
      const eventTitle =
        eventTitlesById[certificate.eventoId || certificate.eventId] || "";
      const certificateText = certificate.texto || certificate.text || "";

      return (
        certificateText.toLowerCase().includes(normalizedSearch) ||
        String(certificate.eventoId || certificate.eventId).includes(
          normalizedSearch,
        ) ||
        eventTitle.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [certificates, eventTitlesById, search]);

  async function confirmDelete() {
    try {
      await deleteCertificate(certificateToDelete.id);
      setCertificates((current) =>
        current.filter(
          (certificate) => certificate.id !== certificateToDelete.id,
        ),
      );
      setCertificateToDelete(null);
    } catch (err) {
      setError(err.message || "Erro ao deletar certificado");
    }
  }

  if (isLoading) {
    return (
      <>
        <AdminHeader title={t("manageCertificates")} />
        <main
          className="certificates-page"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "60vh",
          }}
        >
          <p>{t("loading") || "Carregando..."}</p>
        </main>
      </>
    );
  }

  return (
    <>
      <AdminHeader title={t("manageCertificates")} />

      <main className="certificates-page">
        {error && (
          <div
            style={{
              background: "#fee2e2",
              color: "#991b1b",
              padding: "1rem",
              margin: "1rem",
              borderRadius: "0.5rem",
            }}
          >
            {error}
          </div>
        )}

        <section className="certificates-toolbar">
          <div>
            <span className="certificates-eyebrow">
              {t("certificatesUniEvent")}
            </span>
            <h1>{t("manageCertificates")}</h1>
            <p>{t("certificatesCopy")}</p>
          </div>

          <Link className="certificates-create-link" to={`${routePrefix}/novo`}>
            <Plus size={18} />
            <span>{t("newCertificate")}</span>
          </Link>
        </section>

        <section
          className="certificates-summary"
          aria-label={t("certificatesSummary")}
        >
          <article>
            <Award size={20} />
            <strong>{certificates.length}</strong>
            <span>{t("certificates")}</span>
          </article>
          <article>
            <CalendarDays size={20} />
            <strong>{events.length}</strong>
            <span>{t("events")}</span>
          </article>
          <article>
            <FileText size={20} />
            <strong>{filteredCertificates.length}</strong>
            <span>{t("results")}</span>
          </article>
        </section>

        <section className="certificates-panel">
          <div className="certificates-panel-header">
            <div>
              <h2>{t("certificatesIssued")}</h2>
              <p>{t("recordsFound", { count: filteredCertificates.length })}</p>
            </div>

            <label className="certificates-search">
              <Search size={18} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t("searchCertificate")}
              />
            </label>
          </div>

          {filteredCertificates.length ? (
            <div className="certificates-grid">
              {filteredCertificates.map((certificate) => (
                <article className="certificate-card" key={certificate.id}>
                  <div className="certificate-card-icon">
                    <Award size={24} />
                  </div>
                  <div className="certificate-card-content">
                    <span>
                      {t("certificate")} #{certificate.id}
                    </span>
                    <h3>
                      {eventTitlesById[
                        certificate.eventoId || certificate.eventId
                      ] ||
                        `${t("events")} ${certificate.eventoId || certificate.eventId}`}
                    </h3>
                    <p>{certificate.texto || certificate.text}</p>
                    <div className="certificate-meta">
                      <small>
                        <CalendarDays size={15} />
                        {formatDate(
                          certificate.dataCertificado ||
                            certificate.certificateDate,
                          language,
                        )}
                      </small>
                      <small>
                        <FileText size={15} />
                        {t("eventId")}{" "}
                        {certificate.eventoId || certificate.eventId}
                      </small>
                    </div>
                  </div>
                  <div className="certificate-card-actions">
                    {certificate.id ? (
                      <Link
                        to={`${routePrefix}/${certificate.id}/editar`}
                        title={t("edit")}
                      >
                        <Pencil size={17} />
                      </Link>
                    ) : null}
                    <button
                      type="button"
                      title={t("deleteCertificateTitle")}
                      onClick={() => setCertificateToDelete(certificate)}
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="certificates-empty">
              <Award size={36} />
              <p>{t("noCertificates")}</p>
            </div>
          )}
        </section>
      </main>

      <Modal
        open={Boolean(certificateToDelete)}
        title={t("deleteCertificateTitle")}
        message={t("deleteCertificateMessage")}
        image={getAssetUrl("warning.jpg")}
        onClose={() => setCertificateToDelete(null)}
        onConfirm={confirmDelete}
      />
    </>
  );
}
