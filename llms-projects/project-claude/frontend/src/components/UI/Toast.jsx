import { useToast } from '../../contexts/ToastContext';
import './Toast.css';

export default function Toast() {
  const { toasts, removerToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast toast--${toast.tipo}`}
          onClick={() => removerToast(toast.id)}
          role="alert"
        >
          <span className="toast__icon">
            {toast.tipo === 'sucesso' ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            )}
          </span>
          <span className="toast__message">{toast.mensagem}</span>
        </div>
      ))}
    </div>
  );
}
