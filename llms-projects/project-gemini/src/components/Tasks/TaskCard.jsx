import React, { useContext } from 'react';
import { ProjectContext } from '../../contexts/ProjectContext';
import { ToastContext } from '../../contexts/ToastContext';
import './TaskCard.css';

const STATUS_SEQUENCE = ['Pendente', 'Em Andamento', 'Concluída'];

const TaskCard = ({ tarefa, onEdit, onDelete }) => {
  const { alterarStatusTarefa } = useContext(ProjectContext);
  const { mostrarToast } = useContext(ToastContext);

  const getStatusColorClass = (status) => {
    switch (status) {
      case 'Concluída': return 'status-concluida'; // Verde
      case 'Em Andamento': return 'status-andamento'; // Azul
      case 'Pendente':
      default: return 'status-pendente'; // Cinza
    }
  };

  const handleStatusClick = async (e) => {
    e.stopPropagation();
    
    const currentIndex = STATUS_SEQUENCE.indexOf(tarefa.status);
    let nextIndex;

    // Se shiftKey estiver pressionado, retrocede. Se não, avança.
    if (e.shiftKey || e.type === 'contextmenu') {
      e.preventDefault(); // Previne o menu de contexto nativo se for click direito
      nextIndex = currentIndex - 1;
    } else {
      nextIndex = currentIndex + 1;
    }

    if (nextIndex >= 0 && nextIndex < STATUS_SEQUENCE.length) {
      try {
        await alterarStatusTarefa(tarefa.id_tarefa, STATUS_SEQUENCE[nextIndex]);
      } catch (error) {
        mostrarToast(error.message || 'Erro ao alterar status', 'erro');
      }
    } else {
      // Tentar transição inválida fora dos limites (ex: Concluída -> avançar)
      // Feedback opcional. O RF11 diz que a API retorna HTTP 400. 
      // Se não enviarmos, já bloqueamos no frontend também.
    }
  };

  // Verificar se está atrasada
  const isAtrasada = () => {
    if (!tarefa.data_conclusao || tarefa.status === 'Concluída') return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // data_conclusao usually comes as "YYYY-MM-DD" or ISO string
    const dueDate = new Date(tarefa.data_conclusao);
    return dueDate < today;
  };

  return (
    <div className="task-card">
      <div className="task-card-header">
        <div 
          className={`status-indicator ${getStatusColorClass(tarefa.status)}`}
          onClick={handleStatusClick}
          onContextMenu={handleStatusClick}
          title="Clique para avançar, Shift+Clique para retroceder"
        ></div>
        
        <div className="task-card-actions">
          <button className="btn-icon edit-btn" onClick={onEdit} title="Editar">✎</button>
          <button className="btn-icon delete-btn" onClick={onDelete} title="Excluir">✕</button>
        </div>
      </div>

      <h4 className="task-title">{tarefa.titulo}</h4>
      
      {tarefa.descricao && (
        <p className="task-desc">{tarefa.descricao}</p>
      )}

      <div className="task-card-footer">
        {tarefa.data_conclusao && (
          <div className={`task-date ${isAtrasada() ? 'date-overdue' : ''}`}>
            📅 {new Date(tarefa.data_conclusao).toLocaleDateString('pt-BR')}
          </div>
        )}
        
        {tarefa.tags && tarefa.tags.length > 0 && (
          <div className="task-tags">
            {tarefa.tags.map(tag => (
              <span key={tag.id_tag} className="tag-badge">{tag.nome}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
