import { request } from './apiClient.js';

function unwrapResponse(response) {
  return response?.data || response;
}

function buildStudentFormData(payload) {
  if (payload instanceof FormData) {
    return payload;
  }

  const formData = new FormData();
  const fields = {
    Nome: payload.nome || payload.name,
    Senha: payload.senha || payload.password,
    Email: payload.email,
    DataNascimento: payload.dataNascimento || payload.birthDate,
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

export async function listStudents() {
  try {
    const response = await request('/Aluno', {
      method: 'GET',
    });
    return unwrapResponse(response);
  } catch (error) {
    console.error('Erro ao listar alunos:', error);
    throw error;
  }
}

export async function getStudentById(id) {
  try {
    const response = await request(`/Aluno/${id}`, {
      method: 'GET',
    });
    return unwrapResponse(response);
  } catch (error) {
    console.error(`Erro ao carregar aluno ${id}:`, error);
    throw error;
  }
}

export async function saveStudent(payload) {
  try {
    const isUpdate = payload.id;
    const method = isUpdate ? 'PATCH' : 'POST';
    const endpoint = isUpdate ? `/Aluno/${payload.id}` : '/Aluno';

    const response = await request(endpoint, {
      method,
      body: buildStudentFormData(payload),
    });

    return unwrapResponse(response);
  } catch (error) {
    console.error('Erro ao salvar aluno:', error);
    throw error;
  }
}

export async function deleteStudent(id) {
  try {
    await request(`/Aluno/${id}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error(`Erro ao deletar aluno ${id}:`, error);
    throw error;
  }
}
