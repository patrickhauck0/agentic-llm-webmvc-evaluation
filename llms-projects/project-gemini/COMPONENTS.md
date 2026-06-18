# Componentes do Frontend - SGT

Esta é a lista de componentes que serão criados na próxima etapa, documentando a hierarquia, responsabilidades e contextos consumidos.

## 1. Páginas

### `src/pages/Login.jsx`
- **Responsabilidade**: Formulário de autenticação pública.
- **Contextos**: `AuthContext` (chama a função `login(email, senha)`). `ToastContext` (para exibir erros).
- **Endpoints**: Aciona indiretamente `POST /api/auth/login`.

### `src/pages/Cadastro.jsx`
- **Responsabilidade**: Formulário de registro de novos usuários.
- **Contextos**: `ToastContext` (exibe erros ou sucesso). Redireciona para o login via React Router localmente.
- **Endpoints**: Aciona diretamente `POST /api/auth/registro`.

### `src/pages/Dashboard.jsx`
- **Responsabilidade**: Rota privada principal que serve como Layout geral da aplicação. Abriga Header, Sidebar, TaskList e Modais.
- **Contextos**: `ProjectContext` (para saber o projeto ativo).
- **Endpoints**: Nenhum diretamente (delegado aos filhos).

---

## 2. Layout

### `src/components/Layout/Header.jsx`
- **Responsabilidade**: Barra do topo contendo saudação ("Olá, Nome") e o botão de Logout. Em telas mobile, exibe o ícone de hambúrguer.
- **Contextos**: `AuthContext` (consome `usuario.nome` e chama `logout()`).
- **Endpoints**: Aciona indiretamente `POST /api/auth/logout`.

### `src/components/Layout/Sidebar.jsx`
- **Responsabilidade**: Coluna lateral contendo a lista "Meus Projetos" e o botão de criar projeto. Permite selecionar um projeto ativo.
- **Contextos**: `ProjectContext` (consome `projetos`, `projetoSelecionado`, `setProjetoSelecionado`, e chama modais).
- **Endpoints**: Aciona indiretamente `GET /api/projetos` (via carregaProjetos no contexto).

---

## 3. Tarefas (Tasks)

### `src/components/Tasks/TaskList.jsx`
- **Responsabilidade**: Listar as tarefas do projeto ativo aplicando os filtros ou estados vazios exigidos.
- **Contextos**: `ProjectContext` (consome `tarefas`, `projetoSelecionado`).
- **Endpoints**: Aciona indiretamente `GET /api/tarefas/projeto/:id` (via carregarTarefas).

### `src/components/Tasks/TaskToolbar.jsx`
- **Responsabilidade**: Barra acima da TaskList. Contém dropdowns de filtro (Status, Tags), o seletor de Ordenação, e botões secundários.
- **Contextos**: `ProjectContext` (consome e altera `filtros` e `ordenacao`). `TagContext` (para exibir a lista de tags no dropdown).
- **Endpoints**: Interage com o Contexto para recalcular os dados.

### `src/components/Tasks/TaskCard.jsx`
- **Responsabilidade**: Cartão visual da tarefa com título, data, badges e indicador de status alterável.
- **Contextos**: `ProjectContext` (para chamar a alteração de status via `alterarStatusTarefa` e abrir exclusão).
- **Endpoints**: Aciona indiretamente `PATCH /api/tarefas/:id/status`.

---

## 4. Modais (Modals)

### `src/components/Modals/ProjectModal.jsx`
- **Responsabilidade**: Formulário flutuante para Criação ou Edição de projetos.
- **Contextos**: `ProjectContext` (chama `criarProjeto` ou `editarProjeto`). `ToastContext` (sucesso/erro).
- **Endpoints**: Aciona indiretamente `POST /api/projetos` ou `PUT /api/projetos/:id`.

### `src/components/Modals/TaskModal.jsx`
- **Responsabilidade**: Formulário flutuante para Criação ou Edição de tarefas (Título, Descrição, Data, e seleto múltiplo de Tags).
- **Contextos**: `ProjectContext` (chama `criarTarefa`, `editarTarefa`). `TagContext` (lista de tags disponíveis).
- **Endpoints**: Aciona indiretamente `POST /api/tarefas/...` ou `PUT /api/tarefas/:id`.

### `src/components/Modals/TagModal.jsx`
- **Responsabilidade**: Gerenciador de tags ("Gerenciar Tags"). Lista as tags atuais e permite cadastrar/editar/excluir.
- **Contextos**: `TagContext` (chama funções CRUD). `ToastContext` (sucesso/erro).
- **Endpoints**: Aciona indiretamente `GET`, `POST`, `PUT`, `DELETE /api/tags`.

### `src/components/Modals/ConfirmModal.jsx`
- **Responsabilidade**: Interface de alerta destrutiva antes de apagar registros (Projeto, Tarefa, Tag).
- **Contextos**: Local (chama um callback injetado por quem o abre).
- **Endpoints**: Depende do callback (ex: Exclusão final de endpoint).

---

## 5. UI Compartilhado

### `src/components/UI/Toast.jsx`
- **Responsabilidade**: Renderiza notificações temporárias em pilha.
- **Contextos**: `ToastContext` (consome `toasts`).
- **Endpoints**: Nenhum.

### `src/components/UI/Spinner.jsx`
- **Responsabilidade**: Feedback visual circular indicando loading (usado em botões para previnir duble-click).
- **Contextos**: Nenhum.
- **Endpoints**: Nenhum.
