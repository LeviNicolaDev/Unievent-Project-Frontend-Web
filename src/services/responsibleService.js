import { getApiAssetUrl, request } from './apiClient.js';

function unwrapResponse(response) {
  return response?.data || response;
}

function normalizeResponsible(person) {
  if (!person) {
    return null;
  }

  const nome = person.nome || person.Nome || person.name || '';
  const fotoPerfil = getApiAssetUrl(
    person.fotoPerfil || person.FotoPerfil || person.avatar || '',
  );
  const id = person.id || person.Id;

  return {
    ...person,
    id,
    nome,
    name: nome,
    fotoPerfil,
    avatar: fotoPerfil,
  };
}

function buildResponsibleBody(payload) {
  if (payload instanceof FormData) {
    return payload;
  }

  if (payload.id) {
    const formData = new FormData();
    formData.append('Nome', payload.nome || payload.name || '');
    if (payload.instituicaoId || payload.institutionId) {
      formData.append('InstituicaoId', payload.instituicaoId || payload.institutionId);
    }

    if (payload.fotoPerfil instanceof File) {
      formData.append('FotoPerfil', payload.fotoPerfil);
    }

    return formData;
  }

  const formData = new FormData();
  formData.append('Nome', payload.nome || payload.name || '');
  if (payload.instituicaoId || payload.institutionId) {
    formData.append('InstituicaoId', payload.instituicaoId || payload.institutionId);
  }

  if (payload.fotoPerfil instanceof File) {
    formData.append('FotoPerfil', payload.fotoPerfil);
  }

  return formData;
}

export async function listResponsiblePeople() {
  try {
    const response = await request('/ResponsavelEvento', {
      method: 'GET',
    });
    const people = unwrapResponse(response);
    return Array.isArray(people) ? people.map(normalizeResponsible) : [];
  } catch (error) {
    console.error('Erro ao listar responsáveis:', error);
    throw error;
  }
}

export async function getResponsibleById(id) {
  try {
    const response = await request(`/ResponsavelEvento/${id}`, {
      method: 'GET',
    });
    return normalizeResponsible(unwrapResponse(response));
  } catch (error) {
    console.error(`Erro ao carregar responsável ${id}:`, error);
    throw error;
  }
}

export async function saveResponsible(payload) {
  try {
    const isUpdate = payload.id;
    const method = isUpdate ? 'PATCH' : 'POST';
    const endpoint = isUpdate ? `/ResponsavelEvento/${payload.id}` : '/ResponsavelEvento';
    const body = buildResponsibleBody(payload);

    const response = await request(endpoint, {
      method,
      body,
      headers: body instanceof FormData ? {} : { 'Content-Type': 'application/json' },
    });

    return normalizeResponsible(unwrapResponse(response));
  } catch (error) {
    console.error('Erro ao salvar responsável:', error);
    throw error;
  }
}

export async function deleteResponsible(id) {
  try {
    await request(`/ResponsavelEvento/${id}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error(`Erro ao deletar responsável ${id}:`, error);
    throw error;
  }
}
