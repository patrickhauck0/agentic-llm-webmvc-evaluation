### User Prompt 1 — Agente Frontend

Antes de escrever qualquer linha de código, eu preciso que você raciocine explicitamente, passo a passo, em formato numerado. Não pule nenhuma etapa.

**Etapa de Raciocínio (obrigatória — escreva antes do código):**

1. Liste todas as páginas/telas necessárias do SGT com suas respectivas rotas. Para cada uma, indique:

   * O path da rota (ex: `/login`)
   * Se é pública (acessível sem autenticação) ou privada (requer JWT válido em memória)
   * Qual componente React será renderizado nessa rota
2. Desenhe a hierarquia completa de componentes, organizada por módulo. Para cada componente, indique quem é o pai e quais são os filhos. Organize nos seguintes módulos:

   * **Auth**: componentes das telas de Login e Cadastro
   * **Layout**: Header, Sidebar, estrutura do Dashboard
   * **Tasks**: lista de tarefas, cartão de tarefa, barra de ferramentas (filtros/ordenação)
   * **Modals**: ProjectModal, TaskModal, TagModal, ConfirmModal
   * **UI Compartilhado**: Toast, Spinner
3. Defina quais estados precisam ser **globais** (gerenciados via Context API) e quais são **locais** (useState dentro do componente). Raciocine assim:

   * Quais dados são compartilhados entre múltiplos componentes não relacionados? (esses são globais)
   * Quais dados pertencem exclusivamente a um formulário ou modal? (esses são locais)
   * Estados globais esperados:

     * **AuthContext**: token JWT, dados do usuário (nome, id\_usuario), funções login() e logout()
     * **ProjectContext**: lista de projetos do usuário, projeto atualmente selecionado, lista de tarefas do projeto selecionado, filtros ativos (status\[], tags\[]), ordenação selecionada, funções de CRUD de projetos e tarefas
     * **TagContext**: lista de tags do usuário, funções de CRUD de tags
     * **ToastContext**: fila de mensagens de notificação (sucesso/erro)
   * Nota: não existe um TaskContext separado. O estado das tarefas (lista, filtros, ordenação) vive dentro do **ProjectContext**, pois as tarefas são sempre carregadas no contexto do projeto selecionado.
4. Mapeie quais endpoints do API\_CONTRACT.md serão consumidos por qual componente ou Context. Para cada endpoint, indique:

   * Qual Context ou componente fará a chamada
   * Em qual ação do usuário a chamada é disparada
   * Exemplo: `POST /api/auth/login` → AuthContext → ação: submit do formulário de Login
5. Descreva como será a proteção de rotas privadas (PrivateRoute):

   * Como o componente PrivateRoute verifica se o usuário está autenticado?
   * O que acontece se o usuário não estiver autenticado e tentar acessar `/dashboard`?
   * O que acontece quando o token expira durante o uso (HTTP 401 interceptado)?

**Etapa de Entrega (após o raciocínio):**

Após concluir o raciocínio acima, gere os seguintes arquivos:

1. **`index.html`**
   * Arquivo HTML base estruturado para SPA e para o ponto de entrada do Vite.
2. **`vite.config.js`**
   * Configuração padrão do Vite utilizando o plugin `@vitejs/plugin-react` para permitir a transpilação e execução do JSX em ambiente local.
3. **`src/main.jsx`**
   * Importar as bibliotecas `React` e `ReactDOM`
   * Importar o arquivo de estilo `global.css`
   * Renderizar o componente `<App />` em modo `<React.StrictMode>`
4. **`src/App.jsx`**
   * Importar e configurar o React Router (BrowserRouter, Routes, Route)
   * Rotas públicas: `/login` → componente Login, `/cadastro` → componente Cadastro
   * Rotas privadas: `/` e `/dashboard` → componente Dashboard, protegidas pelo PrivateRoute
   * O componente PrivateRoute deve verificar se existe token no AuthContext. Se não existir, redireciona para `/login` usando `<Navigate to="/login" />`.
   * Escreva os comandos de `import` apontando para as páginas que serão criadas na próxima etapa. O código deve prever a existência física desses arquivos no diretório.
   * Envolver toda a aplicação com os Providers dos Contexts na ordem correta (AuthProvider deve ser o mais externo, pois os outros dependem do token para fazer chamadas à API)
