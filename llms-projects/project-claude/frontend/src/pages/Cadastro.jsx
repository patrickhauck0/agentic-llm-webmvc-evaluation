import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Spinner from '../components/UI/Spinner';
import './Cadastro.css';

function getPasswordStrength(senha) {
  if (senha.length === 0) return { level: 'none', bars: 0 };
  if (senha.length < 6) return { level: 'weak', bars: 1 };
  if (senha.length < 10) return { level: 'medium', bars: 2 };
  return { level: 'strong', bars: 3 };
}

export default function Cadastro() {
  const auth = useAuth();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [enviando, setEnviando] = useState(false);

  const strength = getPasswordStrength(senha);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);
    try {
      await auth.registro(nome, email, senha);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="login-page">
      <div className="auth-card">
        <Link to="/login" className="auth-back-link">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          Voltar ao login
        </Link>

        <div className="auth-logo">
          S<span className="auth-logo__accent">G</span>T
        </div>

        <h1 className="auth-heading">Criar sua conta</h1>
        <p className="auth-subtitle">
          Comece a organizar seus projetos e tarefas agora.
        </p>

        <div className="auth-divider" />

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">
              NOME <span className="required">*</span>
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
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <input
                type="text"
                className="form-input"
                placeholder="Seu nome completo"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                disabled={enviando}
              />
            </div>
          </div>

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
                minLength={6}
                disabled={enviando}
              />
            </div>

            {senha.length > 0 && (
              <div className="password-strength">
                {[1, 2, 3].map((bar) => (
                  <div
                    key={bar}
                    className={`password-strength__bar${
                      bar <= strength.bars
                        ? ` password-strength__bar--active ${strength.level}`
                        : ''
                    }`}
                  />
                ))}
              </div>
            )}

            <span className="form-hint">
              A senha deve conter no mínimo 6 caracteres.
            </span>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={enviando}
          >
            {enviando ? (
              <Spinner size={18} color="var(--color-text-on-accent)" />
            ) : (
              '✦ Criar Conta'
            )}
          </button>
        </form>

        <div className="auth-footer">
          Já tem uma conta?{' '}
          <Link to="/login">Faça login</Link>
        </div>
      </div>
    </div>
  );
}
