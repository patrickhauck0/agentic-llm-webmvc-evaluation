import React, { useContext, useState } from 'react';
import { ProjectContext } from '../../contexts/ProjectContext';
import { TagContext } from '../../contexts/TagContext';
import './TaskToolbar.css';

const TaskToolbar = ({ onOpenTaskModal, onOpenTagModal }) => {
  const { filtros, setFiltros, ordenacao, setOrdenacao } = useContext(ProjectContext);
  const { tags } = useContext(TagContext);
  
  const statusOptions = ['Pendente', 'Em Andamento', 'Concluída'];

  const handleStatusChange = (status) => {
    setFiltros(prev => {
      const newStatus = prev.status.includes(status)
        ? prev.status.filter(s => s !== status)
        : [...prev.status, status];
      return { ...prev, status: newStatus };
    });
  };

  const handleTagChange = (tagId) => {
    setFiltros(prev => {
      const newTags = prev.tags.includes(tagId)
        ? prev.tags.filter(t => t !== tagId)
        : [...prev.tags, tagId];
      return { ...prev, tags: newTags };
    });
  };

  const limparFiltros = () => {
    setFiltros({ status: [], tags: [] });
    setOrdenacao('data_conclusao_asc');
  };

  return (
    <div className="task-toolbar">
      <div className="toolbar-filters">
        
        {/* Dropdown customizado de Status */}
        <div className="filter-dropdown">
          <button className="dropdown-toggle btn-outline">
            Status {filtros.status.length > 0 && `(${filtros.status.length})`}
          </button>
          <div className="dropdown-menu">
            {statusOptions.map(st => (
              <label key={st} className="dropdown-item">
                <input 
                  type="checkbox" 
                  checked={filtros.status.includes(st)}
                  onChange={() => handleStatusChange(st)}
                />
                {st}
              </label>
            ))}
          </div>
        </div>

        {/* Dropdown customizado de Tags */}
        <div className="filter-dropdown">
          <button className="dropdown-toggle btn-outline">
            Tags {filtros.tags.length > 0 && `(${filtros.tags.length})`}
          </button>
          <div className="dropdown-menu">
            {tags.length === 0 ? (
              <div className="dropdown-item empty">Nenhuma tag</div>
            ) : (
              tags.map(tag => (
                <label key={tag.id_tag} className="dropdown-item">
                  <input 
                    type="checkbox" 
                    checked={filtros.tags.includes(tag.id_tag)}
                    onChange={() => handleTagChange(tag.id_tag)}
                  />
                  {tag.nome}
                </label>
              ))
            )}
          </div>
        </div>

        {/* Ordenação */}
        <div className="sort-selector">
          <select 
            value={ordenacao} 
            onChange={e => setOrdenacao(e.target.value)}
            className="btn-outline"
          >
            <option value="data_conclusao_asc">Data Conclusão (Cresc.)</option>
            <option value="data_conclusao_desc">Data Conclusão (Decresc.)</option>
            <option value="titulo_asc">Alfabética (A-Z)</option>
            <option value="titulo_desc">Alfabética (Z-A)</option>
          </select>
        </div>

        <button className="btn-outline clear-btn" onClick={limparFiltros}>
          Limpar Filtros
        </button>
      </div>

      <div className="toolbar-actions">
        <button className="btn-outline" onClick={onOpenTagModal}>
          Gerenciar Tags
        </button>
        <button className="btn-primary" onClick={() => onOpenTaskModal(null)}>
          + Nova Tarefa
        </button>
      </div>
    </div>
  );
};

export default TaskToolbar;
