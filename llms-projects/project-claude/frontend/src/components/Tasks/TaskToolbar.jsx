// ============================================================
// TaskToolbar — Barra de filtros, ordenação e ações de tarefas
// ============================================================

import { useState, useEffect, useRef } from 'react';
import './TaskToolbar.css';

// ---- Status options ----
const STATUS_OPTIONS = [
  { value: 'Pendente', label: 'Pendente' },
  { value: 'Em Andamento', label: 'Em Andamento' },
  { value: 'Concluída', label: 'Concluída' },
];

// ---- Ordenação options ----
const ORDENACAO_OPTIONS = [
  { ordenar: 'data_conclusao', direcao: 'asc', label: 'Data Conclusão ↑' },
  { ordenar: 'data_conclusao', direcao: 'desc', label: 'Data Conclusão ↓' },
  { ordenar: 'titulo', direcao: 'asc', label: 'Título A-Z' },
  { ordenar: 'titulo', direcao: 'desc', label: 'Título Z-A' },
];

// ---- SVG Icons ----
const FilterIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1.33 2h13.34L9.33 8.89V13.33L6.67 12V8.89L1.33 2z" />
  </svg>
);

const ChevronDown = () => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 6l4 4 4-4" />
  </svg>
);

const SortIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 2v12M4 14l-3-3M4 14l3-3M12 14V2M12 2l-3 3M12 2l3 3" />
  </svg>
);

const TagIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1.33 8.89L7.11 3.11A1.33 1.33 0 018.05 2.67H13.33A1.33 1.33 0 0114.67 4V9.28a1.33 1.33 0 01-.39.94l-5.78 5.78a1.33 1.33 0 01-1.89 0L1.33 10.78a1.33 1.33 0 010-1.89z" />
    <circle cx="11.33" cy="5.33" r="0.67" fill="currentColor" />
  </svg>
);

const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="3" x2="8" y2="13" />
    <line x1="3" y1="8" x2="13" y2="8" />
  </svg>
);

const ClearIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="4" x2="12" y2="12" />
    <line x1="12" y1="4" x2="4" y2="12" />
  </svg>
);

// ---- Dropdown genérico ----
function Dropdown({ aberto, onToggle, label, badge, children, refProp }) {
  return (
    <div className="toolbar-dropdown" ref={refProp}>
      <button
        className={`toolbar-dropdown__trigger${aberto ? ' toolbar-dropdown__trigger--active' : ''}${badge ? ' toolbar-dropdown__trigger--has-badge' : ''}`}
        onClick={onToggle}
        type="button"
      >
        <span className="toolbar-dropdown__label">{label}</span>
        {badge > 0 && <span className="toolbar-dropdown__badge">{badge}</span>}
        <ChevronDown />
      </button>
      {aberto && (
        <div className="toolbar-dropdown__menu">
          {children}
        </div>
      )}
    </div>
  );
}

/**
 * @param {Object} props
 * @param {Array<string>} props.filtroStatus - Status selecionados
 * @param {Function} props.onFiltroStatusChange - Setter para filtroStatus
 * @param {Array<number>} props.filtroTags - IDs de tags selecionadas
 * @param {Function} props.onFiltroTagsChange - Setter para filtroTags
 * @param {Object} props.ordenacao - { ordenar, direcao }
 * @param {Function} props.onOrdenacaoChange - Setter para ordenacao
 * @param {Array} props.tags - Tags do usuário
 * @param {Function} props.onNovaTarefa - Callback para nova tarefa
 * @param {Function} props.onGerenciarTags - Callback para abrir modal de tags
 */
