// ============================================================
// Dashboard — Página principal do SGT
//
// Orquestra todos os componentes:
//   Header, Sidebar, TaskList, e todos os modais
//
// Gerencia estados locais:
//   - Sidebar mobile (aberta/fechada)
//   - Modais: ProjectModal, TaskModal, TagModal, ConfirmModal
//
// Leitura de dados:
//   - Projetos e tarefas vêm do ProjectContext
//   - Tags vêm do TagContext
//   - Usuário do AuthContext
// ============================================================

import { useState, useCallback } from 'react';
import { useProjects } from '../contexts/ProjectContext';
import { useTags } from '../contexts/TagContext';
import Header from '../components/Layout/Header';
import Sidebar from '../components/Layout/Sidebar';
import TaskList from '../components/Tasks/TaskList';
import ProjectModal from '../components/Modals/ProjectModal';
import TaskModal from '../components/Modals/TaskModal';
import TagModal from '../components/Modals/TagModal';
import ConfirmModal from '../components/Modals/ConfirmModal';
import './Dashboard.css';

export default function Dashboard() {
  const {
    projetoSelecionado,
    excluirProjeto,
    excluirTarefa,
  } = useProjects();

  // ---- Estado: Sidebar mobile ----
  const [sidebarAberta, setSidebarAberta] = useState(false);

  // ---- Estado: Modais ----
  const [modalProjeto, setModalProjeto] = useState({
    aberto: false,
    projeto: null,
  });

  const [modalTarefa, setModalTarefa] = useState({
    aberto: false,
    tarefa: null,
  });

  const [modalTags, setModalTags] = useState(false);

  const [modalConfirmacao, setModalConfirmacao] = useState({
    aberto: false,
    titulo: '',
    mensagem: '',
    onConfirmar: null,
    carregando: false,
  });

  // ============================================================
  // Handlers: Sidebar
  // ============================================================
  const toggleSidebar = useCallback(() => {
    setSidebarAberta((prev) => !prev);
  }, []);

  const fecharSidebar = useCallback(() => {
    setSidebarAberta(false);
  }, []);

  // ============================================================
  // Handlers: ProjectModal
  // ============================================================
  const abrirNovoProjeto = useCallback(() => {
    setModalProjeto({ aberto: true, projeto: null });
  }, []);

  const abrirEditarProjeto = useCallback((projeto) => {
    setModalProjeto({ aberto: true, projeto });
  }, []);

  const fecharModalProjeto = useCallback(() => {
    setModalProjeto({ aberto: false, projeto: null });
  }, []);

  // ============================================================
  // Handlers: Confirmar exclusão de projeto
  // ============================================================
  const abrirExcluirProjeto = useCallback(
    (projeto) => {
      setModalConfirmacao({
        aberto: true,
        titulo: 'Excluir Projeto',
        mensagem: `Tem certeza que deseja excluir o projeto "${projeto.nome}"? Todas as tarefas associadas serão removidas. Esta ação não pode ser desfeita.`,
        carregando: false,
        onConfirmar: async () => {
          setModalConfirmacao((prev) => ({ ...prev, carregando: true }));
          await excluirProjeto(projeto.id_projeto);
          setModalConfirmacao({
            aberto: false,
            titulo: '',
            mensagem: '',
            onConfirmar: null,
            carregando: false,
          });
        },
      });
    },
    [excluirProjeto]
  );

  // ============================================================
  // Handlers: TaskModal
  // ============================================================
  const abrirNovaTarefa = useCallback(() => {
    setModalTarefa({ aberto: true, tarefa: null });
  }, []);

  const abrirEditarTarefa = useCallback((tarefa) => {
    setModalTarefa({ aberto: true, tarefa });
  }, []);

  const fecharModalTarefa = useCallback(() => {
    setModalTarefa({ aberto: false, tarefa: null });
  }, []);

  // ============================================================
  // Handlers: Confirmar exclusão de tarefa
  // ============================================================
  const abrirExcluirTarefa = useCallback(
    (tarefa) => {
      setModalConfirmacao({
        aberto: true,
        titulo: 'Excluir Tarefa',
        mensagem: `Tem certeza que deseja excluir a tarefa "${tarefa.titulo}"? Esta ação não pode ser desfeita.`,
        carregando: false,
        onConfirmar: async () => {
          setModalConfirmacao((prev) => ({ ...prev, carregando: true }));
          await excluirTarefa(tarefa.id_tarefa);
          setModalConfirmacao({
            aberto: false,
            titulo: '',
            mensagem: '',
            onConfirmar: null,
            carregando: false,
          });
        },
      });
    },
    [excluirTarefa]
  );

  // ============================================================
  // Handlers: TagModal
  // ============================================================
  const abrirGerenciarTags = useCallback(() => {
    setModalTags(true);
  }, []);

  const fecharModalTags = useCallback(() => {
    setModalTags(false);
  }, []);

  // ============================================================
  // Handler: Fechar ConfirmModal
  // ============================================================
  const fecharConfirmacao = useCallback(() => {
    setModalConfirmacao({
      aberto: false,
      titulo: '',
      mensagem: '',
      onConfirmar: null,
      carregando: false,
    });
  }, []);

  // ============================================================
  // Render
  // ============================================================
  return (
    <div className="dashboard">
      {/* Header */}
      <Header onToggleSidebar={toggleSidebar} />

      {/* Sidebar */}
      <Sidebar
        aberta={sidebarAberta}
        onFechar={fecharSidebar}
        onNovoProjeto={abrirNovoProjeto}
        onEditarProjeto={abrirEditarProjeto}
        onExcluirProjeto={abrirExcluirProjeto}
      />

      {/* Área Principal */}
      <main className="dashboard__main">
        {projetoSelecionado ? (
          <>
            {/* Cabeçalho do projeto */}
            <div className="dashboard__project-header">
              <h1 className="dashboard__project-title">
                {projetoSelecionado.nome}
              </h1>
              {projetoSelecionado.descricao && (
                <p className="dashboard__project-desc">
                  {projetoSelecionado.descricao}
                </p>
              )}
            </div>

            {/* TaskList com toolbar integrada */}
            <TaskList
              onNovaTarefa={abrirNovaTarefa}
              onEditarTarefa={abrirEditarTarefa}
              onExcluirTarefa={abrirExcluirTarefa}
              onGerenciarTags={abrirGerenciarTags}
            />
          </>
        ) : (
          /* Empty State: nenhum projeto selecionado */
          <div className="dashboard__empty">
            <div className="dashboard__empty-icon">📋</div>
            <h2 className="dashboard__empty-title">
              Nenhum projeto selecionado
            </h2>
            <p className="dashboard__empty-text">
              Selecione um projeto no menu lateral ou crie um novo projeto para
              começar a gerenciar suas tarefas.
            </p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={abrirNovoProjeto}
              style={{ marginTop: '20px' }}
            >
              + Novo Projeto
            </button>
          </div>
        )}
      </main>

      {/* ---- Modais ---- */}

      {/* ProjectModal */}
      <ProjectModal
        aberto={modalProjeto.aberto}
        onFechar={fecharModalProjeto}
        projeto={modalProjeto.projeto}
      />

      {/* TaskModal */}
      <TaskModal
        aberto={modalTarefa.aberto}
        onFechar={fecharModalTarefa}
        tarefa={modalTarefa.tarefa}
        projetoId={projetoSelecionado?.id_projeto}
      />

      {/* TagModal */}
      <TagModal
        aberto={modalTags}
        onFechar={fecharModalTags}
      />

      {/* ConfirmModal */}
      <ConfirmModal
        aberto={modalConfirmacao.aberto}
        titulo={modalConfirmacao.titulo}
        mensagem={modalConfirmacao.mensagem}
        textoBotao="Excluir"
        onConfirmar={modalConfirmacao.onConfirmar}
        onCancelar={fecharConfirmacao}
        carregando={modalConfirmacao.carregando}
      />
    </div>
  );
}
