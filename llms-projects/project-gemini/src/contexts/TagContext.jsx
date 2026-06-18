import React, { createContext, useState, useEffect, useContext } from 'react';
import { tagService } from '../services/api';
import { AuthContext } from './AuthContext';

export const TagContext = createContext();

export const TagProvider = ({ children }) => {
  const { autenticado } = useContext(AuthContext);
  const [tags, setTags] = useState([]);

  useEffect(() => {
    if (autenticado) {
      carregarTags();
    } else {
      setTags([]);
    }
  }, [autenticado]);

  const carregarTags = async () => {
    try {
      const data = await tagService.listar();
      setTags(data);
    } catch (error) {
      console.error('Erro ao carregar tags', error);
    }
  };

  const criarTag = async (nome) => {
    const novaTag = await tagService.criar({ nome });
    setTags(prev => [...prev, novaTag].sort((a, b) => a.nome.localeCompare(b.nome)));
    return novaTag;
  };

  const editarTag = async (id, nome) => {
    const tagEditada = await tagService.editar(id, { nome });
    setTags(prev => prev.map(t => t.id_tag === id ? tagEditada : t).sort((a, b) => a.nome.localeCompare(b.nome)));
  };

  const excluirTag = async (id) => {
    await tagService.excluir(id);
    setTags(prev => prev.filter(t => t.id_tag !== id));
  };

  return (
    <TagContext.Provider value={{
      tags,
      carregarTags,
      criarTag,
      editarTag,
      excluirTag
    }}>
      {children}
    </TagContext.Provider>
  );
};
