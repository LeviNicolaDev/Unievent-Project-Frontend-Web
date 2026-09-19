import { request } from './apiClient.js';

function unwrapResponse(response) {
  return response?.data || response;
}

function buildInstitutionFormData(payload) {
  if (payload instanceof FormData) {
    return payload;
  }

  const formData = new FormData();
  const fields = {
    Nome: payload.nome || payload.name,
    NomeAbreviado: payload.nomeAbreviado || payload.shortName,
    Codigo: payload.codigo || payload.code,
    Cnpj: payload.cnpj,
    Rua: payload.rua || payload.street,
    Cidade: payload.cidade || payload.city,
    Bairro: payload.bairro || payload.neighborhood,
    Estado: payload.estado || payload.state,
    Cep: payload.cep || payload.zipCode,
    Numero: payload.numero || payload.number,
    Telefone: payload.telefone || payload.phone,
    Site: payload.site,
    IsAtivo: payload.isAtivo,
  };

  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      formData.append(key, value);
    }
  });

  const photo = payload.fotoPerfil || payload.profilePhoto;
  if (photo instanceof File) {
    formData.append('FotoPerfil', photo);
  }

  return formData;
}

function normalizeInstitution(institution) {
  const id = institution.id ?? institution.Id ?? null;
  const codigo = institution.codigo || institution.Codigo || "";
  const nome = institution.nome || institution.Nome || institution.nomeAbreviado || institution.NomeAbreviado || "";
  const filterValue = id ? `id:${id}` : `codigo:${codigo}`;

  return {
    ...institution,
    id,
    codigo,
    nome,
    nomeAbreviado: institution.nomeAbreviado || institution.NomeAbreviado || "",
    cidade: institution.cidade || institution.Cidade || "",
    estado: institution.estado || institution.Estado || "",
    rua: institution.rua || institution.Rua || "",
    bairro: institution.bairro || institution.Bairro || "",
    cep: institution.cep || institution.Cep || "",
    numero: institution.numero || institution.Numero || "",
    temEventos: Boolean(institution.temEventos ?? institution.TemEventos),
    totalEventos: institution.totalEventos ?? institution.TotalEventos ?? 0,
    cnpj: institution.cnpj || institution.Cnpj || "",
    telefone: institution.telefone || institution.Telefone || "",
    site: institution.site || institution.Site || "",
    fotoPerfil: institution.fotoPerfil || institution.FotoPerfil || "",
    isAtivo: Boolean(institution.isAtivo ?? institution.IsAtivo ?? true),
    filterValue,
  };
}

export async function listInstitutions() {
  try {
    const response = await request('/Instituicao', {
      method: 'GET',
    });
    const institutions = unwrapResponse(response);
    return Array.isArray(institutions) ? institutions.map(normalizeInstitution) : [];
  } catch (error) {
    console.error('Erro ao listar instituições:', error);
    throw error;
  }
}

export async function listPublicInstitutions() {
  try {
    const response = await request('/Instituicao/publicas', {
      method: 'GET',
      skipAuth: true,
    });
    const institutions = unwrapResponse(response);
    return Array.isArray(institutions) ? institutions.map(normalizeInstitution) : [];
  } catch (error) {
    console.error('Erro ao listar instituições públicas:', error);
    throw error;
  }
}

export async function getInstitutionById(id) {
  try {
    const response = await request(`/Instituicao/${id}`, {
      method: 'GET',
    });
    return normalizeInstitution(unwrapResponse(response));
  } catch (error) {
    console.error(`Erro ao carregar instituição ${id}:`, error);
    throw error;
  }
}

export async function saveInstitution(payload) {
  try {
    const isUpdate = payload.id;
    const method = isUpdate ? 'PATCH' : 'POST';
    const endpoint = isUpdate ? `/Instituicao/${payload.id}` : '/Instituicao';

    const response = await request(endpoint, {
      method,
      body: buildInstitutionFormData(payload),
    });

    return normalizeInstitution(unwrapResponse(response));
  } catch (error) {
    console.error('Erro ao salvar instituição:', error);
    throw error;
  }
}

export async function setInstitutionActive(id, isActive) {
  try {
    const response = await request(`/Instituicao/${id}/${isActive ? 'ativar' : 'desativar'}`, {
      method: 'PATCH',
    });

    return normalizeInstitution(unwrapResponse(response));
  } catch (error) {
    console.error(`Erro ao ${isActive ? 'ativar' : 'desativar'} instituição ${id}:`, error);
    throw error;
  }
}

export async function deleteInstitution(id) {
  try {
    await request(`/Instituicao/${id}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error(`Erro ao deletar instituição ${id}:`, error);
    throw error;
  }
}
