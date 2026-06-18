### User Prompt 2 — Agente Frontend

Com base na estrutura de rotas, Contexts e api.js que você definiu acima, implemente agora todos os componentes listados em COMPONENTS.md.

**Importante:** O output completo desta conversa (infraestrutura + componentes) será injetado no Agente Revisor. Cada arquivo deve ter caminho explícito. Todos os textos da interface devem estar em Português do Brasil (PT-BR). Não use nenhuma biblioteca de UI externa — apenas CSS puro. Antes de implementar o CSS de cada componente, consulte o MCP Figma para obter as especificações visuais exatas (cores, espaçamentos, tipografia).



Antes de implementar o CSS de qualquer componente, **utilize suas ferramentas do Figma MCP (informando a File Key do projeto) para ler a estrutura e os nós do design**. Extraia de forma autônoma as variáveis de cores (ex: códigos hexadecimais de sucesso, erro, status pendente), a família de fontes e os espaçamentos exatos do layout. **Só comece a gerar o código React após ter esse contexto visual em sua memória.**



**Arquivos obrigatórios desta entrega (gere todos):**

**Páginas:**

1. **`src/pages/Login.jsx`** + **`src/pages/Login.css`**

   * Formulário centralizado na tela com campos "E-mail" e "Senha"
   * Botão primário "Entrar" que chama `login()` do AuthContext
   * Validação inline: exibir mensagens de erro da API nos campos ou via Toast
   * Link "Não tem uma conta? Cadastre-se" que navega para `/cadastro`
2. **`src/pages/Cadastro.jsx`** + **`src/pages/Cadastro.css`**

   * Formulário com campos "Nome" (*), "E-mail" (*) e "Senha" (\*) com asterisco vermelho nos obrigatórios
   * Botão primário "Cadastrar" com Spinner durante a requisição
   * Validação inline com mensagens de erro em PT-BR
   * Link "Já tem uma conta? Entrar" que navega para `/login`
   * Após cadastro bem-sucedido: redirecionar para `/login`
3. **`src/pages/Dashboard.jsx`** + **`src/pages/Dashboard.css`**

   * Layout responsivo:

     * Desktop: Sidebar fixa à esquerda + Área Principal à direita
     * Mobile (max-width: 768px): Sidebar ocultada, acessível via ícone hambúrguer no Header
   * Compõe: Header + Sidebar + Área de Tarefas (TaskList)
   * Se nenhum projeto estiver selecionado, exibir Empty State: "Você ainda não possui projetos. Crie um projeto no menu lateral."
   * O componente deve possuir um ciclo de vida de montagem que chame as funções de carregamento inicial de dados do Contexto para popular a aplicação assim que o usuário acessa o painel.

**Componentes de Layout:**

4. **`src/components/Layout/Header.jsx`** + **`src/components/Layout/Header.css`**

   * Saudação: "Olá, \[nome do usuário]" usando dados do AuthContext
   * Botão/link "Sair" que chama `logout()` do AuthContext
   * Em mobile: ícone hambúrguer que alterna a visibilidade da Sidebar
5. **`src/components/Layout/Sidebar.jsx`** + **`src/components/Layout/Sidebar.css`**

   * Título: "Meus Projetos"
   * Lista vertical de projetos do ProjectContext
   * Projeto selecionado com destaque visual (fundo diferente, borda lateral)
   * Hover sobre um projeto revela ícones de Editar (abre ProjectModal) e Excluir (abre ConfirmModal)
   * Botão fixo inferior: "+ Novo Projeto" que abre o ProjectModal em modo criação
   * Clicar em um projeto seleciona-o no ProjectContext e carrega suas tarefas
   * Ao clicar em um projeto deve limpar o estado local de `tarefas` ANTES de invocar o carregamento das novas tarefas.

**Componentes de Tarefas:**

6. **`src/components/Tasks/TaskList.jsx`** + **`src/components/Tasks/TaskList.css`**

   * Título: nome do projeto selecionado
   * **Barra de Ferramentas** contendo:

     * Dropdown multi-select de **Status**: opções "Pendente", "Em Andamento", "Concluída" (múltipla escolha, lógica OR)
     * Dropdown multi-select de **Tag**: opções carregadas do TagContext (múltipla escolha, **AND lógico estrito** — a tarefa deve ter TODAS as tags selecionadas)
     * Dropdown de **Ordenação**: "Data de Conclusão Crescente" (padrão), "Data de Conclusão Decrescente", "Ordem Alfabética Crescente", "Ordem Alfabética Decrescente"
     * Botão secundário "Gerenciar Tags" → abre TagModal
     * Botão primário "+ Nova Tarefa" → abre TaskModal em modo criação
     * Botão "Limpar Filtros" → reseta filtros de Status e Tag para vazio, ordenação para "Data de Conclusão Crescente"
   * **Lógica de filtragem e ordenação** (RF14):

     * Filtro de Status: se algum status selecionado, mostrar apenas tarefas com status correspondente (OR). Se nenhum selecionado, mostrar todas.
     * Filtro de Tag: se alguma tag selecionada, mostrar apenas tarefas que possuam **TODAS** as tags selecionadas simultaneamente (AND estrito). Se nenhuma selecionada, mostrar todas.
     * Ordenação por data: tarefas sem data de conclusão ficam por último. Padrão: crescente.
     * Essa filtragem pode ser feita localmente no frontend (filtrando o array de tarefas retornado pela API) ou via query params.
   * **Empty States obrigatórios** (renderizar conforme o caso):

     * Se nenhum projeto selecionado ou sem projetos: "Você ainda não possui projetos. Crie um projeto no menu lateral."
     * Se projeto selecionado mas sem tarefas: "Nenhuma tarefa cadastrada neste projeto."
     * Se filtros ativos sem resultados: "Nenhuma tarefa encontrada para os filtros selecionados."
   * Renderiza uma lista de `TaskCard` para cada tarefa
