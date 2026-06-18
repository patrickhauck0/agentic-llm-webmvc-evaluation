// ============================================================
// ConfirmModal — Modal de confirmação para ações destrutivas
// ============================================================

import { useEffect, useCallback } from 'react';
import Spinner from '../UI/Spinner';
import './ConfirmModal.css';

/**
 * Ícone de triângulo com exclamação (aviso) — SVG inline
 */
function IconeAviso() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

/**
 * Modal de confirmação genérico para ações destrutivas.
 *
 * @param {Object}   props
 * @param {boolean}  props.aberto       — Controla visibilidade do modal
 * @param {string}   props.titulo       — Título exibido no cabeçalho
 * @param {string}   props.mensagem     — Texto descritivo da ação
 * @param {string}   [props.textoBotao='Confirmar'] — Rótulo do botão de ação
 * @param {Function} props.onConfirmar  — Callback ao confirmar a ação
 * @param {Function} props.onCancelar   — Callback ao cancelar / fechar
 * @param {boolean}  [props.carregando=false] — Exibe spinner no botão de ação
 *
 * @example
 *   <ConfirmModal
 *     aberto={mostrarModal}
 *     titulo="Excluir tarefa"
 *     mensagem="Tem certeza que deseja excluir esta tarefa? Essa ação não pode ser desfeita."
 *     textoBotao="Excluir"
 *     onConfirmar={handleExcluir}
 *     onCancelar={() => setMostrarModal(false)}
 *     carregando={excluindo}
 *   />
 */
export default function ConfirmModal({
  aberto,
  titulo,
  mensagem,
  textoBotao = 'Confirmar',
  onConfirmar,
  onCancelar,
  carregando = false,
}) {
  // Fecha com Escape
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape' && !carregando) {
        onCancelar();
      }
    },
    [onCancelar, carregando]
  );

  useEffect(() => {
    if (aberto) {
      document.addEventListener('keydown', handleKeyDown);
      // Bloqueia scroll do body
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [aberto, handleKeyDown]);

  if (!aberto) return null;

  // Fecha ao clicar no overlay (não durante carregamento)
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !carregando) {
      onCancelar();
    }
  };

  return (
    <div className="confirm-modal-overlay" onClick={handleOverlayClick} role="dialog" aria-modal="true" aria-labelledby="confirm-modal-titulo">
      <div className="confirm-modal">
        <div className="confirm-modal__icone">
          <IconeAviso />
        </div>

        <h2 className="confirm-modal__titulo" id="confirm-modal-titulo">
          {titulo}
        </h2>

        <p className="confirm-modal__mensagem">{mensagem}</p>

        <div className="confirm-modal__acoes">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancelar}
            disabled={carregando}
          >
            Cancelar
          </button>

          <button
            type="button"
            className="btn btn-danger"
            onClick={onConfirmar}
            disabled={carregando}
          >
            {carregando ? <Spinner size={16} color="var(--color-text-primary)" /> : textoBotao}
          </button>
        </div>
      </div>
    </div>
  );
}
