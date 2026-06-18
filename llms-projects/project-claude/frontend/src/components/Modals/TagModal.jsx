// ============================================================
// TagModal — Modal de gerenciamento de tags (RF12)
// Props: aberto, onFechar
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { useTags } from '../../contexts/TagContext';
import ConfirmModal from './ConfirmModal';
import Spinner from '../UI/Spinner';
import './TagModal.css';
import '../Modals/ProjectModal.css'; // reutiliza estilos base do modal

export default function TagModal({ aberto, onFechar }) {
  const { tags, carregandoTags, carregarTags, criarTag, editarTag, excluirTag } = useTags();

  // ---- Estado de criação ----
  const [novaTag, setNovaTag] = useState('');
  const [criando, setCriando] = useState(false);

  // ---- Estado de edição inline ----
  const [editandoId, setEditandoId] = useState(null);
  const [editandoNome, setEditandoNome] = useState('');

  // ---- Estado de exclusão ----
  const [excluindoTag, setExcluindoTag] = useState(null);
  const [processandoExclusao, setProcessandoExclusao] = useState(false);

  // ---- Carregar tags ao abrir ----
  useEffect(() => {
    if (aberto) {
      carregarTags();
      setNovaTag('');
      setEditandoId(null);
      setEditandoNome('');
      setExcluindoTag(null);
    }
  }, [aberto, carregarTags]);

  // ---- Fechar com Escape ----
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') {
        if (editandoId) {
          setEditandoId(null);
          setEditandoNome('');
        } else if (!excluindoTag) {
          onFechar();
        }
      }
    },
    [onFechar, editandoId, excluindoTag]
  );

  useEffect(() => {
    if (aberto) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [aberto, handleKeyDown]);

  // ---- Criar tag ----
  async function handleCriar() {
    const nome = novaTag.trim();
    if (!nome || nome.length > 20) return;

    setCriando(true);
    const resultado = await criarTag(nome);
    if (resultado.sucesso) {
      setNovaTag('');
    }
    setCriando(false);
  }

  function handleCriarKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCriar();
    }
  }

  // ---- Iniciar edição inline ----
  function iniciarEdicao(tag) {
    setEditandoId(tag.id_tag);
    setEditandoNome(tag.nome);
  }

  // ---- Salvar edição ----
  async function salvarEdicao() {
    const nome = editandoNome.trim();
    if (!nome || nome.length > 20) return;

    const resultado = await editarTag(editandoId, nome);
    if (resultado.sucesso) {
      setEditandoId(null);
      setEditandoNome('');
    }
  }

  function handleEditarKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      salvarEdicao();
    }
    if (e.key === 'Escape') {
      setEditandoId(null);
      setEditandoNome('');
    }
  }

  // ---- Cancelar edição ----
  function cancelarEdicao() {
    setEditandoId(null);
    setEditandoNome('');
  }

  // ---- Confirmar exclusão ----
  async function confirmarExclusao() {
    if (!excluindoTag) return;

    setProcessandoExclusao(true);
    await excluirTag(excluindoTag.id_tag);
    setProcessandoExclusao(false);
    setExcluindoTag(null);
  }

  // ---- Overlay click ----
  function handleOverlayClick(e) {
    if (e.target === e.currentTarget) {
      onFechar();
    }
  }

  if (!aberto) return null;

  return (
    <>
      <div className="modal-overlay" onClick={handleOverlayClick}>
        <div className="modal-card" role="dialog" aria-modal="true" aria-label="Gerenciar Tags">
          {/* Header */}
          <div className="modal-header">
            <h2 className="modal-title">Gerenciar Tags</h2>
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

          {/* Criar nova tag */}
          <div className="tag-modal__add-row">
            <input
              type="text"
              className="form-input"
              placeholder="Nome da nova tag"
              value={novaTag}
              onChange={(e) => setNovaTag(e.target.value)}
              onKeyDown={handleCriarKeyDown}
              maxLength={20}
              disabled={criando}
            />
            <button
              type="button"
              className="tag-modal__add-btn"
              onClick={handleCriar}
              disabled={criando || !novaTag.trim()}
            >
              {criando ? (
                <Spinner size={14} color="var(--color-text-on-accent)" />
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Criar
                </>
              )}
            </button>
          </div>

          {/* Lista de tags */}
          {carregandoTags ? (
            <div className="tag-modal__loading">
              <Spinner size={24} color="var(--color-accent)" />
            </div>
          ) : tags.length === 0 ? (
            <div className="tag-modal__empty">
              Nenhuma tag cadastrada.<br />
              Crie sua primeira tag acima.
            </div>
          ) : (
            <div className="tag-modal__list">
              {tags.map((tag) => (
                <div key={tag.id_tag} className="tag-modal__item">
                  {editandoId === tag.id_tag ? (
                    /* ---- Modo edição inline ---- */
                    <div className="tag-modal__edit-row">
                      <input
                        type="text"
                        className="tag-modal__edit-input"
                        value={editandoNome}
                        onChange={(e) => setEditandoNome(e.target.value)}
                        onKeyDown={handleEditarKeyDown}
                        maxLength={20}
                        autoFocus
                      />
                      <button
                        type="button"
                        className="tag-modal__edit-save"
                        onClick={salvarEdicao}
                        disabled={!editandoNome.trim()}
                        aria-label="Salvar"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        className="tag-modal__edit-cancel"
                        onClick={cancelarEdicao}
                        aria-label="Cancelar edição"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    /* ---- Modo exibição normal ---- */
                    <>
                      <span className="tag-modal__item-name">{tag.nome}</span>
                      <div className="tag-modal__item-actions">
                        <button
                          type="button"
                          className="tag-modal__action-btn"
                          onClick={() => iniciarEdicao(tag)}
                          aria-label={`Editar tag ${tag.nome}`}
                        >
                          {/* Pencil icon */}
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          className="tag-modal__action-btn tag-modal__action-btn--danger"
                          onClick={() => setExcluindoTag(tag)}
                          aria-label={`Excluir tag ${tag.nome}`}
                        >
                          {/* Trash icon */}
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de confirmação de exclusão */}
      <ConfirmModal
        aberto={!!excluindoTag}
        titulo="Excluir Tag"
        mensagem={`Tem certeza que deseja excluir a tag "${excluindoTag?.nome}"? Ela será removida de todas as tarefas associadas.`}
        textoBotao="Excluir"
        variante="danger"
        carregando={processandoExclusao}
        onConfirmar={confirmarExclusao}
        onCancelar={() => setExcluindoTag(null)}
      />
    </>
  );
}
