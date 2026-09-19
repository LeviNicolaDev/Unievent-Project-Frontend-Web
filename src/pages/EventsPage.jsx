import {
  BarChart3,
  CalendarDays,
  Eye,
  Pencil,
  Plus,
  Search,
  Tags,
  Ticket,
  Trash2,
  UsersRound,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AdminHeader } from "../components/navigation/AdminHeader.jsx";
import { DataTable } from "../components/tables/DataTable.jsx";
import { Modal } from "../components/ui/Modal.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useLanguage } from "../hooks/useLanguage.js";
import { deleteEvent, listEvents } from "../services/eventService.js";
import { formatDate, getAssetUrl } from "../utils/formatters.js";

export function EventsPage() {
  const { language, t } = useLanguage();
  const { user } = useAuth();
  const [rows, setRows] = useState([]);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const routePrefix = user?.roleUsuario === "Secretaria" ? "/instituicao/eventos" : "/eventos";

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    setIsLoading(true);
    setError(null);
    try {
      const events = await listEvents();
      setRows(Array.isArray(events) ? events : []);
    } catch (err) {
      setError(err.message || "Erro ao carregar eventos");
      console.error("Erro:", err);
    } finally {
      setIsLoading(false);
    }
  }

  const filteredRows = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    if (!normalizedSearch) {
      return rows;
    }

    return rows.filter(
      (event) =>
        event.titulo?.toLowerCase().includes(normalizedSearch) ||
        event.title?.toLowerCase().includes(normalizedSearch) ||
        event.responsavel?.toLowerCase().includes(normalizedSearch) ||
        event.responsible?.toLowerCase().includes(normalizedSearch) ||
        event.categoria?.toLowerCase().includes(normalizedSearch) ||
        event.category?.toLowerCase().includes(normalizedSearch) ||
        event.descricao?.toLowerCase().includes(normalizedSearch) ||
        event.description?.toLowerCase().includes(normalizedSearch),
    );
  }, [rows, search]);

  const summary = useMemo(() => {
    const categories = new Set(
      rows.map((event) => event.categoria || event.category),
    );
    const totalCapacity = rows.reduce(
      (total, event) => total + Number(event.capacidade || event.capacity || 0),
      0,
    );

    return [
      { label: t("events"), value: rows.length, icon: CalendarDays },
      { label: t("capacity"), value: totalCapacity, icon: UsersRound },
      { label: t("categories"), value: categories.size, icon: Tags },
    ];
  }, [rows, t]);

  function getCategoryLabel(category) {
    const labels = {
      Palestra: t("categoryLecture"),
      Workshop: t("categoryWorkshop"),
      Feira: "Feira",
      Evento: "Evento",
      Festa: "Festa",
    };

    return labels[category] || category;
  }
  function getEventTitle(event) {
    return event.title || event.nome || "";
  }

  function getEventResponsible(event) {
    return event.responsavel || event.responsible || "";
  }

  function getEventCategory(event) {
    return event.category || event.categoria || "";
  }

  function getEventDate(event) {
    return event.date || event.dataEvento || "";
  }

  function getEventTime(event) {
    return event.time || "";
  }

  function getEventDescription(event) {
    return event.description || event.descricao || "";
  }

  function getEventCapacity(event) {
    return event.capacity || event.capacidade || "";
  }

  function getEventImage(event) {
    return event.image || "";
  }
  const columns = useMemo(
    () => [
      { key: "id", label: "ID" },
      { key: "titulo", label: t("title"), render: (row) => getEventTitle(row) },
      {
        key: "responsavel",
        label: t("responsible"),
        render: (row) => getEventResponsible(row),
      },
      {
        key: "categoria",
        label: t("eventType"),
        render: (row) => getCategoryLabel(getEventCategory(row)),
      },
      {
        key: "data",
        label: t("date"),
        render: (row) => formatDate(getEventDate(row), language),
      },
      { key: "hora", label: t("time"), render: (row) => getEventTime(row) || "-" },
      {
        key: "imagem",
        label: t("image"),
        render: (row) => {
          const img = getEventImage(row);
          return img ? (
            <img
              className="table-image"
              src={img}
              alt=""
              onError={(event) => {
                event.currentTarget.src = getAssetUrl("upload.png");
              }}
            />
          ) : "-";
        },
      },
      {
        key: "descricao",
        label: t("description"),
        render: (row) => (
          <span className="event-description-cell">
            {getEventDescription(row)}
          </span>
        ),
      },
      {
        key: "capacidade",
        label: t("capacity"),
        render: (row) => getEventCapacity(row),
      },
      {
        key: "actions",
        label: t("actions"),
        render: (row) => (
          <div className="table-actions">
            <Link to={`${routePrefix}/${row.id}/editar`} title={t("edit")}>
              <Pencil size={18} />
            </Link>
            <button
              type="button"
              title={t("delete")}
              onClick={() => setEventToDelete(row)}
            >
              <Trash2 size={18} />
            </button>
            <Link to={`${routePrefix}/preview`} title={t("preview")}>
              <Eye size={18} />
            </Link>
            <Link to={`${routePrefix}/${row.id}/dashboard`} title="Visualizar dashboard">
              <BarChart3 size={18} />
            </Link>
          </div>
        ),
      },
    ],
    [language, routePrefix, t],
  );

  async function confirmDelete() {
    try {
      await deleteEvent(eventToDelete.id);
      setRows((current) =>
        current.filter((event) => event.id !== eventToDelete.id),
      );
      setEventToDelete(null);
    } catch (err) {
      setError(err.message || "Erro ao deletar evento");
    }
  }

  if (isLoading) {
    return (
      <>
        <AdminHeader title={t("eventsListTitle")} />
        <main
          className="events-page"
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
      <AdminHeader title={t("eventsListTitle")} />
      <main className="events-page">
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

        <section className="events-toolbar">
          <div>
            <span className="events-eyebrow">{t("eventsRegistered")}</span>
            <h1>{t("eventsHeading")}</h1>
            <p>{t("eventsCopy")}</p>
          </div>

          <Link className="events-create-link" to={`${routePrefix}/novo`}>
            <Plus size={18} />
            <span>{t("newEvent")}</span>
          </Link>
        </section>

        <section className="events-summary" aria-label={t("eventsSummary")}>
          {summary.map(({ label, value, icon: Icon }) => (
            <article key={label}>
              <Icon size={20} />
              <strong>{value}</strong>
              <span>{label}</span>
            </article>
          ))}
          <article>
            <Ticket size={20} />
            <strong>{filteredRows.length}</strong>
            <span>{t("results")}</span>
          </article>
        </section>

        <section className="events-table-panel">
          <div className="events-table-header">
            <div>
              <h2>{t("allEvents")}</h2>
              <p>{t("recordsFound", { count: filteredRows.length })}</p>
            </div>

            <label className="events-search">
              <Search size={18} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t("searchEvent")}
              />
            </label>
          </div>

          <DataTable
            columns={columns}
            rows={filteredRows}
            emptyMessage={t("noEvents")}
          />
        </section>
      </main>
      <Modal
        open={Boolean(eventToDelete)}
        title={t("deleteEventTitle")}
        message={t("deleteEventMessage")}
        image={getAssetUrl("warning.jpg")}
        onClose={() => setEventToDelete(null)}
        onConfirm={confirmDelete}
      />
    </>
  );
}