7. **`src/components/Tasks/TaskCard.jsx`** + **`src/components/Tasks/TaskCard.css`**

   * **Indicador circular de status** (clicável):

     * Cinza = "Pendente", Azul = "Em Andamento", Verde = "Concluída"
     * Clique no indicador avança o status: Pendente → Em Andamento → Concluída
     * Clique com Shift (ou botão direito, ou outro modificador) retrocede: Concluída → Em Andamento → Pendente
     * Transição direta Pendente ↔ Concluída é PROIBIDA (bloqueada pela API com HTTP 400)
     * Ao clicar, chama `PATCH /api/tarefas/:id/status` com o novo status
   * **Título da tarefa**
   * **Data de conclusão**: se a data já passou (comparar com `new Date()`), exibir em cor vermelha
   * **Badges de tags**: lista horizontal de badges com o nome de cada tag associada
   * **Botões de ação**:

     * Editar → abre TaskModal em modo edição, preenchido com os dados da tarefa
     * Excluir → abre ConfirmModal para confirmação

**Modais:**

8. **`src/components/Modals/ProjectModal.jsx`** + **`src/components/Modals/ProjectModal.css`**

   * Modo criação: título "Novo Projeto", campos vazios
   * Modo edição: título "Editar Projeto", campos preenchidos com dados do projeto
   * Campo "Nome" (\*) — obrigatório, asterisco vermelho no label
   * Campo "Descrição" — opcional, textarea
   * Botão de submissão com Spinner durante a requisição
   * Ao sucesso: fecha o modal, atualiza a lista de projetos no ProjectContext, exibe Toast de sucesso
   * Ao erro: exibe a mensagem de erro da API no Toast
9. **`src/components/Modals/TaskModal.jsx`** + **`src/components/Modals/TaskModal.css`**

   * Modo criação: título "Nova Tarefa", campos vazios
   * Modo edição: título "Editar Tarefa", campos preenchidos com dados da tarefa
   * Campo "Título" (\*) — obrigatório, asterisco vermelho
   * Campo "Descrição" — opcional, textarea
   * Campo "Data de Conclusão" — opcional, input type="date"
   * **Seletor de Tags**: lista de checkboxes ou multi-select com todas as tags do TagContext. O usuário pode selecionar zero ou mais tags para associar à tarefa.
   * Botão de submissão com Spinner
   * Ao criar: chama `POST /api/projetos/:projetoId/tarefas` com as tags selecionadas
   * Ao editar: chama `PUT /api/tarefas/:id` com as tags atualizadas
10. **`src/components/Modals/TagModal.jsx`** + **`src/components/Modals/TagModal.css`**

    * Título: "Gerenciar Tags"
    * Lista todas as tags do usuário (do TagContext)
    * Para cada tag: nome exibido + botão Editar + botão Excluir
    * Campo de input + botão "Criar Tag" para adicionar nova tag
    * Ao editar: transforma o nome em input editável inline ou abre sub-formulário
    * Ao excluir: abre ConfirmModal de confirmação
    * Validação: nome máximo 20 caracteres, nome em branco bloqueado
    * Mensagens de erro da API exibidas via Toast (ex: "Tag já existe")
11. **`src/components/Modals/ConfirmModal.jsx`** + **`src/components/Modals/ConfirmModal.css`**

    * Recebe via props: título, mensagem de confirmação, função `onConfirm`, função `onCancel`
    * Texto exemplo: "Tem certeza que deseja excluir este projeto? Esta ação não pode ser desfeita."
    * Botão "Cancelar" (neutro) e botão "Excluir" (vermelho, visualmente destrutivo)
    * Spinner no botão de confirmação durante a requisição

**Componentes de UI:**

12. **`src/components/UI/Toast.jsx`** + **`src/components/UI/Toast.css`**

    * Renderiza a fila de toasts do ToastContext
    * Posição fixa no canto superior direito da tela
    * Cada toast aparece com animação de entrada (slide-in)
    * Desaparece automaticamente após 3 segundos (já gerenciado pelo ToastContext)
    * Estilo visual: fundo verde para sucesso, fundo vermelho para erro
13. **`src/components/UI/Spinner.jsx`** + **`src/components/UI/Spinner.css`**

    * Componente inline que substitui o texto do botão durante carregamento
    * Animação CSS de rotação (border spinning)
    * Quando ativo, o botão pai deve ficar com `disabled={true}` para evitar cliques repetidos

**Regras finais obrigatórias:**

* Todos os textos visíveis ao usuário devem estar em **Português do Brasil (PT-BR)**. Nenhum texto em inglês na interface.
* Todos os campos obrigatórios devem ter **asterisco vermelho (\*)** no label.
* Todos os botões de submissão devem exibir **Spinner** durante requisições e ficar **desabilitados** até a resposta.
* Todas as mensagens de erro da API devem ser exibidas nos **Toasts** sem tradução (já vêm em PT-BR).
* Todas as exclusões devem passar pelo **ConfirmModal** com botão vermelho destrutivo.
* O CSS deve ser **puro** — sem bibliotecas externas. Cada componente tem seu próprio arquivo `.css`.
* A interface deve ser **responsiva**: duas colunas no desktop, hambúrguer no mobile.

**Critério de Aceitação:**
Esta entrega estará completa quando todos os componentes do COMPONENTS.md estiverem implementados, integrados via api.js, com todos os textos em PT-BR, o reset de tarefas ao trocar de projeto, os três Empty States presentes, a lógica AND estrita dos filtros do RF14 funcionando, e o indicador de status clicável do TaskCard implementado conforme RF11.

