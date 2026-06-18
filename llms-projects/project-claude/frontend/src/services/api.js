// ============================================================
// SGT — Serviço de API Centralizado
//
// Instância Axios com:
//   - baseURL via proxy do Vite (/api)
//   - Interceptor de request: injeta Authorization header
//   - Interceptor de response: trata HTTP 401 (logout automático)
//   - Módulos organizados: authService, projetoService,
//     tarefaService, tagService
// ============================================================

import axios from 'axios';

// ---- Instância Axios ----
const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// ============================================================
// Gerenciamento do Token JWT (em memória)
// O AuthContext chama setToken() após login/logout.
// O interceptor de request usa getToken() para injetar o header.
// ============================================================

let _token = null;

/**
 * Define o token JWT atual (chamado pelo AuthContext).
 * @param {string|null} token
 */
export function setToken(token) {
  _token = token;
}

/**
 * Retorna o token JWT atual.
 * @returns {string|null}
 */
export function getToken() {
  return _token;
}

// ============================================================
// Callback de Logout (injetado pelo AuthContext)
// Chamado pelo interceptor de response ao receber HTTP 401.
// ============================================================

let _logoutCallback = null;

/**
 * Registra a função de logout do AuthContext.
 * @param {Function|null} callback
 */
export function setLogoutCallback(callback) {
  _logoutCallback = callback;
}

// ============================================================
// Interceptor de Request — injeta Authorization header
// ============================================================

api.interceptors.request.use(
  (config) => {
    if (_token) {
      config.headers.Authorization = `Bearer ${_token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ============================================================
// Interceptor de Response — trata HTTP 401
// ============================================================

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expirado ou inválido — acionar logout automático
      if (_logoutCallback) {
        _logoutCallback();
      }
    }
    return Promise.reject(error);
  }
);

// ============================================================
// Módulo: authService (RF01, RF02, RF03)
// ============================================================

export const authService = {
  /** RF01 — Cadastro de usuário */
  registro: (dados) => api.post('/auth/registro', dados),

  /** RF02 — Login (retorna { token, usuario }) */
  login: (dados) => api.post('/auth/login', dados),

  /** RF03 — Logout (simbólico, descarte do token é no frontend) */
  logout: () => api.post('/auth/logout'),
};

// ============================================================
// Módulo: projetoService (RF04, RF05, RF06, RF07)
// ============================================================

export const projetoService = {
  /** RF05 — Listar projetos do usuário */
  listar: () => api.get('/projetos'),

  /** RF04 — Criar projeto */
  criar: (dados) => api.post('/projetos', dados),

  /** RF06 — Editar projeto */
  editar: (id, dados) => api.put(`/projetos/${id}`, dados),

  /** RF07 — Excluir projeto (CASCADE em tarefas e tarefa_tag) */
  excluir: (id) => api.delete(`/projetos/${id}`),
};

// ============================================================
// Módulo: tarefaService (RF08, RF09, RF10, RF11, RF14)
// ============================================================

export const tarefaService = {
  /**
   * RF14 — Listar tarefas de um projeto (com filtros e ordenação)
   *
   * @param {number} projetoId
   * @param {Object} filtros - { status: string[], tags: number[], ordenar: string, direcao: string }
   */
  listar: (projetoId, filtros = {}) => {
    const params = new URLSearchParams();

    // Status — múltiplos valores (OR)
    if (filtros.status && filtros.status.length > 0) {
      filtros.status.forEach((s) => params.append('status', s));
    }

    // Tags — múltiplos IDs (AND lógico estrito)
    if (filtros.tags && filtros.tags.length > 0) {
      filtros.tags.forEach((t) => params.append('tags', t));
    }

    // Ordenação
    if (filtros.ordenar) {
      params.append('ordenar', filtros.ordenar);
    }
    if (filtros.direcao) {
      params.append('direcao', filtros.direcao);
    }

    const query = params.toString();
    return api.get(`/projetos/${projetoId}/tarefas${query ? `?${query}` : ''}`);
  },

  /** RF08 — Criar tarefa em um projeto */
  criar: (projetoId, dados) => api.post(`/projetos/${projetoId}/tarefas`, dados),

  /** RF09 — Editar tarefa */
  editar: (id, dados) => api.put(`/tarefas/${id}`, dados),

  /** RF10 — Excluir tarefa */
  excluir: (id) => api.delete(`/tarefas/${id}`),

  /** RF11 — Alterar status da tarefa */
  alterarStatus: (id, status) => api.patch(`/tarefas/${id}/status`, { status }),
};

// ============================================================
// Módulo: tagService (RF12, RF13)
// ============================================================

export const tagService = {
  /** RF12 — Listar tags do usuário */
  listar: () => api.get('/tags'),

  /** RF12 — Criar tag */
  criar: (dados) => api.post('/tags', dados),

  /** RF12 — Editar tag */
  editar: (id, dados) => api.put(`/tags/${id}`, dados),

  /** RF12 — Excluir tag */
  excluir: (id) => api.delete(`/tags/${id}`),

  /** RF13 — Associar tags a uma tarefa (sincronização completa) */
  associar: (tarefaId, tagIds) => api.put(`/tarefas/${tarefaId}/tags`, { tags: tagIds }),
};

export default api;
