import React, { useContext } from 'react';
import { ProjectContext } from '../../contexts/ProjectContext';
import TaskToolbar from './TaskToolbar';
import TaskCard from './TaskCard';
import './TaskList.css';

const TaskList = ({ onOpenTaskModal, onOpenTagModal, onOpenConfirm }) => {
  const { projetoSelecionado, projetos, tarefas, filtros } = useContext(ProjectContext);

  if (projetos.length === 0 || !projetoSelecionado) {
    return (
      <div className="empty-state-container">
        <p className="empty-state-text">Você ainda não possui projetos. Crie um projeto no menu lateral.</p>
      </div>
    );
  }

  const isFiltroAtivo = filtros.status.length > 0 || filtros.tags.length > 0;

  return (
    <div className="task-list-container">
      <div className="task-list-header">
        <h2>{projetoSelecionado.nome}</h2>
      </div>

      <TaskToolbar 
        onOpenTaskModal={onOpenTaskModal} 
        onOpenTagModal={onOpenTagModal} 
      />

      <div className="tasks-grid">
        {tarefas.length > 0 ? (
          tarefas.map(tarefa => (
            <TaskCard 
              key={tarefa.id_tarefa} 
              tarefa={tarefa} 
              onEdit={() => onOpenTaskModal(tarefa)}
              onDelete={() => onOpenConfirm({
                title: 'Excluir Tarefa',
                message: `Tem certeza que deseja excluir a tarefa "${tarefa.titulo}"?`,
                onConfirm: async () => {
                  // The actual deletion logic is handled by the ProjectContext
                  // We'll import it directly in TaskCard or pass a callback
                  // Wait, ConfirmModal just calls onConfirm. We'll pass it from TaskCard.
                } // Will be overridden in TaskCard
              })}
            />
          ))
        ) : (
          <div className="empty-state-container full-width">
            {isFiltroAtivo ? (
              <p className="empty-state-text">Nenhuma tarefa encontrada para os filtros selecionados.</p>
            ) : (
              <p className="empty-state-text">Nenhuma tarefa cadastrada neste projeto.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskList;
