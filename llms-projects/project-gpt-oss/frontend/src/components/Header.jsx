import React from 'react';
import '../styles/Header.css';
import { AuthContext } from '../contexts/AuthContext';
import { useContext } from 'react';

function Header() {
  const { user } = useContext(AuthContext);
  return (
    <header className="header">
      <h1 className="header__title">Sistema de Gerenciamento de Tarefas</h1>
      {user && <span className="header__user">Olá, {user.name}</span>}
    </header>
  );
}

export default Header;
