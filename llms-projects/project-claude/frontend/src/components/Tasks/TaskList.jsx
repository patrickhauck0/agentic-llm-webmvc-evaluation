// ============================================================
// TaskList — Toolbar (filtros/ações) + lista de TaskCards
// ============================================================

import { useState, useEffect, useRef, useCallback } from 'react';
import { useProjects } from '../../contexts/ProjectContext';
import { useTags } from '../../contexts/TagContext';
import TaskCard from './TaskCard';
import Spinner from '../UI/Spinner';
import './TaskList.css';

// Mapeamento de status → classe CSS
const STATUS_CSS_MAP = {
  'Pendente': 'pendente',
  'Em Andamento': 'em-andamento',
  'Concluída': 'concluida',
};

const STATUS_OPTIONS = ['Pendente', 'Em Andamento', 'Concluída'];

const ORDENACAO_OPTIONS = [
  { valor: 'data_conclusao_asc', label: 'Data de Conclusão ↑' },
  { valor: 'data_conclusao_desc', label: 'Data de Conclusão ↓' },
  { valor: 'titulo_asc', label: 'Título A-Z' },
  { valor: 'titulo_desc', label: 'Título Z-A' },
];

export default function TaskList({ onNovaTarefa, onEditarTarefa, onExcluirTarefa, onGerenciarTags }) {
  const {
    tarefas,
    carregandoTarefas,
    filtros,
    setFiltros,
    ordenacao,
    setOrdenacao,
    alterarStatusTarefa,
    projetoSelecionado,
  } = useProjects();

  const { tags } = useTags();

  // Qual dropdown está aberto: null | 'status' | 'tags' | 'ordenacao'
  const [dropdownAberto, setDropdownAberto] = useState(null);
  const toolbarRef = useRef(null);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(e) {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target)) {
        setDropdownAberto(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ---- Handlers de filtros ----
  const toggleDropdown = useCallback((nome) => {
    setDropdownAberto((prev) => (prev === nome ? null : nome));
  }, []);

  const toggleStatusFiltro = useCallback((status) => {
    setFiltros((prev) => {
      const atual = prev.status;
      const novo = atual.includes(status)
        ? atual.filter((s) => s !== status)
        : [...atual, status];
      return { ...prev, status: novo };
    });
  }, [setFiltros]);

  const toggleTagFiltro = useCallback((idTag) => {
    setFiltros((prev) => {
      const atual = prev.tags;
      const novo = atual.includes(idTag)
        ? atual.filter((t) => t !== idTag)
        : [...atual, idTag];
      return { ...prev, tags: novo };
    });
  }, [setFiltros]);

  const handleOrdenacao = useCallback((valor) => {
    setOrdenacao(valor);
    setDropdownAberto(null);
  }, [setOrdenacao]);

  const limparFiltros = useCallback(() => {
    setFiltros({ status: [], tags: [] });
    setOrdenacao('data_conclusao_asc');
  }, [setFiltros, setOrdenacao]);

  // Verificar se há filtros ativos
  const filtrosAtivos = filtros.status.length > 0 || filtros.tags.length > 0;
  const totalFiltrosAtivos = filtros.status.length + filtros.tags.length;

  return (
    <div className="task-list-container">
      {/* ---- Toolbar ---- */}
      <div className="task-toolbar" ref={toolbarRef}>
        <div className="task-toolbar__filters">
          {/* Filtro por Status */}
          <div className="toolbar-dropdown">
            <button
              className={`btn btn-ghost toolbar-dropdown__toggle ${filtros.status.length > 0 ? 'toolbar-dropdown__toggle--active' : ''}`}
              onClick={() => toggleDropdown('status')}
              type="button"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
              </svg>
              Status
              {filtros.status.length > 0 && (
                <span className="toolbar-dropdown__badge">{filtros.status.length}</span>
              )}
            </button>
            {dropdownAberto === 'status' && (
              <div className="toolbar-dropdown__panel">
                {STATUS_OPTIONS.map((status) => (
                  <label key={status} className="toolbar-dropdown__item">
                    <input
                      type="checkbox"
                      checked={filtros.status.includes(status)}
                      onChange={() => toggleStatusFiltro(status)}
                    />
                    <span className={`toolbar-dropdown__status-dot toolbar-dropdown__status-dot--${STATUS_CSS_MAP[status]}`} />
                    {status}
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Filtro por Tags */}
          <div className="toolbar-dropdown">
            <button
              className={`btn btn-ghost toolbar-dropdown__toggle ${filtros.tags.length > 0 ? 'toolbar-dropdown__toggle--active' : ''}`}
              onClick={() => toggleDropdown('tags')}
              type="button"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
                <line x1="7" y1="7" x2="7.01" y2="7" />
              </svg>
              Tags
              {filtros.tags.length > 0 && (
                <span className="toolbar-dropdown__badge">{filtros.tags.length}</span>
              )}
            </button>
            {dropdownAberto === 'tags' && (
              <div className="toolbar-dropdown__panel">
                {tags.length === 0 ? (
                  <div className="toolbar-dropdown__item toolbar-dropdown__item--empty">
                    Nenhuma tag cadastrada
                  </div>
                ) : (
                  tags.map((tag) => (
                    <label key={tag.id_tag} className="toolbar-dropdown__item">
                      <input
                        type="checkbox"
                        checked={filtros.tags.includes(tag.id_tag)}
                        onChange={() => toggleTagFiltro(tag.id_tag)}
                      />
                      {tag.nome}
                    </label>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Ordenação */}
          <div className="toolbar-dropdown">
            <button
              className="btn btn-ghost toolbar-dropdown__toggle"
              onClick={() => toggleDropdown('ordenacao')}
              type="button"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <polyline points="19 12 12 19 5 12" />
              </svg>
              Ordenação
            </button>
            {dropdownAberto === 'ordenacao' && (
              <div className="toolbar-dropdown__panel">
                {ORDENACAO_OPTIONS.map((opcao) => (
                  <div
                    key={opcao.valor}
                    className={`toolbar-dropdown__item ${ordenacao === opcao.valor ? 'toolbar-dropdown__item--active' : ''}`}
                    onClick={() => handleOrdenacao(opcao.valor)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && handleOrdenacao(opcao.valor)}
                  >
                    <span className="toolbar-dropdown__radio">
                      {ordenacao === opcao.valor && (
                        <span className="toolbar-dropdown__radio-dot" />
                      )}
                    </span>
                    {opcao.label}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Limpar Filtros */}
          {filtrosAtivos && (
            <button className="btn btn-ghost" onClick={limparFiltros} type="button">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
              Limpar Filtros
            </button>
          )}
        </div>

        <div className="task-toolbar__separator" />

        <div className="task-toolbar__actions">
          <button className="btn btn-ghost" onClick={onGerenciarTags} type="button">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
              <line x1="7" y1="7" x2="7.01" y2="7" />
            </svg>
            Gerenciar Tags
          </button>
          <button className="btn btn-primary btn-sm" onClick={onNovaTarefa} type="button">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Nova Tarefa
          </button>
        </div>
      </div>

      {/* ---- Lista de Tarefas ---- */}
      {carregandoTarefas ? (
        <div className="task-list__spinner">
          <Spinner size={32} />
        </div>
      ) : tarefas.length === 0 ? (
        <div className="task-list__empty">
          {filtrosAtivos ? (
            <>
              <div className="task-list__empty-icon">🔍</div>
              <p className="task-list__empty-title">Nenhuma tarefa encontrada</p>
              <p className="task-list__empty-text">
                Nenhuma tarefa encontrada para os filtros selecionados.
              </p>
            </>
          ) : (
            <>
              <div className="task-list__empty-icon">📋</div>
              <p className="task-list__empty-title">Nenhuma tarefa cadastrada</p>
              <p className="task-list__empty-text">
                Nenhuma tarefa cadastrada neste projeto.
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="task-list">
          {tarefas.map((tarefa) => (
            <TaskCard
              key={tarefa.id_tarefa}
              tarefa={tarefa}
              onEditar={() => onEditarTarefa(tarefa)}
              onExcluir={() => onExcluirTarefa(tarefa)}
              onAlterarStatus={alterarStatusTarefa}
            />
          ))}
        </div>
      )}
    </div>
  );
}
