import React, { createContext, useState, useEffect } from 'react';
import { authService, setApiToken, setLogoutCallback } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [usuario, setUsuario] = useState(null);

  const logout = () => {
    setToken(null);
    setUsuario(null);
    setApiToken(null);
  };

  useEffect(() => {
    // Registra o callback no interceptor da API para efetuar logout caso haja 401
    setLogoutCallback(logout);
  }, []);

  const login = async (email, senha) => {
    try {
      const { token: novoToken, usuario: dadosUsuario } = await authService.login({ email, senha });
      setToken(novoToken);
      setUsuario(dadosUsuario);
      setApiToken(novoToken);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message || 'Erro no login' };
    }
  };

  return (
    <AuthContext.Provider value={{ token, usuario, login, logout, autenticado: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};
