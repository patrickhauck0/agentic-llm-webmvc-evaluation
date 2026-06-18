// ============================================================
// TagContext — Gerenciamento de tags do usuário (RF12)
//
// Carrega automaticamente quando o usuário está autenticado.
// Expõe: tags, carregandoTags, carregarTags(), criarTag(),
//         editarTag(), excluirTag()
// ============================================================

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { tagService } from '../services/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const TagContext = createContext();

export function TagProvider({ children }) {
  const { autenticado } = useAuth();
  const { mostrarToast } = useToast();

  const [tags, setTags] = useState([]);
  const [carregandoTags, setCarregandoTags] = useState(false);

  // ============================================================
  // RF12 — Carregar tags (automático ao autenticar)
  // ============================================================
  const carregarTags = useCallback(async () => {
    setCarregandoTags(true);
    try {
      const { data } = await tagService.listar();
      setTags(data);
      return data;
    } catch (error) {
      const msg = error.response?.data?.erro || 'Erro ao carregar tags';
      mostrarToast(msg, 'erro');
      return [];
    } finally {
      setCarregandoTags(false);
    }
  }, [mostrarToast]);

  // Carregar tags automaticamente quando autenticado
  useEffect(() => {
    if (autenticado) {
      carregarTags();
    } else {
      setTags([]);
    }
  }, [autenticado, carregarTags]);

  // ============================================================
  // RF12 — Criar tag
  // ============================================================
  const criarTag = useCallback(async (nome) => {
    try {
      const { data } = await tagService.criar({ nome });
      setTags((prev) =>
        [...prev, data].sort((a, b) => a.nome.localeCompare(b.nome))
      );
      mostrarToast('Tag criada com sucesso!', 'sucesso');
      return { sucesso: true, tag: data };
    } catch (error) {
      const msg = error.response?.data?.erro || 'Erro ao criar tag';
      mostrarToast(msg, 'erro');
      return { sucesso: false, erro: msg };
    }
  }, [mostrarToast]);

  // ============================================================
  // RF12 — Editar tag
  // ============================================================
  const editarTag = useCallback(async (id, nome) => {
    try {
      const { data } = await tagService.editar(id, { nome });
      setTags((prev) =>
        prev
          .map((t) => (t.id_tag === id ? data : t))
          .sort((a, b) => a.nome.localeCompare(b.nome))
      );
      mostrarToast('Tag atualizada com sucesso!', 'sucesso');
      return { sucesso: true, tag: data };
    } catch (error) {
      const msg = error.response?.data?.erro || 'Erro ao editar tag';
      mostrarToast(msg, 'erro');
      return { sucesso: false, erro: msg };
    }
  }, [mostrarToast]);

  // ============================================================
  // RF12 — Excluir tag
  // ============================================================
  const excluirTag = useCallback(async (id) => {
    try {
      await tagService.excluir(id);
      setTags((prev) => prev.filter((t) => t.id_tag !== id));
      mostrarToast('Tag excluída com sucesso!', 'sucesso');
      return { sucesso: true };
    } catch (error) {
      const msg = error.response?.data?.erro || 'Erro ao excluir tag';
      mostrarToast(msg, 'erro');
      return { sucesso: false, erro: msg };
    }
  }, [mostrarToast]);

  return (
    <TagContext.Provider
      value={{
        tags,
        carregandoTags,
        carregarTags,
        criarTag,
        editarTag,
        excluirTag,
      }}
    >
      {children}
    </TagContext.Provider>
  );
}

/**
 * Hook para acessar o TagContext.
 */
export function useTags() {
  const context = useContext(TagContext);
  if (!context) {
    throw new Error('useTags deve ser usado dentro de um TagProvider');
  }
  return context;
}
