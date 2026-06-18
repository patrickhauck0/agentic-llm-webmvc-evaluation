// ============================================================
// TaskModal — Modal de criação e edição de tarefas (RF08/RF09)
// Props: aberto, onFechar, tarefa, projetoId
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { useProjects } from '../../contexts/ProjectContext';
import { useTags } from '../../contexts/TagContext';
import Spinner from '../UI/Spinner';
import './TaskModal.css';
import '../Modals/ProjectModal.css'; // reutiliza estilos base do modal

export default function TaskModal({ aberto, onFechar, tarefa, projetoId }) {
  const { criarTarefa, editarTarefa } = useProjects();
  const { tags, carregarTags } = useTags();
  const editando = !!tarefa;

  // ---- Estado do formulário ----
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [dataConclusao, setDataConclusao] = useState('');
  const [tagsSelecionadas, setTagsSelecionadas] = useState([]);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');

  // ---- Carregar tags ao abrir ----
  useEffect(() => {
    if (aberto) {
      carregarTags();
    }
  }, [aberto, carregarTags]);

  // ---- Preencher campos ao abrir ----
  useEffect(() => {
    if (aberto) {
      if (tarefa) {
        setTitulo(tarefa.titulo || '');
        setDescricao(tarefa.descricao || '');
        setDataConclusao(tarefa.data_conclusao ? tarefa.data_conclusao.substring(0, 10) : '');
        // Tags associadas à tarefa
        const idsAssociadas = (tarefa.tags || []).map((t) => t.id_tag);
        setTagsSelecionadas(idsAssociadas);
      } else {
        setTitulo('');
        setDescricao('');
        setDataConclusao('');
        setTagsSelecionadas([]);
      }
      setErro('');
    }
  }, [aberto, tarefa]);

  // ---- Fechar com Escape ----
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') {
        onFechar();
      }
    },
    [onFechar]
  );

  useEffect(() => {
    if (aberto) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [aberto, handleKeyDown]);

  // ---- Toggle tag ----
  function toggleTag(idTag) {
    setTagsSelecionadas((prev) =>
      prev.includes(idTag)
        ? prev.filter((id) => id !== idTag)
        : [...prev, idTag]
    );
  }

  // ---- Validação ----
  function validar() {
    const tituloTrimmed = titulo.trim();
    if (!tituloTrimmed) {
      setErro('O título da tarefa é obrigatório.');
      return false;
    }
    if (tituloTrimmed.length < 3) {
      setErro('O título deve ter pelo menos 3 caracteres.');
      return false;
    }
    if (tituloTrimmed.length > 150) {
      setErro('O título deve ter no máximo 150 caracteres.');
      return false;
    }
    return true;
  }

  // ---- Submit ----
  async function handleSubmit(e) {
    e.preventDefault();
    setErro('');

    if (!validar()) return;

    setEnviando(true);

    const dados = {
      titulo: titulo.trim(),
      descricao: descricao.trim() || null,
      data_conclusao: dataConclusao || null,
      tags: tagsSelecionadas,
    };

    try {
      let resultado;
      if (editando) {
        resultado = await editarTarefa(tarefa.id_tarefa, dados);
      } else {
        resultado = await criarTarefa(projetoId, dados);
      }

      if (resultado.sucesso) {
        onFechar();
      }
    } catch (error) {
      // Erros já tratados pelo ProjectContext via toast
    } finally {
      setEnviando(false);
    }
  }

  // ---- Overlay click ----
  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) {
      onFechar();
    }
  }

  if (!aberto) return null;

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-card" role="dialog" aria-modal="true" aria-label={editando ? 'Editar Tarefa' : 'Nova Tarefa'}>
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">
            {editando ? 'Editar Tarefa' : 'Nova Tarefa'}
          </h2>
          <button
            type="button"
            className="modal-close"
            onClick={onFechar}
            aria-label="Fechar"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form className="modal-form" onSubmit={handleSubmit} noValidate>
          {/* Título */}
          <div className="form-group">
            <label className="form-label" htmlFor="task-titulo">
              TÍTULO <span className="required">*</span>
            </label>
            <input
              id="task-titulo"
              type="text"
              className="form-input"
              placeholder="Título da tarefa"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              maxLength={150}
              autoFocus
              disabled={enviando}
            />
          </div>

          {/* Descrição */}
          <div className="form-group">
            <label className="form-label" htmlFor="task-descricao">
              DESCRIÇÃO
            </label>
            <textarea
              id="task-descricao"
              className="form-textarea"
              placeholder="Descrição da tarefa (opcional)"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              rows={3}
              disabled={enviando}
            />
          </div>

          {/* Data de Conclusão */}
          <div className="form-group">
            <label className="form-label" htmlFor="task-data">
              DATA DE CONCLUSÃO
            </label>
            <input
              id="task-data"
              type="date"
              className="form-input"
              value={dataConclusao}
              onChange={(e) => setDataConclusao(e.target.value)}
              disabled={enviando}
            />
          </div>

          {/* Tags */}
          <div className="form-group">
            <label className="form-label">TAGS</label>
            {tags.length > 0 ? (
              <div className="task-modal__tags-grid">
                {tags.map((tag) => {
                  const marcada = tagsSelecionadas.includes(tag.id_tag);
                  return (
                    <label
                      key={tag.id_tag}
                      className={`task-modal__tag-option ${marcada ? 'task-modal__tag-option--checked' : ''}`}
                    >
                      <input
                        type="checkbox"
                        className="task-modal__tag-checkbox"
                        checked={marcada}
                        onChange={() => toggleTag(tag.id_tag)}
                        disabled={enviando}
                      />
                      {tag.nome}
                    </label>
                  );
                })}
              </div>
            ) : (
              <p className="task-modal__tags-empty">
                Nenhuma tag disponível. Crie tags no menu de gerenciamento.
              </p>
            )}
          </div>

          {/* Erro de validação */}
          {erro && (
            <p className="text-error" style={{ fontSize: 'var(--font-size-sm)' }}>
              {erro}
            </p>
          )}

          {/* Ações */}
          <div className="modal-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onFechar}
              disabled={enviando}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={enviando}
            >
              {enviando && <Spinner size={16} color="var(--color-text-on-accent)" />}
              {editando ? 'Salvar Alterações' : 'Criar Tarefa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
