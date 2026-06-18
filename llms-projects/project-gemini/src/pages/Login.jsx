import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { ToastContext } from '../contexts/ToastContext';
import Spinner from '../components/UI/Spinner';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const { mostrarToast } = useContext(ToastContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const result = await login(email, senha);
    if (result.success) {
      navigate('/dashboard');
    } else {
      mostrarToast(result.error, 'erro');
    }
    
    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <h1 className="logo-text">SGT</h1>
          <h2>Bem-vindo de volta</h2>
          <p>Faça login para acessar seus projetos e tarefas.</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label className="input-label" htmlFor="email">E-mail</label>
            <input 
              type="email" 
              id="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="seu@email.com"
              required 
            />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="senha">Senha</label>
            <input 
              type="password" 
              id="senha" 
              value={senha} 
              onChange={(e) => setSenha(e.target.value)} 
              placeholder="••••••••"
              required 
            />
          </div>

          <button type="submit" className="btn-primary login-btn" disabled={loading}>
            {loading ? <Spinner /> : 'Entrar'}
          </button>
        </form>

        <div className="login-footer">
          <span>Não tem uma conta? </span>
          <Link to="/cadastro" className="auth-link">Cadastre-se</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
