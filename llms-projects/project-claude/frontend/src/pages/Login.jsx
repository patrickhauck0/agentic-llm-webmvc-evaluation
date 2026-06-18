import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Spinner from '../components/UI/Spinner';
import './Login.css';

export default function Login() {
  const auth = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [enviando, setEnviando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);
    try {
      await auth.login(email, senha);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="login-page">
      <div className="auth-card">
        <div className="auth-logo">
          S<span className="auth-logo__accent">G</span>T
        </div>

        <h1 className="auth-heading">Bem-vindo de volta</h1>
        <p className="auth-subtitle">
          Faça login para acessar seus projetos e tarefas.
        </p>

        <div className="auth-divider" />

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">
              E-MAIL <span className="required">*</span>
            </label>
            <div className="form-input--with-icon">
              <svg
                className="form-input__icon"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="M22 4l-10 8L2 4" />
              </svg>
              <input
                type="email"
                className="form-input"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={enviando}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              SENHA <span className="required">*</span>
            </label>
            <div className="form-input--with-icon">
              <svg
                className="form-input__icon"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                disabled={enviando}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={enviando}
          >
            {enviando ? (
              <Spinner size={18} color="var(--color-text-on-accent)" />
            ) : (
              '→ Entrar'
            )}
          </button>
        </form>

        <div className="auth-footer">
          Não tem uma conta?{' '}
          <Link to="/cadastro">Cadastre-se</Link>
        </div>
      </div>
    </div>
  );
}
