import React, { useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import './Header.css';

const Header = ({ onMenuClick }) => {
  const { usuario, logout } = useContext(AuthContext);

  return (
    <header className="header-container">
      <div className="header-left">
        <button className="menu-toggle btn-icon" onClick={onMenuClick} aria-label="Abrir menu lateral">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
        <h2 className="greeting">Olá, {usuario?.nome || 'Usuário'}</h2>
      </div>
      
      <div className="header-right">
        <button onClick={logout} className="btn-outline btn-logout">
          Sair
        </button>
      </div>
    </header>
  );
};

export default Header;
