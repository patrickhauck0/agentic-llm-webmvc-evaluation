const BASE_URL = 'http://localhost:3000'; // Ajustar caso a porta do backend seja diferente

let currentToken = null;
let logoutCallback = null;

// Função para o AuthContext injetar o token no módulo api
export const setApiToken = (token) => {
  currentToken = token;
};

// Função para o AuthContext registrar o callback de logout
export const setLogoutCallback = (callback) => {
  logoutCallback = callback;
};

// Wrapper centralizado para requisições
const apiFetch = async (endpoint, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (currentToken) {
    headers['Authorization'] = `Bearer ${currentToken}`;
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      if (logoutCallback) logoutCallback();
      throw new Error('Sessão expirada. Faça login novamente.');
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.erro || 'Erro na requisição');
    }

    return data;
  } catch (error) {
    throw error;
  }
};

// Módulo de Autenticação
export const authService = {
  registro: (dados) => apiFetch('/api/auth/registro', { method: 'POST', body: JSON.stringify(dados) }),
  login: (dados) => apiFetch('/api/auth/login', { method: 'POST', body: JSON.stringify(dados) }),
  logout: () => apiFetch('/api/auth/logout', { method: 'POST' }), // Opcional, logout real ocorre no context
};

// Módulo de Projetos
export const projetoService = {
  listar: () => apiFetch('/api/projetos'),
  criar: (dados) => apiFetch('/api/projetos', { method: 'POST', body: JSON.stringify(dados) }),
  editar: (id, dados) => apiFetch(`/api/projetos/${id}`, { method: 'PUT', body: JSON.stringify(dados) }),
  excluir: (id) => apiFetch(`/api/projetos/${id}`, { method: 'DELETE' }),
};

// Módulo de Tarefas
export const tarefaService = {
  listar: (projetoId, filtros, ordenacao) => {
    const params = new URLSearchParams();
    
    if (filtros.status && filtros.status.length > 0) {
      filtros.status.forEach(st => params.append('status', st));
    }
    if (filtros.tags && filtros.tags.length > 0) {
      filtros.tags.forEach(tagId => params.append('tags', tagId));
    }
    if (ordenacao) {
      params.append('ordenacao', ordenacao);
    }

    const queryString = params.toString();
    const url = `/api/tarefas/projeto/${projetoId}${queryString ? `?${queryString}` : ''}`;
    return apiFetch(url);
  },
  criar: (projetoId, dados) => apiFetch(`/api/tarefas/projeto/${projetoId}`, { method: 'POST', body: JSON.stringify(dados) }),
  editar: (id, dados) => apiFetch(`/api/tarefas/${id}`, { method: 'PUT', body: JSON.stringify(dados) }),
  excluir: (id) => apiFetch(`/api/tarefas/${id}`, { method: 'DELETE' }),
  alterarStatus: (id, status) => apiFetch(`/api/tarefas/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
};

// Módulo de Tags
export const tagService = {
  listar: () => apiFetch('/api/tags'),
  criar: (dados) => apiFetch('/api/tags', { method: 'POST', body: JSON.stringify(dados) }),
  editar: (id, dados) => apiFetch(`/api/tags/${id}`, { method: 'PUT', body: JSON.stringify(dados) }),
  excluir: (id) => apiFetch(`/api/tags/${id}`, { method: 'DELETE' }),
  associar: (tarefaId, tagIds) => apiFetch(`/api/tarefas/${tarefaId}/tags`, { method: 'PUT', body: JSON.stringify({ tags: tagIds }) }),
};
