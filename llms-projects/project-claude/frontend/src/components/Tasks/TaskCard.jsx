// ============================================================
// TaskCard — Card individual de tarefa
// ============================================================

import './TaskCard.css';

// Mapeamento de status → classe CSS
const STATUS_CSS_MAP = {
  'Pendente': 'pendente',
  'Em Andamento': 'em-andamento',
  'Concluída': 'concluida',
};

// Mapeamento de próximo status (click)
const STATUS_NEXT = {
  'Pendente': 'Em Andamento',
  'Em Andamento': 'Concluída',
  'Concluída': 'Concluída',
};

// Mapeamento de status anterior (shift+click)
const STATUS_PREV = {
  'Concluída': 'Em Andamento',
  'Em Andamento': 'Pendente',
  'Pendente': 'Pendente',
};

/**
 * Formata uma data ISO para dd/mm/yyyy
 */
function formatarData(dataStr) {
  if (!dataStr) return null;
  const data = new Date(dataStr);
  if (isNaN(data.getTime())) return null;
  const dia = String(data.getUTCDate()).padStart(2, '0');
  const mes = String(data.getUTCMonth() + 1).padStart(2, '0');
  const ano = data.getUTCFullYear();
  return `${dia}/${mes}/${ano}`;
}

/**
 * Verifica se a data está antes de hoje (sem hora)
 */
function estaAtrasada(dataStr) {
  if (!dataStr) return false;
  const data = new Date(dataStr);
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  data.setHours(0, 0, 0, 0);
  return data < hoje;
}

export default function TaskCard({ tarefa, onEditar, onExcluir, onAlterarStatus }) {
  const { id_tarefa, titulo, status, data_conclusao, tags } = tarefa;
  const statusCss = STATUS_CSS_MAP[status] || 'pendente';
  const concluida = status === 'Concluída';
  const dataFormatada = formatarData(data_conclusao);
  const atrasada = !concluida && estaAtrasada(data_conclusao);

  const handleStatusClick = (e) => {
    const novoStatus = e.shiftKey ? STATUS_PREV[status] : STATUS_NEXT[status];
    if (novoStatus !== status) {
      onAlterarStatus(id_tarefa, novoStatus);
    }
  };

  return (
    <div className={`task-card ${concluida ? 'task-card--concluida' : ''}`}>
      {/* Indicador de status */}
      <button
        className={`task-card__status task-card__status--${statusCss}`}
        onClick={handleStatusClick}
        title={`Status: ${status}. Clique para avançar, Shift+clique para voltar.`}
        type="button"
        aria-label={`Alterar status de ${titulo}`}
      >
        {concluida && (
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </button>

      {/* Conteúdo */}
      <div className="task-card__content">
        <p className={`task-card__title ${concluida ? 'task-card__title--concluida' : ''}`}>
          {titulo}
        </p>

        <div className="task-card__meta">
          {dataFormatada && (
            <span className={`task-card__date ${atrasada ? 'task-card__date--overdue' : ''}`}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              {dataFormatada}
            </span>
          )}

          {tags && tags.length > 0 && (
            <div className="task-card__tags">
              {tags.map((tag) => (
                <span key={tag.id_tag} className="task-card__tag">
                  {tag.nome}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Ações */}
      <div className="task-card__actions">
        <button
          className="btn-icon"
          onClick={onEditar}
          title="Editar tarefa"
          type="button"
          aria-label="Editar tarefa"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>
        <button
          className="btn-icon btn-icon--danger"
          onClick={onExcluir}
          title="Excluir tarefa"
          type="button"
          aria-label="Excluir tarefa"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
            <line x1="10" y1="11" x2="10" y2="17" />
            <line x1="14" y1="11" x2="14" y2="17" />
          </svg>
        </button>
      </div>
    </div>
  );
}
