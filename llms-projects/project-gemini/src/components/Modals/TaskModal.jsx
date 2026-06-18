import React, { useState, useContext, useEffect } from 'react';
import { ProjectContext } from '../../contexts/ProjectContext';
import { TagContext } from '../../contexts/TagContext';
import { ToastContext } from '../../contexts/ToastContext';
import { tagService } from '../../services/api';
import Spinner from '../UI/Spinner';
import './TaskModal.css';

const TaskModal = ({ onClose, taskToEdit }) => {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [dataConclusao, setDataConclusao] = useState('');
  const [tagsSelecionadas, setTagsSelecionadas] = useState([]);
  const [loading, setLoading] = useState(false);

  const { projetoSelecionado, criarTarefa, editarTarefa } = useContext(ProjectContext);
  const { tags } = useContext(TagContext);
  const { mostrarToast } = useContext(ToastContext);

  useEffect(() => {
    if (taskToEdit) {
      setTitulo(taskToEdit.titulo);
      setDescricao(taskToEdit.descricao || '');
      setDataConclusao(taskToEdit.data_conclusao ? taskToEdit.data_conclusao.split('T')[0] : '');
      setTagsSelecionadas(taskToEdit.tags?.map(t => t.id_tag) || []);
    }
  }, [taskToEdit]);

  const handleTagToggle = (tagId) => {
    setTagsSelecionadas(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!projetoSelecionado) return;
    
    setLoading(true);

    const payload = {
      titulo,
      descricao,
      data_conclusao: dataConclusao || null,
      tags: tagsSelecionadas
    };

    try {
      if (taskToEdit) {
        await editarTarefa(taskToEdit.id_tarefa, payload);
        // Atualizar tags (se endpoint separado) ou assumir que o PUT já atualiza as tags
        // O RF09 e RF13 indicam que editarTarefa atualiza tudo, 
        // ou RF13 PUT /api/tarefas/:tarefaId/tags atualiza
        // O API_CONTRACT diz que POST /api/tarefas e PUT /api/tarefas aceitam "tags" no payload.
        mostrarToast('Tarefa atualizada com sucesso!', 'sucesso');
      } else {
        await criarTarefa(projetoSelecionado.id_projeto, payload);
        mostrarToast('Tarefa criada com sucesso!', 'sucesso');
      }
      onClose();
    } catch (error) {
      mostrarToast(error.message || 'Erro ao salvar tarefa', 'erro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container task-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{taskToEdit ? 'Editar Tarefa' : 'Nova Tarefa'}</h3>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <div className="input-group">
            <label className="input-label" htmlFor="titulo">
              Título <span className="required-star">*</span>
            </label>
            <input 
              id="titulo"
              type="text"
              value={titulo}
              onChange={e => setTitulo(e.target.value)}
              placeholder="Ex: Revisar documentação"
              required
              minLength="3"
              maxLength="150"
            />
          </div>
          
          <div className="input-group">
            <label className="input-label" htmlFor="descricao">Descrição</label>
            <textarea 
              id="descricao"
              value={descricao}
              onChange={e => setDescricao(e.target.value)}
              placeholder="Detalhes adicionais"
              rows="3"
            ></textarea>
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="data">Data de Conclusão</label>
            <input 
              id="data"
              type="date"
              value={dataConclusao}
              onChange={e => setDataConclusao(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label className="input-label">Tags (Múltipla escolha)</label>
            <div className="tags-selector">
              {tags.map(tag => (
                <label key={tag.id_tag} className="tag-checkbox">
                  <input 
                    type="checkbox"
                    checked={tagsSelecionadas.includes(tag.id_tag)}
                    onChange={() => handleTagToggle(tag.id_tag)}
                  />
                  <span>{tag.nome}</span>
                </label>
              ))}
              {tags.length === 0 && (
                <span className="empty-projects-text">Nenhuma tag criada.</span>
              )}
            </div>
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

export default TaskModal;
