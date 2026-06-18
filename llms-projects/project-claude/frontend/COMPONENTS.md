# COMPONENTS.md — Inventário de Componentes (User Prompt 2)

Todos os componentes visuais a implementar na próxima etapa, organizados por módulo.

---

## Páginas (src/pages/)

| Arquivo | Responsabilidade | Contexts | Endpoints |
|---------|-----------------|----------|-----------|
| `Login.jsx` + `Login.css` | Formulário de login com email/senha, logo SGT, link para cadastro | `AuthContext` (login) | `POST /api/auth/login` (via AuthContext) |
| `Cadastro.jsx` + `Cadastro.css` | Formulário de registro com nome/email/senha, indicador de força da senha, link para login | `AuthContext` (registro) | `POST /api/auth/registro` (via AuthContext) |
| `Dashboard.jsx` + `Dashboard.css` | Orquestrador principal: renderiza Header, Sidebar, área de conteúdo (TaskToolbar + TaskList), e todos os modais. Gerencia estados locais de modais e sidebar mobile | `AuthContext`, `ProjectContext`, `TagContext`, `ToastContext` | Nenhum diretamente (delega para contexts) |

---

## Layout (src/components/Layout/)

| Arquivo | Responsabilidade | Contexts | Endpoints |
|---------|-----------------|----------|-----------|
| `Header.jsx` + `Header.css` | Barra superior fixa: logo SGT, saudação "Olá, {nome}", avatar do usuário, botão "Sair", hamburger mobile | `AuthContext` (usuario, logout) | `POST /api/auth/logout` (via AuthContext) |
| `Sidebar.jsx` + `Sidebar.css` | Painel lateral com lista de projetos, botões editar/excluir por item, botão "+ Novo Projeto". Mobile: overlay com backdrop | `ProjectContext` (projetos, projetoSelecionado, selecionarProjeto) | Nenhum (callbacks para o Dashboard) |

---

## Tasks (src/components/Tasks/)

| Arquivo | Responsabilidade | Contexts | Endpoints |
|---------|-----------------|----------|-----------|
| `TaskToolbar.jsx` + `TaskToolbar.css` | Barra de filtros (status multi-select, tags multi-select), ordenação (single-select), botões "Limpar Filtros", "Gerenciar Tags", "+ Nova Tarefa". Dropdowns customizados com click-outside | Recebe via props do Dashboard: `filtros`, `setFiltros`, `ordenacao`, `setOrdenacao` do `ProjectContext`; `tags` do `TagContext` | Nenhum (manipula estado via props/callbacks) |
| `TaskList.jsx` + `TaskList.css` | Lista de TaskCards com estados de carregamento (Spinner) e vazio (nenhuma tarefa / filtros sem resultado) | Recebe via props: `tarefas`, `carregandoTarefas` do `ProjectContext` | Nenhum (callbacks para o Dashboard) |
| `TaskCard.jsx` + `TaskCard.css` | Cartão individual: indicador de status clicável (Pendente→Em Andamento→Concluída), título, data formatada dd/mm/yyyy (vermelho se vencida), badges de tags, botões editar/excluir | Nenhum (props-only) | `PATCH /api/tarefas/:id/status` (via callback → ProjectContext.alterarStatusTarefa) |

---

## Modals (src/components/Modals/)

| Arquivo | Responsabilidade | Contexts | Endpoints |
|---------|-----------------|----------|-----------|
| `ProjectModal.jsx` + `ProjectModal.css` | Modal de criar/editar projeto. Campos: Nome (*), Descrição. Fecha com Escape e overlay click | `ProjectContext` (criarProjeto, editarProjeto) | `POST /api/projetos` ou `PUT /api/projetos/:id` (via ProjectContext) |
| `TaskModal.jsx` + `TaskModal.css` | Modal de criar/editar tarefa. Campos: Título (*), Descrição, Data de Conclusão (date), Tags (checkboxes multi-select) | `ProjectContext` (criarTarefa, editarTarefa), `TagContext` (tags para checkboxes) | `POST /api/projetos/:projetoId/tarefas` ou `PUT /api/tarefas/:id` (via ProjectContext) |
| `TagModal.jsx` + `TagModal.css` | Modal de CRUD de tags. Input para criar nova tag, lista de tags com edição inline e exclusão com confirmação | `TagContext` (criarTag, editarTag, excluirTag, tags) | `POST/PUT/DELETE /api/tags` (via TagContext) |
| `ConfirmModal.jsx` + `ConfirmModal.css` | Modal genérico de confirmação. Props: título, mensagem, botão de ação (danger). Fecha com Escape e overlay click | Nenhum (props-only, controlado pelo pai) | Nenhum (executa callback `onConfirmar`) |

---

## UI Compartilhado (src/components/UI/)

| Arquivo | Responsabilidade | Contexts | Endpoints |
|---------|-----------------|----------|-----------|
| `Toast.jsx` + `Toast.css` | Container fixo (bottom-right) que renderiza todos os toasts ativos. Cada toast tem ícone (sucesso/erro), mensagem e auto-dismiss visual | `ToastContext` (toasts, removerToast) | Nenhum |
| `Spinner.jsx` + `Spinner.css` | Indicador de carregamento CSS-only. Variantes: inline (sm/md para botões) e fullscreen (overlay com spinner grande) | Nenhum (props-only, stateless) | Nenhum |

---

## Resumo de Contagem

| Módulo | Componentes | Arquivos (JSX+CSS) |
|--------|:-----------:|:------------------:|
| Páginas | 3 | 6 |
| Layout | 2 | 4 |
| Tasks | 3 | 6 |
| Modals | 4 | 8 |
| UI | 2 | 4 |
| **Total** | **14** | **28** |