5. **`src/contexts/AuthContext.jsx`**

   * Estado `token` (useState, inicializado como `null`) — este é o JWT armazenado exclusivamente em memória
   * Estado `usuario` (useState, inicializado como `null`) — contém `{ id\\\_usuario, nome, email }` retornado pelo login
   * Função `login(email, senha)`: chama `POST /api/auth/login`, armazena o token e os dados do usuário no estado
   * Função `logout()`: limpa o token e o usuário do estado, redireciona para `/login`
   * O Provider deve expor: `token`, `usuario`, `login`, `logout`, e um booleano `autenticado` (derivado de `!!token`)
6. **`src/contexts/ProjectContext.jsx`**

   * Estado `projetos` — lista de projetos do usuário (array)
   * Estado `projetoSelecionado` — o projeto atualmente ativo na Sidebar
   * Estado `tarefas` — lista de tarefas do projeto selecionado
   * Estado `filtros` — `{ status: \\\[], tags: \\\[] }` para os filtros ativos
   * Estado `ordenacao` — ordenação selecionada (padrão: `data\\\_conclusao\\\_asc`)
   * Implementação de useEffect que monitore qualquer alteração nos estados dos filtros e dispare automaticamente uma nova busca das tarefas do projeto.
   * Funções que consomem a API de projetos: `carregarProjetos()`, `criarProjeto(dados)`, `editarProjeto(id, dados)`, `excluirProjeto(id)`
   * Funções que consomem a API de tarefas: `carregarTarefas(projetoId, filtros, ordenacao)`, `criarTarefa(projetoId, dados)`, `editarTarefa(id, dados)`, `excluirTarefa(id)`, `alterarStatusTarefa(id, status)`
   * `carregarProjetos()` deve ser chamado automaticamente quando o usuário estiver autenticado
   * A interface visual precisará manipular diretamente o array de tarefas para limpar a tela durante a transição entre projetos.
   * Ao excluir o projeto selecionado, limpar o `projetoSelecionado` e `tarefas`
7. **`src/contexts/TagContext.jsx`**

   * Estado `tags` — lista de tags do usuário (array)
   * Funções: `carregarTags()`, `criarTag(nome)`, `editarTag(id, nome)`, `excluirTag(id)`
   * `carregarTags()` deve ser chamado automaticamente quando o usuário estiver autenticado
8. **`src/contexts/ToastContext.jsx`**

   * Estado `toasts` — fila de mensagens (array de objetos `{ id, mensagem, tipo: 'sucesso' | 'erro' }`)
   * Função `mostrarToast(mensagem, tipo)`: adiciona um toast à fila
   * Cada toast deve desaparecer automaticamente após 3 segundos (usar `setTimeout` + remoção do array)
9. **`src/services/api.js`**

   * Criar uma instância centralizada para chamadas HTTP (axios ou wrapper de fetch)
   * Configurar a `baseURL` da API (ex: `http://localhost:3000`)
   * Implementar um mecanismo para injetar o header `Authorization: Bearer <token>` automaticamente em todas as requisições autenticadas. O token será passado por referência ou via setter function chamada pelo AuthContext.
   * Implementar um interceptor de resposta que, ao receber **HTTP 401** de qualquer endpoint, dispara o logout automático (limpa o token) e redireciona para `/login`
   * Exportar funções organizadas por módulo:

     * `authService`: `registro(dados)`, `login(dados)`, `logout()`
     * `projetoService`: `listar()`, `criar(dados)`, `editar(id, dados)`, `excluir(id)`
     * `tarefaService`: `listar(projetoId, filtros)`, `criar(projetoId, dados)`, `editar(id, dados)`, `excluir(id)`, `alterarStatus(id, status)`
     * `tagService`: `listar()`, `criar(dados)`, `editar(id, dados)`, `excluir(id)`, `associar(tarefaId, tagIds)`
11. **`src/styles/global.css`**

   * Reset CSS básico (box-sizing, margin, padding, font-family)
   * Variáveis CSS (custom properties) para cores, fontes e espaçamentos reutilizáveis
11. **`COMPONENTS.md`**

    * Lista comentada de TODOS os componentes a implementar no User Prompt 2
    * Para cada componente, descreva em uma linha:

      * Nome do arquivo e caminho
      * Responsabilidade principal
      * Quais Contexts ele consome
      * Quais endpoints ele aciona (direta ou indiretamente)
    * Organize por módulo: Páginas, Layout, Tasks, Modals, UI

Não gere nenhum componente visual (páginas, modais, cards, sidebar) nesta entrega. Apenas a infraestrutura listada acima.

**Critério de Aceitação:**
Esta entrega estará completa quando a infraestrutura de build estiver na raiz, o App.jsx com PrivateRoute, imports das páginas, os quatro Contexts (Auth, Project, Tag, Toast), o api.js com interceptor JWT, o global.css e o COMPONENTS.md estiverem implementados.

### 

