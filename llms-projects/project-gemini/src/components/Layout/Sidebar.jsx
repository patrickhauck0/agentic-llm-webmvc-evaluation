import React, { useContext } from 'react';
import { ProjectContext } from '../../contexts/ProjectContext';
import './Sidebar.css';

const Sidebar = ({ isOpen, onClose, onOpenProjectModal, onOpenConfirm }) => {
  const { projetos, projetoSelecionado, setProjetoSelecionado } = useContext(ProjectContext);

  const handleSelectProject = (projeto) => {
    // Clear tasks state implicitly via Context when selecting a new project
    // Then set the selected project
    if (projetoSelecionado?.id_projeto !== projeto.id_projeto) {
      setProjetoSelecionado(projeto);
    }
    // Close sidebar on mobile
    if (window.innerWidth <= 768) {
      onClose();
    }
  };

  const handleEditClick = (e, projeto) => {
    e.stopPropagation();
    onOpenProjectModal(projeto);
  };

  const handleDeleteClick = (e, projeto) => {
    e.stopPropagation();
    onOpenConfirm({
      title: 'Excluir Projeto',
      message: `Tem certeza que deseja excluir o projeto "${projeto.nome}"? Todas as tarefas vinculadas a ele serão apagadas.`,
      onConfirm: async () => {
        // Here we rely on ProjectContext logic which we'll call indirectly, 
        // Wait, the confirm modal only takes a callback. Let's pass the ProjectContext action.
      }
    });
  };

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'show' : ''}`} onClick={onClose}></div>
      <aside className={`sidebar-container ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h1 className="logo-text">SGT</h1>
          <button className="close-sidebar btn-icon" onClick={onClose} aria-label="Fechar menu">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="sidebar-content">
          <h3 className="sidebar-title">Meus Projetos</h3>
          
          <div className="project-list">
            {projetos.map(projeto => (
              <div 
                key={projeto.id_projeto}
                className={`project-item ${projetoSelecionado?.id_projeto === projeto.id_projeto ? 'active' : ''}`}
                onClick={() => handleSelectProject(projeto)}
              >
                <span className="project-name">{projeto.nome}</span>
                <div className="project-actions">
                  <button className="action-btn edit-btn" onClick={(e) => handleEditClick(e, projeto)} title="Editar">
                    ✎
                  </button>
                  <button className="action-btn delete-btn" onClick={(e) => handleDeleteClick(e, projeto)} title="Excluir">
                    ✕
                  </button>
                </div>
              </div>
            ))}
            {projetos.length === 0 && (
              <p className="empty-projects-text">Nenhum projeto encontrado.</p>
            )}
          </div>
        </div>

        <div className="sidebar-footer">
          <button className="btn-primary btn-new-project" onClick={() => onOpenProjectModal(null)}>
            + Novo Projeto
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
