// ============================================================
// ToastContext — Fila de notificações globais (sucesso/erro)
//
// Estado: toasts (array de { id, mensagem, tipo })
// Função exposta: mostrarToast(mensagem, tipo)
// Auto-remoção após 3 segundos via setTimeout.
// ============================================================

import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

let _toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  /**
   * Adiciona um toast à fila. Auto-remove após 3 segundos.
   * @param {string} mensagem - Texto da notificação
   * @param {'sucesso'|'erro'} tipo - Tipo de notificação
   */
  const mostrarToast = useCallback((mensagem, tipo = 'sucesso') => {
    const id = ++_toastId;

    setToasts((prev) => [...prev, { id, mensagem, tipo }]);

    // Auto-remoção após 3 segundos
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  /**
   * Remove um toast manualmente (ex: click para fechar).
   * @param {number} id
   */
  const removerToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, mostrarToast, removerToast }}>
      {children}
    </ToastContext.Provider>
  );
}

/**
 * Hook para acessar o ToastContext.
 * @returns {{ toasts: Array, mostrarToast: Function, removerToast: Function }}
 */
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast deve ser usado dentro de um ToastProvider');
  }
  return context;
}
