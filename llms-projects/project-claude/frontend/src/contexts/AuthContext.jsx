// ============================================================
// AuthContext — Autenticação e sessão do usuário
//
// Token JWT armazenado EXCLUSIVAMENTE em memória (useState).
// Ao recarregar a página, a sessão é perdida intencionalmente.
//
// Expõe: token, usuario, autenticado, login(), logout()
// ============================================================

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, setToken, setLogoutCallback } from '../services/api';
import { useToast } from './ToastContext';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(null);
  const [usuario, setUsuario] = useState(null);
  const navigate = useNavigate();
  const { mostrarToast } = useToast();

  // Derivado: booleano de autenticação
  const autenticado = !!token;

  // ============================================================
  // Logout — limpa estado, limpa token no api.js, redireciona
  // ============================================================
  const logout = useCallback(() => {
    // Chamar API de logout (simbólico, não bloqueia a UI)
    if (token) {
      authService.logout().catch(() => {});
    }

    // Limpar estado local
    setTokenState(null);
    setUsuario(null);

    // Limpar token no serviço de API
    setToken(null);

    // Redirecionar para login
    navigate('/login', { replace: true });
  }, [token, navigate]);

  // ============================================================
  // Registrar callback de logout no api.js (para interceptor 401)
  // ============================================================
  useEffect(() => {
    setLogoutCallback(() => {
      // Quando o interceptor detectar 401, executa:
      setTokenState(null);
      setUsuario(null);
      setToken(null);
      navigate('/login', { replace: true });
      mostrarToast('Sessão expirada. Faça login novamente.', 'erro');
    });

    return () => setLogoutCallback(null);
  }, [navigate, mostrarToast]);

  // ============================================================
  // RF02 — Login
  // ============================================================
  const login = useCallback(async (email, senha) => {
    try {
      const { data } = await authService.login({ email, senha });

      // Armazenar token em memória (useState + api.js)
      setTokenState(data.token);
      setToken(data.token);

      // Armazenar dados do usuário
      setUsuario(data.usuario);

      // Redirecionar para o Dashboard
      navigate('/', { replace: true });

      return { sucesso: true };
    } catch (error) {
      const mensagem = error.response?.data?.erro || 'Erro ao fazer login';
      mostrarToast(mensagem, 'erro');
      return { sucesso: false, erro: mensagem };
    }
  }, [navigate, mostrarToast]);

  // ============================================================
  // RF01 — Registro (não faz login automático, redireciona para /login)
  // ============================================================
  const registro = useCallback(async (nome, email, senha) => {
    try {
      await authService.registro({ nome, email, senha });
      mostrarToast('Conta criada com sucesso! Faça login para continuar.', 'sucesso');
      navigate('/login', { replace: true });
      return { sucesso: true };
    } catch (error) {
      const mensagem = error.response?.data?.erro || 'Erro ao criar conta';
      mostrarToast(mensagem, 'erro');
      return { sucesso: false, erro: mensagem };
    }
  }, [navigate, mostrarToast]);

  return (
    <AuthContext.Provider
      value={{
        token,
        usuario,
        autenticado,
        login,
        registro,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook para acessar o AuthContext.
 * @returns {{ token, usuario, autenticado, login, registro, logout }}
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
