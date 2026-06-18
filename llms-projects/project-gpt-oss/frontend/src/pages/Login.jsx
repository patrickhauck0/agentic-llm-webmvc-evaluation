import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { ToastContext } from '../contexts/ToastContext';
import '../styles/Login.css';

function Login() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const { addToast } = useContext(ToastContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      addToast({ message: 'Login bem sucedido!', type: 'success' });
      navigate('/dashboard');
    } catch (err) {
      addToast({ message: err.message || 'Erro ao fazer login', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <form className="login-form" onSubmit={handleSubmit}>
        <h1 className="login-title">Entrar</h1>
        <label className="login-label" htmlFor="email">E-mail <span className="required">*</span></label>
        <input
          id="email"
          type="email"
          className="login-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <label className="login-label" htmlFor="password">Senha <span className="required">*</span></label>
        <input
          id="password"
          type="password"
          className="login-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="login-button" disabled={loading}>
          {loading ? <span className="spinner"></span> : 'Entrar'}
        </button>
        <p className="login-switch">
          Não tem conta? <a href="/cadastro">Cadastre-se</a>
        </p>
      </form>
    </div>
  );
}

export default Login;
