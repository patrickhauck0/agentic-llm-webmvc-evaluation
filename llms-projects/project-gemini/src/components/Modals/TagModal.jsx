import React, { useState, useContext } from 'react';
import { TagContext } from '../../contexts/TagContext';
import { ToastContext } from '../../contexts/ToastContext';
import Spinner from '../UI/Spinner';
import './TagModal.css';

const TagModal = ({ onClose, onOpenConfirm }) => {
  const [novaTag, setNovaTag] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editNome, setEditNome] = useState('');

  const { tags, criarTag, editarTag, excluirTag } = useContext(TagContext);
  const { mostrarToast } = useContext(ToastContext);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!novaTag.trim()) return;
    
    setLoading(true);
    try {
      await criarTag(novaTag.trim());
      setNovaTag('');
      mostrarToast('Tag criada!', 'sucesso');
    } catch (error) {
      mostrarToast(error.message || 'Erro ao criar tag', 'erro');
    } finally {
      setLoading(false);
    }
  };

  const handleStartEdit = (tag) => {
    setEditingId(tag.id_tag);
    setEditNome(tag.nome);
  };

  const handleSaveEdit = async (id) => {
    if (!editNome.trim()) return;
    try {
      await editarTag(id, editNome.trim());
      setEditingId(null);
    } catch (error) {
      mostrarToast(error.message || 'Erro ao editar tag', 'erro');
    }
  };

  const handleDelete = (tag) => {
    onOpenConfirm({
      title: 'Excluir Tag',
      message: `Tem certeza que deseja excluir a tag "${tag.nome}"? Ela será removida de todas as tarefas.`,
      onConfirm: async () => {
        try {
          await excluirTag(tag.id_tag);
          mostrarToast('Tag excluída!', 'sucesso');
        } catch (error) {
          mostrarToast(error.message || 'Erro ao excluir tag', 'erro');
        }
      }
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container tag-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Gerenciar Tags</h3>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <form onSubmit={handleCreate} className="create-tag-form">
            <input 
              type="text" 
              value={novaTag}
              onChange={e => setNovaTag(e.target.value)}
              placeholder="Nome da nova tag..."
              maxLength="20"
              required
            />
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? <Spinner /> : 'Criar Tag'}
            </button>
          </form>

          <div className="tag-list-container">
            {tags.length === 0 ? (
              <p className="empty-projects-text">Você ainda não criou nenhuma tag.</p>
            ) : (
              <ul className="tag-list">
                {tags.map(tag => (
                  <li key={tag.id_tag} className="tag-list-item">
                    {editingId === tag.id_tag ? (
                      <div className="tag-edit-mode">
                        <input 
                          type="text"
                          value={editNome}
                          onChange={e => setEditNome(e.target.value)}
                          maxLength="20"
                          autoFocus
                        />
                        <button className="btn-primary btn-sm" onClick={() => handleSaveEdit(tag.id_tag)}>Salvar</button>
                        <button className="btn-outline btn-sm" onClick={() => setEditingId(null)}>Cancelar</button>
                      </div>
                    ) : (
                      <>
                        <span className="tag-name">{tag.nome}</span>
                        <div className="tag-actions">
                          <button className="btn-icon edit-btn" onClick={() => handleStartEdit(tag)}>✎</button>
                          <button className="btn-icon delete-btn" onClick={() => handleDelete(tag)}>✕</button>
                        </div>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TagModal;
