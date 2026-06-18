import React, { useState } from 'react';
import Spinner from '../UI/Spinner';

const ConfirmModal = ({ title, message, onConfirm, onCancel }) => {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
      onCancel(); // Fecha após confirmar
    }
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-container confirm-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
        </div>
        
        <div className="modal-body">
          <p>{message}</p>
        </div>

        <div className="modal-footer">
          <button className="btn-outline" onClick={onCancel} disabled={loading}>
            Cancelar
          </button>
          <button className="btn-danger" onClick={handleConfirm} disabled={loading}>
            {loading ? <Spinner /> : 'Excluir'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
