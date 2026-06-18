import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import { ToastContext } from '../contexts/ToastContext';
import Spinner from '../components/UI/Spinner';
import './Cadastro.css'; // Reusing similar styles to Login, or we can use Login.css if preferred, but keeping separate as asked

const Cadastro = () => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { mostrarToast } = useContext(ToastContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await authService.registro({ nome, email, senha });
      mostrarToast('Cadastro realizado com sucesso!', 'sucesso');
      navigate('/login');
    } catch (error) {
      mostrarToast(error.message || 'Erro ao realizar cadastro', 'erro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <h1 className="logo-text">SGT</h1>
          <h2>Criar sua conta</h2>
          <p>Preencha os dados abaixo para se cadastrar.</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label className="input-label" htmlFor="nome">
              Nome <span className="required-star">*</span>
            </label>
            <input 
              type="text" 
              id="nome" 
              value={nome} 
              onChange={(e) => setNome(e.target.value)} 
              placeholder="Seu nome completo"
              required 
            />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="email">
              E-mail <span className="required-star">*</span>
            </label>
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
            <label className="input-label" htmlFor="senha">
              Senha <span className="required-star">*</span>
            </label>
            <input 
              type="password" 
              id="senha" 
              value={senha} 
              onChange={(e) => setSenha(e.target.value)} 
              placeholder="Mínimo 6 caracteres"
              required 
              minLength="6"
            />
          </div>

          <button type="submit" className="btn-primary login-btn" disabled={loading}>
            {loading ? <Spinner /> : 'Cadastrar'}
          </button>
        </form>

        <div className="login-footer">
          <span>Já tem uma conta? </span>
          <Link to="/login" className="auth-link">Entrar</Link>
        </div>
      </div>
    </div>
  );
};

export default Cadastro;
