import { getApiAssetUrl, request } from "./apiClient.js";

const EVENT_CATEGORIES = ["Palestra", "Workshop", "Feira", "Evento", "Festa"];
const CATEGORY_BY_NORMALIZED_NAME = EVENT_CATEGORIES.reduce((map, category) => {
  map[category.toLowerCase()] = category;
  return map;
}, {});

function unwrapResponse(response) {
  return response?.data || response;
}

function toArray(value) {
  if (!value) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
}

function toDateInput(value) {
  if (!value) {
    return "";
  }

  return String(value).slice(0, 10);
}

function toTimeInput(value) {
  if (!value || !String(value).includes("T")) {
    return "";
  }

  return String(value).slice(11, 16);
}

function combineDateTime(date, time) {
  if (!date) {
    return "";
  }

  return `${date}T${time || "00:00"}:00`;
}

function normalizeCategory(value) {
  const normalizedValue = String(value || "")
    .trim()
    .toLowerCase();
  return CATEGORY_BY_NORMALIZED_NAME[normalizedValue] || value || "";
}

export function normalizeEvent(event) {
  if (!event) {
    return null;
  }

  const dataEvento =
    event.dataEvento || event.DataEvento || event.date || event.data;
  const thumbnail = toArray(
    event.thumbnail || event.Thumbnail || event.image || event.imagem,
  )
    .map(getApiAssetUrl)
    .filter(Boolean);
  const responsavelEventoId =
    event.responsavelEventoId ||
    event.ResponsavelEventoId ||
    event.idResponsavelEvento ||
    event.IdResponsavelEvento ||
    event.responsibleId ||
    "";
  const responsavelNome =
    event.responsavel ||
    event.Responsavel ||
    event.responsibleName ||
    event.nomeResponsavel ||
    "";
  const nome = event.nome || event.Nome || event.title || event.titulo || "";
  const descricao =
    event.descricao || event.Descricao || event.description || "";
  const local = event.local || event.Local || "";
  const categoria = normalizeCategory(
    event.categoria || event.Categoria || event.category,
  );
  const capacidade =
    event.capacidade || event.Capacidade || event.capacity || "";
  const instituicaoId =
    event.instituicaoId || event.InstituicaoId || event.institutionId || "";

  const instituicaoNome =
    event.instituicaoNome ||
    event.InstituicaoNome ||
    event.institutionName ||
    event.nomeInstituicao ||
    "";

  return {
    ...event,
    nome,
    title: nome,
    titulo: nome,
    descricao,
    description: descricao,
    local,
    categoria,
    category: categoria,
    dataEvento,
    date: toDateInput(dataEvento),
    time: event.time || event.hora || toTimeInput(dataEvento),
    capacidade,
    capacity: capacidade,
    vagasDisponiveis: event.vagasDisponiveis ?? event.VagasDisponiveis ?? null,
    thumbnail,
    image: thumbnail[0] || "",
    responsavelEventoId,
    idResponsavelEvento: responsavelEventoId,
    responsible: responsavelEventoId ? String(responsavelEventoId) : "",
    responsibleName: responsavelNome,
    responsavel:
      responsavelNome || (responsavelEventoId ? `#${responsavelEventoId}` : ""),

    instituicaoId,
    institutionId: instituicaoId ? String(instituicaoId) : "",
    instituicaoNome,
    institutionName: instituicaoNome,
    cidade: event.cidade || event.Cidade || "",
    estado: event.estado || event.Estado || "",
    rua: event.rua || event.Rua || "",
    numero: event.numero || event.Numero || "",
    bairro: event.bairro || event.Bairro || "",
    cep: event.cep || event.Cep || "",
    visibility: event.visibilidade || event.Visibilidade || "Publico",
    audience:
      event.publicoPermitido || event.PublicoPermitido || "PublicoGeral",
  };
}

function buildQuery(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, value);
    }
  });
  const text = query.toString();
  return text ? `?${text}` : "";
}

function appendIfPresent(formData, key, value) {
  if (value !== undefined && value !== null && value !== "") {
    formData.append(key, value);
  }
}

