import React, { useContext } from 'react';
import { ToastContext } from '../../contexts/ToastContext';
import './Toast.css';

const Toast = () => {
  const { toasts } = useContext(ToastContext);

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast-message toast-${toast.tipo}`}>
          {toast.mensagem}
        </div>
      ))}
    </div>
  );
};

export default Toast;
