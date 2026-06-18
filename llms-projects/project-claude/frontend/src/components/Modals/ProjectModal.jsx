// ============================================================
// ProjectModal — Modal de criação e edição de projetos (RF04/RF06)
// Props: aberto, onFechar, projeto (null = criar, objeto = editar)
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { useProjects } from '../../contexts/ProjectContext';
import Spinner from '../UI/Spinner';
import './ProjectModal.css';

export default function ProjectModal({ aberto, onFechar, projeto }) {
  const { criarProjeto, editarProjeto } = useProjects();
  const editando = !!projeto;

  // ---- Estado do formulário ----
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');

  // ---- Preencher campos ao abrir em modo edição ----
  useEffect(() => {
    if (aberto) {
      if (projeto) {
        setNome(projeto.nome || '');
        setDescricao(projeto.descricao || '');
      } else {
        setNome('');
        setDescricao('');
      }
      setErro('');
    }
  }, [aberto, projeto]);

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

  // ---- Validação ----
  function validar() {
    const nomeTrimmed = nome.trim();
    if (!nomeTrimmed) {
      setErro('O nome do projeto é obrigatório.');
      return false;
    }
    if (nomeTrimmed.length < 3) {
      setErro('O nome deve ter pelo menos 3 caracteres.');
      return false;
    }
    if (nomeTrimmed.length > 100) {
      setErro('O nome deve ter no máximo 100 caracteres.');
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
      nome: nome.trim(),
      descricao: descricao.trim() || null,
    };

    try {
      let resultado;
      if (editando) {
        resultado = await editarProjeto(projeto.id_projeto, dados);
      } else {
        resultado = await criarProjeto(dados);
      }

      if (resultado.sucesso) {
        onFechar();
      }
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
      <div className="modal-card" role="dialog" aria-modal="true" aria-label={editando ? 'Editar Projeto' : 'Novo Projeto'}>
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">
            {editando ? 'Editar Projeto' : 'Novo Projeto'}
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
          {/* Nome */}
          <div className="form-group">
            <label className="form-label" htmlFor="project-nome">
              NOME <span className="required">*</span>
            </label>
            <input
              id="project-nome"
              type="text"
              className="form-input"
              placeholder="Nome do projeto"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              maxLength={100}
              autoFocus
              disabled={enviando}
            />
          </div>

          {/* Descrição */}
          <div className="form-group">
            <label className="form-label" htmlFor="project-descricao">
              DESCRIÇÃO
            </label>
            <textarea
              id="project-descricao"
              className="form-textarea"
              placeholder="Descrição do projeto (opcional)"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              rows={4}
              disabled={enviando}
            />
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
              {editando ? 'Salvar Alterações' : 'Criar Projeto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
