import React, { createContext, useState, useCallback } from 'react';

export const ToastContext = createContext();

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const mostrarToast = useCallback((mensagem, tipo = 'sucesso') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, mensagem, tipo }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, mostrarToast }}>
      {children}
    </ToastContext.Provider>
  );
};
