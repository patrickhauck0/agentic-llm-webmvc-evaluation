// ============================================================
// Header — Barra superior fixa do SGT
//
// Exibe:
//   - Logo "SGT" (S e T brancos, G em âmbar)
//   - Hamburger (mobile) para abrir/fechar sidebar
//   - Saudação "Olá, {nome}" + avatar circular + botão Sair
//
// Props:
//   onToggleSidebar — callback para alternar a sidebar no mobile
// ============================================================

import { useAuth } from '../../contexts/AuthContext';
import './Header.css';

export default function Header({ onToggleSidebar }) {
  const { usuario, logout } = useAuth();

  // Primeira letra do nome (uppercase) para o avatar
  const inicialNome = usuario?.nome
    ? usuario.nome.charAt(0).toUpperCase()
    : '?';

  return (
    <header className="header">
      {/* Lado esquerdo: Brand + Hamburger */}
      <div className="header__left">
        {/* Hamburger (mobile only) */}
        <button
          type="button"
          className="header__hamburger"
          onClick={onToggleSidebar}
          aria-label="Abrir menu"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        {/* Brand */}
        <div className="header__brand">
          S<span className="header__brand-accent">G</span>T
        </div>
      </div>

      {/* Lado direito: Saudação + Avatar + Sair */}
      <div className="header__right">
        <span className="header__greeting">
          Olá, {usuario?.nome || 'Usuário'}
        </span>

        <div className="header__avatar" title={usuario?.nome}>
          {inicialNome}
        </div>

        <button
          type="button"
          className="header__logout"
          onClick={logout}
        >
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
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Sair
        </button>
      </div>
    </header>
  );
}
