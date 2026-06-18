import React, { createContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { setAuthToken, clearAuthToken } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [usuario, setUsuario] = useState(null);
  const navigate = useNavigate();

  const login = async (email, senha) => {
    const response = await api.post('/api/auth/login', { email, senha });
    const jwt = response.data.token;
    setToken(jwt);
    setUsuario(response.data.usuario);
    setAuthToken(jwt);
    navigate('/dashboard');
  };

  const register = async (nome, email, senha) => {
    await api.post('/api/auth/registro', { nome, email, senha });
    await login(email, senha);
  };

  const logout = async () => {
    try {
      await api.post('/api/auth/logout');
    } finally {
      setToken(null);
      setUsuario(null);
      clearAuthToken();
      navigate('/login');
    }
  };

  return (
    <AuthContext.Provider value={{ token, usuario, login, register, logout, setToken, setUsuario }}>
      {children}
    </AuthContext.Provider>
  );
};
