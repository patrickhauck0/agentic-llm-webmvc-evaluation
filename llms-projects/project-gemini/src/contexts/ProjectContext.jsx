import React, { createContext, useState, useEffect, useContext } from 'react';
import { projetoService, tarefaService } from '../services/api';
import { AuthContext } from './AuthContext';

export const ProjectContext = createContext();

export const ProjectProvider = ({ children }) => {
  const { autenticado } = useContext(AuthContext);
  
  const [projetos, setProjetos] = useState([]);
  const [projetoSelecionado, setProjetoSelecionado] = useState(null);
  const [tarefas, setTarefas] = useState([]);
  
  const [filtros, setFiltros] = useState({ status: [], tags: [] });
  const [ordenacao, setOrdenacao] = useState('data_conclusao_asc');

  // Carrega projetos quando o usuário loga
  useEffect(() => {
    if (autenticado) {
      carregarProjetos();
    } else {
      setProjetos([]);
      setProjetoSelecionado(null);
      setTarefas([]);
    }
  }, [autenticado]);

  // Carrega tarefas quando projetoSelecionado, filtros ou ordenacao mudam
  useEffect(() => {
    if (projetoSelecionado) {
      carregarTarefas(projetoSelecionado.id_projeto, filtros, ordenacao);
    } else {
      setTarefas([]);
    }
  }, [projetoSelecionado, filtros, ordenacao]);

  const carregarProjetos = async () => {
    try {
      const data = await projetoService.listar();
      setProjetos(data);
    } catch (error) {
      console.error('Erro ao carregar projetos', error);
    }
  };

  const criarProjeto = async (dados) => {
    const novoProjeto = await projetoService.criar(dados);
    setProjetos(prev => [...prev, novoProjeto]);
    return novoProjeto;
  };

  const editarProjeto = async (id, dados) => {
    const projetoEditado = await projetoService.editar(id, dados);
    setProjetos(prev => prev.map(p => p.id_projeto === id ? projetoEditado : p));
    if (projetoSelecionado && projetoSelecionado.id_projeto === id) {
      setProjetoSelecionado(projetoEditado);
    }
  };

  const excluirProjeto = async (id) => {
    await projetoService.excluir(id);
    setProjetos(prev => prev.filter(p => p.id_projeto !== id));
    if (projetoSelecionado && projetoSelecionado.id_projeto === id) {
      setProjetoSelecionado(null);
      setTarefas([]);
    }
  };

  const carregarTarefas = async (projetoId, filtrosAtuais, ordenacaoAtual) => {
    try {
      const data = await tarefaService.listar(projetoId, filtrosAtuais, ordenacaoAtual);
      setTarefas(data);
    } catch (error) {
      console.error('Erro ao carregar tarefas', error);
      setTarefas([]);
    }
  };

  const criarTarefa = async (projetoId, dados) => {
    const novaTarefa = await tarefaService.criar(projetoId, dados);
    await carregarTarefas(projetoId, filtros, ordenacao); // Recarrega para aplicar filtros/ordem
    return novaTarefa;
  };

  const editarTarefa = async (id, dados) => {
    await tarefaService.editar(id, dados);
    if (projetoSelecionado) {
      await carregarTarefas(projetoSelecionado.id_projeto, filtros, ordenacao);
    }
  };

  const excluirTarefa = async (id) => {
    await tarefaService.excluir(id);
    setTarefas(prev => prev.filter(t => t.id_tarefa !== id));
  };

  const alterarStatusTarefa = async (id, status) => {
    await tarefaService.alterarStatus(id, status);
    if (projetoSelecionado) {
      await carregarTarefas(projetoSelecionado.id_projeto, filtros, ordenacao);
    }
  };

  return (
    <ProjectContext.Provider value={{
      projetos, projetoSelecionado, setProjetoSelecionado,
      tarefas, filtros, setFiltros, ordenacao, setOrdenacao,
      carregarProjetos, criarProjeto, editarProjeto, excluirProjeto,
      carregarTarefas, criarTarefa, editarTarefa, excluirTarefa, alterarStatusTarefa
    }}>
      {children}
    </ProjectContext.Provider>
  );
};