function buildEventFormData(payload) {
  if (payload instanceof FormData) {
    return payload;
  }

  const formData = new FormData();
  const dataEvento = payload.date
    ? combineDateTime(payload.date, payload.time)
    : payload.dataEvento;
  const responsavelEventoId =
    payload.responsible ||
    payload.responsavelEventoId ||
    payload.idResponsavelEvento ||
    payload.responsibleId;
  const imageFiles = toArray(
    payload.imageFile || payload.thumbnailFiles || payload.thumbnailFile,
  );

  appendIfPresent(
    formData,
    "Nome",
    payload.title || payload.nome || payload.titulo,
  );
  appendIfPresent(
    formData,
    "Descricao",
    payload.description || payload.descricao,
  );
  appendIfPresent(formData, "Local", payload.local);
  appendIfPresent(formData, "Categoria", payload.category || payload.categoria);
  appendIfPresent(formData, "DataEvento", dataEvento);
  appendIfPresent(
    formData,
    "Capacidade",
    payload.capacity || payload.capacidade,
  );
  appendIfPresent(formData, "ResponsavelEventoId", responsavelEventoId);
  appendIfPresent(
    formData,
    "InstituicaoId",
    payload.institutionId || payload.instituicaoId,
  );

  appendIfPresent(
    formData,
    "Visibilidade",
    payload.visibility || payload.visibilidade,
  );
  appendIfPresent(
    formData,
    "PublicoPermitido",
    payload.audience || payload.publicoPermitido,
  );
  imageFiles.forEach((file) => {
    if (file instanceof File) {
      formData.append("Thumbnail", file);
    }
  });

  return formData;
}

export async function listEvents() {
  try {
    const response = await request("/Evento", {
      method: "GET",
    });
    const events = unwrapResponse(response);
    return Array.isArray(events) ? events.map(normalizeEvent) : [];
  } catch (error) {
    console.error("Erro ao listar eventos:", error);
    throw error;
  }
}

export async function searchEvents(filters = {}) {
  try {
    const response = await request(`/Evento${buildQuery(filters)}`, {
      method: "GET",
      skipAuth: true,
    });
    const data = unwrapResponse(response);

    if (Array.isArray(data)) {
      return {
        items: data.map(normalizeEvent),
        page: 1,
        pageSize: data.length,
        totalItems: data.length,
        totalPages: data.length > 0 ? 1 : 0,
      };
    }

    return {
      ...data,
      items: Array.isArray(data?.items) ? data.items.map(normalizeEvent) : [],
    };
  } catch (error) {
    console.error("Erro ao buscar eventos:", error);
    throw error;
  }
}

export async function getEventById(id, options = {}) {
  try {
    const response = await request(`/Evento/${id}`, {
      method: "GET",
      skipAuth: options.skipAuth,
    });
    return normalizeEvent(unwrapResponse(response));
  } catch (error) {
    console.error(`Erro ao carregar evento ${id}:`, error);
    throw error;
  }
}

export async function registerForEvent(id) {
  try {
    const response = await request(`/Evento/${id}/inscrever-se`, {
      method: "POST",
    });
    return unwrapResponse(response);
  } catch (error) {
    console.error(`Erro ao se inscrever no evento ${id}:`, error);
    throw error;
  }
}

export async function getMyEventRegistration(id) {
  try {
    const response = await request(`/Evento/${id}/minha-inscricao`, {
      method: "GET",
    });
    return unwrapResponse(response);
  } catch (error) {
    if (error.status === 404) {
      return null;
    }

    console.error(`Erro ao consultar inscrição do evento ${id}:`, error);
    throw error;
  }
}

export async function saveEvent(payload) {
  try {
    const isUpdate = payload.id;
    const method = isUpdate ? "PUT" : "POST";
    const endpoint = isUpdate ? `/Evento/${payload.id}` : "/Evento";
    const formData = buildEventFormData(payload);

    const response = await request(endpoint, {
      method,
      body: formData,
    });

    return normalizeEvent(unwrapResponse(response));
  } catch (error) {
    console.error("Erro ao salvar evento:", error);
    throw error;
  }
}

export async function deleteEvent(id) {
  try {
    await request(`/Evento/${id}`, {
      method: "DELETE",
    });
  } catch (error) {
    console.error(`Erro ao deletar evento ${id}:`, error);
    throw error;
  }
}

export async function getEventCategories() {
  try {
    const response = await request("/Evento/categorias", {
      method: "GET",
    });
    const categories = unwrapResponse(response);
    return Array.isArray(categories) ? categories : EVENT_CATEGORIES;
  } catch (error) {
    console.error("Erro ao carregar categorias:", error);
    return EVENT_CATEGORIES;
  }
}
