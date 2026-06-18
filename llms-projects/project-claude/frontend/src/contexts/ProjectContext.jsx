// ============================================================
// ProjectContext — Gerenciamento de Projetos E Tarefas
//
// Decisão arquitetural: tarefas vivem aqui porque estão sempre
// atreladas ao projeto selecionado. Não existe TaskContext separado.
//
// Estados:
//   - projetos (array)
//   - projetoSelecionado (object|null)
//   - tarefas (array)
//   - filtros ({ status: [], tags: [] })
//   - ordenacao (string, ex: 'data_conclusao_asc')
//
// useEffect monitora alterações em filtros/ordenacao e dispara
// nova busca de tarefas automaticamente.
// ============================================================

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { projetoService, tarefaService } from '../services/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const ProjectContext = createContext();

// Mapeamento de ordenação: string legível → { ordenar, direcao }
const ORDENACAO_MAP = {
  'data_conclusao_asc':  { ordenar: 'data_conclusao', direcao: 'ASC' },
  'data_conclusao_desc': { ordenar: 'data_conclusao', direcao: 'DESC' },
  'titulo_asc':          { ordenar: 'titulo', direcao: 'ASC' },
  'titulo_desc':         { ordenar: 'titulo', direcao: 'DESC' },
};

export function ProjectProvider({ children }) {
  const { autenticado } = useAuth();
  const { mostrarToast } = useToast();

  // ---- Estado: Projetos ----
  const [projetos, setProjetos] = useState([]);
  const [projetoSelecionado, setProjetoSelecionado] = useState(null);
  const [carregandoProjetos, setCarregandoProjetos] = useState(false);

  // ---- Estado: Tarefas (do projeto selecionado) ----
  const [tarefas, setTarefas] = useState([]);
  const [carregandoTarefas, setCarregandoTarefas] = useState(false);

  // ---- Estado: Filtros e Ordenação ----
  const [filtros, setFiltros] = useState({ status: [], tags: [] });
  const [ordenacao, setOrdenacao] = useState('data_conclusao_asc');

  // ============================================================
  // RF05 — Carregar projetos (automático ao autenticar)
  // ============================================================
  const carregarProjetos = useCallback(async () => {
    setCarregandoProjetos(true);
    try {
      const { data } = await projetoService.listar();
      setProjetos(data);
      return data;
    } catch (error) {
      const msg = error.response?.data?.erro || 'Erro ao carregar projetos';
      mostrarToast(msg, 'erro');
      return [];
    } finally {
      setCarregandoProjetos(false);
    }
  }, [mostrarToast]);

  // Carregar projetos automaticamente quando autenticado
  useEffect(() => {
    if (autenticado) {
      carregarProjetos();
    } else {
      // Limpar tudo ao desautenticar
      setProjetos([]);
      setProjetoSelecionado(null);
      setTarefas([]);
      setFiltros({ status: [], tags: [] });
      setOrdenacao('data_conclusao_asc');
    }
  }, [autenticado, carregarProjetos]);

  // ============================================================
  // RF04 — Criar projeto
  // ============================================================
  const criarProjeto = useCallback(async (dados) => {
    try {
      const { data } = await projetoService.criar(dados);
      setProjetos((prev) => [data, ...prev]);
      setProjetoSelecionado(data);
      mostrarToast('Projeto criado com sucesso!', 'sucesso');
      return { sucesso: true, projeto: data };
    } catch (error) {
      const msg = error.response?.data?.erro || 'Erro ao criar projeto';
      mostrarToast(msg, 'erro');
      return { sucesso: false, erro: msg };
    }
  }, [mostrarToast]);

  // ============================================================
  // RF06 — Editar projeto
  // ============================================================
  const editarProjeto = useCallback(async (id, dados) => {
    try {
      const { data } = await projetoService.editar(id, dados);
      setProjetos((prev) =>
        prev.map((p) => (p.id_projeto === id ? data : p))
      );
      // Atualizar selecionado se for o mesmo
      setProjetoSelecionado((prev) =>
        prev && prev.id_projeto === id ? data : prev
      );
      mostrarToast('Projeto atualizado com sucesso!', 'sucesso');
      return { sucesso: true, projeto: data };
    } catch (error) {
      const msg = error.response?.data?.erro || 'Erro ao editar projeto';
      mostrarToast(msg, 'erro');
      return { sucesso: false, erro: msg };
    }
  }, [mostrarToast]);

  // ============================================================
  // RF07 — Excluir projeto
  // ============================================================
  const excluirProjeto = useCallback(async (id) => {
    try {
      await projetoService.excluir(id);
      setProjetos((prev) => prev.filter((p) => p.id_projeto !== id));

      // Se era o selecionado, limpar seleção e tarefas
      setProjetoSelecionado((prev) => {
        if (prev && prev.id_projeto === id) {
          setTarefas([]);
          return null;
        }
        return prev;
      });

      mostrarToast('Projeto excluído com sucesso!', 'sucesso');
      return { sucesso: true };
    } catch (error) {
      const msg = error.response?.data?.erro || 'Erro ao excluir projeto';
      mostrarToast(msg, 'erro');
      return { sucesso: false, erro: msg };
    }
  }, [mostrarToast]);

  // ============================================================
  // Selecionar projeto — limpa tarefas e filtros durante transição
  // ============================================================
  const selecionarProjeto = useCallback((projeto) => {
    // Limpar tarefas durante a transição
    setTarefas([]);
    // Resetar filtros ao trocar de projeto
    setFiltros({ status: [], tags: [] });
    setOrdenacao('data_conclusao_asc');
    // Definir novo projeto selecionado
    setProjetoSelecionado(projeto);
  }, []);

  // ============================================================
  // RF14 — Carregar tarefas (com filtros e ordenação)
  // ============================================================
  const carregarTarefas = useCallback(async (projetoId, filtrosParam, ordenacaoParam) => {
    if (!projetoId) {
      setTarefas([]);
      return [];
    }

    setCarregandoTarefas(true);
    try {
      const ordConfig = ORDENACAO_MAP[ordenacaoParam] || ORDENACAO_MAP['data_conclusao_asc'];
      const params = {
        status: filtrosParam.status,
        tags: filtrosParam.tags,
        ordenar: ordConfig.ordenar,
        direcao: ordConfig.direcao,
      };

      const { data } = await tarefaService.listar(projetoId, params);
      setTarefas(data);
      return data;
    } catch (error) {
      const msg = error.response?.data?.erro || 'Erro ao carregar tarefas';
      mostrarToast(msg, 'erro');
      setTarefas([]);
      return [];
    } finally {
      setCarregandoTarefas(false);
    }
  }, [mostrarToast]);

  // ---- useEffect: re-fetch tarefas ao mudar projeto, filtros ou ordenação ----
  useEffect(() => {
    if (projetoSelecionado) {
      carregarTarefas(projetoSelecionado.id_projeto, filtros, ordenacao);
    }
  }, [projetoSelecionado, filtros, ordenacao, carregarTarefas]);

  // ============================================================
  // RF08 — Criar tarefa
  // ============================================================
  const criarTarefa = useCallback(async (projetoId, dados) => {
    try {
      await tarefaService.criar(projetoId, dados);
      mostrarToast('Tarefa criada com sucesso!', 'sucesso');
      // Re-fetch para refletir filtros/ordenação
      await carregarTarefas(projetoId, filtros, ordenacao);
      return { sucesso: true };
    } catch (error) {
      const msg = error.response?.data?.erro || 'Erro ao criar tarefa';
      mostrarToast(msg, 'erro');
      return { sucesso: false, erro: msg };
    }
  }, [mostrarToast, carregarTarefas, filtros, ordenacao]);

  // ============================================================
  // RF09 — Editar tarefa
  // ============================================================
  const editarTarefa = useCallback(async (id, dados) => {
    try {
      await tarefaService.editar(id, dados);
      mostrarToast('Tarefa atualizada com sucesso!', 'sucesso');
      // Re-fetch para refletir filtros/ordenação
      if (projetoSelecionado) {
        await carregarTarefas(projetoSelecionado.id_projeto, filtros, ordenacao);
      }
      return { sucesso: true };
    } catch (error) {
      const msg = error.response?.data?.erro || 'Erro ao editar tarefa';
      mostrarToast(msg, 'erro');
      return { sucesso: false, erro: msg };
    }
  }, [mostrarToast, carregarTarefas, projetoSelecionado, filtros, ordenacao]);

  // ============================================================
  // RF10 — Excluir tarefa
  // ============================================================
  const excluirTarefa = useCallback(async (id) => {
    try {
      await tarefaService.excluir(id);
      mostrarToast('Tarefa excluída com sucesso!', 'sucesso');
      // Re-fetch
      if (projetoSelecionado) {
        await carregarTarefas(projetoSelecionado.id_projeto, filtros, ordenacao);
      }
      return { sucesso: true };
    } catch (error) {
      const msg = error.response?.data?.erro || 'Erro ao excluir tarefa';
      mostrarToast(msg, 'erro');
      return { sucesso: false, erro: msg };
    }
  }, [mostrarToast, carregarTarefas, projetoSelecionado, filtros, ordenacao]);

  // ============================================================
  // RF11 — Alterar status da tarefa
  // ============================================================
  const alterarStatusTarefa = useCallback(async (id, status) => {
    try {
      await tarefaService.alterarStatus(id, status);
      // Re-fetch (não mostra toast pois é ação rápida de click)
      if (projetoSelecionado) {
        await carregarTarefas(projetoSelecionado.id_projeto, filtros, ordenacao);
      }
      return { sucesso: true };
    } catch (error) {
      const msg = error.response?.data?.erro || 'Erro ao alterar status';
      mostrarToast(msg, 'erro');
      return { sucesso: false, erro: msg };
    }
  }, [mostrarToast, carregarTarefas, projetoSelecionado, filtros, ordenacao]);

  return (
    <ProjectContext.Provider
      value={{
        // Projetos
        projetos,
        projetoSelecionado,
        carregandoProjetos,
        carregarProjetos,
        criarProjeto,
        editarProjeto,
        excluirProjeto,
        selecionarProjeto,

        // Tarefas
        tarefas,
        setTarefas,
        carregandoTarefas,
        carregarTarefas,
        criarTarefa,
        editarTarefa,
        excluirTarefa,
        alterarStatusTarefa,

        // Filtros e Ordenação
        filtros,
        setFiltros,
        ordenacao,
        setOrdenacao,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

/**
 * Hook para acessar o ProjectContext.
 */
export function useProjects() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProjects deve ser usado dentro de um ProjectProvider');
  }
  return context;
}