export default function TaskToolbar({
  filtroStatus,
  onFiltroStatusChange,
  filtroTags,
  onFiltroTagsChange,
  ordenacao,
  onOrdenacaoChange,
  tags = [],
  onNovaTarefa,
  onGerenciarTags,
}) {
  const [dropdownAberto, setDropdownAberto] = useState(null);
  const statusRef = useRef(null);
  const tagsRef = useRef(null);
  const ordenacaoRef = useRef(null);

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(e) {
      if (
        statusRef.current && !statusRef.current.contains(e.target) &&
        tagsRef.current && !tagsRef.current.contains(e.target) &&
        ordenacaoRef.current && !ordenacaoRef.current.contains(e.target)
      ) {
        setDropdownAberto(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = (nome) => {
    setDropdownAberto((prev) => (prev === nome ? null : nome));
  };

  // ---- Handlers de filtro de status ----
  const handleToggleStatus = (valor) => {
    onFiltroStatusChange((prev) =>
      prev.includes(valor) ? prev.filter((s) => s !== valor) : [...prev, valor]
    );
  };

  // ---- Handlers de filtro de tags ----
  const handleToggleTag = (tagId) => {
    onFiltroTagsChange((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  // ---- Handler de ordenação ----
  const handleOrdenacao = (opt) => {
    onOrdenacaoChange({ ordenar: opt.ordenar, direcao: opt.direcao });
    setDropdownAberto(null);
  };

  // ---- Limpar filtros ----
  const temFiltrosAtivos = filtroStatus.length > 0 || filtroTags.length > 0;
  const handleLimparFiltros = () => {
    onFiltroStatusChange([]);
    onFiltroTagsChange([]);
  };

  // ---- Encontrar label de ordenação ativa ----
  const ordenacaoAtiva = ORDENACAO_OPTIONS.find(
    (o) => o.ordenar === ordenacao.ordenar && o.direcao === ordenacao.direcao
  );

  return (
    <div className="task-toolbar">
      {/* Filtros */}
      <div className="task-toolbar__filters">
        <span className="task-toolbar__label">
          <FilterIcon />
          Filtrar por
        </span>

        {/* Status */}
        <Dropdown
          aberto={dropdownAberto === 'status'}
          onToggle={() => toggleDropdown('status')}
          label="Status"
          badge={filtroStatus.length}
          refProp={statusRef}
        >
          {STATUS_OPTIONS.map((opt) => {
            const cssClass = opt.value === 'Pendente' ? 'pendente' : opt.value === 'Em Andamento' ? 'em_andamento' : 'concluida';
            return (
            <label key={opt.value} className="toolbar-dropdown__item">
              <input
                type="checkbox"
                checked={filtroStatus.includes(opt.value)}
                onChange={() => handleToggleStatus(opt.value)}
              />
              <span
                className={`toolbar-dropdown__status-dot toolbar-dropdown__status-dot--${cssClass}`}
              />
              <span>{opt.label}</span>
            </label>
            );
          })}
        </Dropdown>

        {/* Tags */}
        <Dropdown
          aberto={dropdownAberto === 'tags'}
          onToggle={() => toggleDropdown('tags')}
          label="Tags"
          badge={filtroTags.length}
          refProp={tagsRef}
        >
          {tags.length === 0 ? (
            <div className="toolbar-dropdown__empty">Nenhuma tag cadastrada</div>
          ) : (
            tags.map((tag) => (
              <label key={tag.id_tag} className="toolbar-dropdown__item">
                <input
                  type="checkbox"
                  checked={filtroTags.includes(tag.id_tag)}
                  onChange={() => handleToggleTag(tag.id_tag)}
                />
                <span>{tag.nome}</span>
              </label>
            ))
          )}
        </Dropdown>

        <div className="task-toolbar__divider" />

        <span className="task-toolbar__label">
          <SortIcon />
          Ordenar
        </span>

        {/* Ordenação */}
        <Dropdown
          aberto={dropdownAberto === 'ordenacao'}
          onToggle={() => toggleDropdown('ordenacao')}
          label={ordenacaoAtiva?.label || 'Selecionar'}
          refProp={ordenacaoRef}
        >
          {ORDENACAO_OPTIONS.map((opt) => (
            <button
              key={`${opt.ordenar}-${opt.direcao}`}
              className={`toolbar-dropdown__item toolbar-dropdown__item--button${
                ordenacao.ordenar === opt.ordenar && ordenacao.direcao === opt.direcao
                  ? ' toolbar-dropdown__item--active'
                  : ''
              }`}
              onClick={() => handleOrdenacao(opt)}
              type="button"
            >
              {opt.label}
            </button>
          ))}
        </Dropdown>
      </div>

      {/* Ações */}
      <div className="task-toolbar__actions">
        {temFiltrosAtivos && (
          <button
            className="btn-ghost task-toolbar__btn"
            onClick={handleLimparFiltros}
            type="button"
          >
            <ClearIcon />
            Limpar Filtros
          </button>
        )}

        <button
          className="btn-ghost task-toolbar__btn"
          onClick={onGerenciarTags}
          type="button"
        >
          <TagIcon />
          Gerenciar Tags
        </button>

        <button
          className="btn btn-primary btn-sm task-toolbar__btn-nova"
          onClick={onNovaTarefa}
          type="button"
        >
          <PlusIcon />
          Nova Tarefa
        </button>
      </div>
    </div>
  );
}
