import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { ToastContext } from '../contexts/ToastContext';
import '../styles/Cadastro.css';

function Cadastro() {
  const navigate = useNavigate();
  const { register } = useContext(AuthContext);
  const { addToast } = useContext(ToastContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      addToast({ message: 'Senhas não correspondem', type: 'error' });
      return;
    }
    setLoading(true);
    try {
      await register(name, email, password);
      addToast({ message: 'Cadastro realizado com sucesso!', type: 'success' });
      navigate('/login');
    } catch (err) {
      addToast({ message: err.message || 'Erro ao cadastrar', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cadastro-page">
      <form className="cadastro-form" onSubmit={handleSubmit}>
        <h1 className="cadastro-title">Cadastrar</h1>
        <label className="cadastro-label" htmlFor="name">Nome <span className="required">*</span></label>
        <input
          id="name"
          type="text"
          className="cadastro-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <label className="cadastro-label" htmlFor="email">E-mail <span className="required">*</span></label>
        <input
          id="email"
          type="email"
          className="cadastro-input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <label className="cadastro-label" htmlFor="password">Senha <span className="required">*</span></label>
        <input
          id="password"
          type="password"
          className="cadastro-input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <label className="cadastro-label" htmlFor="confirmPassword">Confirme a senha <span className="required">*</span></label>
        <input
          id="confirmPassword"
          type="password"
          className="cadastro-input"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <button type="submit" className="cadastro-button" disabled={loading}>
          {loading ? <span className="spinner"></span> : 'Cadastrar'}
        </button>
        <p className="cadastro-switch">
          Já tem conta? <a href="/login">Entrar</a>
        </p>
      </form>
    </div>
  );
}

export default Cadastro;
