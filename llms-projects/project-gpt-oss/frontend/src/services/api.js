import axios from 'axios';

// Base URL da API – ajuste conforme necessário ou use a variável de ambiente VITE_API_BASE_URL
const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

// Token armazenado em memória neste módulo
let authToken = null;

export const setAuthToken = (token) => {
  authToken = token;
};

export const clearAuthToken = () => {
  authToken = null;
};

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para inserir o token JWT em todas as requisições protegidas
api.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

// Interceptor para tratar respostas 401 (sessão expirada)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Limpar token em memória e redirecionar para login
      clearAuthToken();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
