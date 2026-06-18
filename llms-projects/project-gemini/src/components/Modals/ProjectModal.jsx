import React, { useState, useContext, useEffect } from 'react';
import { ProjectContext } from '../../contexts/ProjectContext';
import { ToastContext } from '../../contexts/ToastContext';
import Spinner from '../UI/Spinner';
import './ConfirmModal.css'; // Reusing standard modal styles, let's create a specific one or generic

const ProjectModal = ({ onClose, projectToEdit }) => {
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [loading, setLoading] = useState(false);

  const { criarProjeto, editarProjeto } = useContext(ProjectContext);
  const { mostrarToast } = useContext(ToastContext);

  useEffect(() => {
    if (projectToEdit) {
      setNome(projectToEdit.nome);
      setDescricao(projectToEdit.descricao || '');
    }
  }, [projectToEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (projectToEdit) {
        await editarProjeto(projectToEdit.id_projeto, { nome, descricao });
        mostrarToast('Projeto atualizado com sucesso!', 'sucesso');
      } else {
        await criarProjeto({ nome, descricao });
        mostrarToast('Projeto criado com sucesso!', 'sucesso');
      }
      onClose();
    } catch (error) {
      mostrarToast(error.message || 'Erro ao salvar projeto', 'erro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{projectToEdit ? 'Editar Projeto' : 'Novo Projeto'}</h3>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="input-group">
            <label className="input-label" htmlFor="nome">
              Nome <span className="required-star">*</span>
            </label>
            <input 
              id="nome"
              type="text"
              value={nome}
              onChange={e => setNome(e.target.value)}
              placeholder="Ex: TCC Frontend"
              required
              minLength="3"
              maxLength="100"
            />
          </div>
          
          <div className="input-group">
            <label className="input-label" htmlFor="descricao">Descrição</label>
            <textarea 
              id="descricao"
              value={descricao}
              onChange={e => setDescricao(e.target.value)}
              placeholder="Opcional"
              rows="3"
            ></textarea>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-outline" onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? <Spinner /> : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectModal;
