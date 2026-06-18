# Contrato da API - SGT (Sistema de Gerenciamento de Tarefas)

Este documento atua como o handoff para o Agente Frontend. Ele descreve todos os endpoints da API REST, os payloads aceitos e os retornos esperados, bem como os padrões de autenticação.

## Autenticação

A API utiliza JSON Web Tokens (JWT) sem estado (stateless).
*   **Obtenção do Token**: Endpoint de Login (`POST /api/auth/login`).
*   **Envio nas Requisições**: O token deve ser enviado no cabeçalho de todas as rotas protegidas:
    ```http
    Authorization: Bearer <seu_token_jwt>
    ```
*   **Expiração**: O token expira em **24 horas**. Após a expiração, requisições para rotas protegidas retornarão HTTP **401 Unauthorized** com o seguinte corpo:
    ```json
    { "erro": "Sessão expirada. Faça login novamente" }
    ```

---

## Módulo de Autenticação

### 1. Registrar Usuário (RF01)
*   **Método/Path**: `POST /api/auth/registro`
*   **Acesso**: Público
*   **Payload (Request)**:
    ```json
    {
      "nome": "João da Silva",
      "email": "joao@email.com",
      "senha": "senha_segura"
    }
    ```
*   **Respostas**:
    *   `201 Created`: Usuário registrado. Retorna o usuário sem a senha.
    *   `400 Bad Request`: `{ "erro": "Nome inválido ou excede 100 caracteres" }`
    *   `400 Bad Request`: `{ "erro": "Senha deve conter no mínimo 6 caracteres" }`
    *   `409 Conflict`: `{ "erro": "E-mail já cadastrado" }`

### 2. Login (RF02)
*   **Método/Path**: `POST /api/auth/login`
*   **Acesso**: Público
*   **Payload (Request)**:
    ```json
    {
      "email": "joao@email.com",
      "senha": "senha_segura"
    }
    ```
*   **Respostas**:
    *   `200 OK`: 
        ```json
        { "token": "eyJhbGciOiJIUzI1NiIsInR5..." }
        ```
    *   `401 Unauthorized`: `{ "erro": "E-mail ou senha incorretos" }`

### 3. Logout (RF03)
*   **Método/Path**: `POST /api/auth/logout`
*   **Acesso**: Público (simbólico, o Frontend deve descartar o Token)
*   **Respostas**:
    *   `200 OK`: `{ "mensagem": "Logout realizado com sucesso" }`

---

## Módulo de Projetos

> **Nota**: Todas as rotas daqui para frente exigem o header `Authorization: Bearer <token>`.

### 4. Criar Projeto (RF04)
*   **Método/Path**: `POST /api/projetos`
*   **Payload (Request)**:
    ```json
    {
      "nome": "Projeto TCC",
      "descricao": "Desenvolvimento do TCC"
    }
    ```
*   **Respostas**:
    *   `201 Created`: Retorna o objeto do projeto criado.
    *   `400 Bad Request`: `{ "erro": "O nome do projeto deve conter pelo menos 3 caracteres" }`

### 5. Listar Projetos (RF05)
*   **Método/Path**: `GET /api/projetos`
*   **Respostas**:
    *   `200 OK`: 
        ```json
        [
          {
            "id_projeto": 1,
            "nome": "Projeto TCC",
            "descricao": "Desenvolvimento do TCC",
            "criado_em": "2026-05-25T15:00:00Z"
          }
        ]
        ```

### 6. Editar Projeto (RF06)
*   **Método/Path**: `PUT /api/projetos/:id`
*   **Payload (Request)**: Igual ao de criação.
*   **Respostas**:
    *   `200 OK`: Projeto atualizado.
    *   `404 Not Found`: `{ "erro": "Projeto não encontrado" }`

### 7. Excluir Projeto (RF07)
*   **Método/Path**: `DELETE /api/projetos/:id`
*   **Respostas**:
    *   `200 OK`: `{ "mensagem": "Projeto excluído com sucesso" }`
    *   `404 Not Found`: `{ "erro": "Projeto não encontrado" }`

---

## Módulo de Tags

### 8. Criar Tag (RF12)
*   **Método/Path**: `POST /api/tags`
*   **Payload (Request)**:
    ```json
    {
      "nome": "Urgente"
    }
    ```
*   **Respostas**:
    *   `201 Created`: Retorna a tag criada.
    *   `400 Bad Request`: `{ "erro": "Nome de tag inválido" }`
    *   `409 Conflict`: `{ "erro": "Tag já existe" }`

### 9. Listar Tags (RF12)
*   **Método/Path**: `GET /api/tags`
*   **Respostas**:
    *   `200 OK`: Array de tags do usuário (ordenadas alfabeticamente).

### 10. Editar Tag (RF12)
*   **Método/Path**: `PUT /api/tags/:id`
*   **Payload**: `{"nome": "Muito Urgente"}`
*   **Respostas**: `200 OK`, `404 Not Found`, `409 Conflict`.

### 11. Excluir Tag (RF12)
*   **Método/Path**: `DELETE /api/tags/:id`
*   **Respostas**: `200 OK` ou `404 Not Found`.

---

## Módulo de Tarefas

### 12. Criar Tarefa (RF08 + RF13)
*   **Método/Path**: `POST /api/tarefas/projeto/:projetoId`
*   **Payload (Request)**:
    ```json
    {
      "titulo": "Pesquisar Referências",
      "descricao": "Ler artigos IEEE",
      "data_conclusao": "2026-06-01",
      "tags": [1, 2] 
    }
    ```
    *Nota: `tags` e `data_conclusao` são opcionais.*
*   **Respostas**:
    *   `201 Created`: Tarefa criada (tags são associadas no banco).
    *   `400 Bad Request`: `{ "erro": "Título inválido" }` ou `"Data inválida"`.
    *   `403 Forbidden`: `{ "erro": "Acesso negado. A tag não pertence a este usuário" }`

### 13. Editar Tarefa (RF09)
*   **Método/Path**: `PUT /api/tarefas/:id`
*   **Payload**: Igual ao de criação.
*   **Respostas**: `200 OK`, `400 Bad Request`, `403 Forbidden`, `404 Not Found`.

### 14. Excluir Tarefa (RF10)
*   **Método/Path**: `DELETE /api/tarefas/:id`
*   **Respostas**: `200 OK`, `404 Not Found`.

### 15. Alterar Status (RF11)
*   **Método/Path**: `PATCH /api/tarefas/:id/status`
*   **Payload (Request)**:
    ```json
    { "status": "Em Andamento" }
    ```
*   **Respostas**:
    *   `200 OK`: Status alterado.
    *   `400 Bad Request`: `{ "erro": "Transição de status inválida" }` (se ferir as regras bidirecionais).

### 16. Listar, Filtrar e Ordenar Tarefas (RF14)
*   **Método/Path**: `GET /api/tarefas/projeto/:projetoId`
*   **Query Params (Filtros)**:
    *   `status`: Múltiplos permitidos (`?status=Pendente&status=Em Andamento`).
    *   `tags`: Múltiplas permitidas (`?tags=1&tags=2` -> aplica **AND** lógico estrito).
    *   `ordenacao`: Valores aceitos: `data_asc`, `data_desc`, `alfa_asc`, `alfa_desc`. (Padrão: `data_asc`).
*   **Respostas**:
    *   `200 OK`: Array de tarefas filtradas/ordenadas. (Array vazio `[]` se nenhuma for encontrada).

### 17. Associar Tags à Tarefa Diretamente (RF13)
*   **Método/Path**: `PUT /api/tarefas/:tarefaId/tags`
*   **Payload (Request)**:
    ```json
    { "tags": [1, 3] }
    ```
*   **Respostas**:
    *   `200 OK`: `{ "mensagem": "Tags associadas com sucesso" }`
    *   `403 Forbidden`: `{ "erro": "Acesso negado. A tag não pertence a este usuário" }`

---

## Quadro Resumo

| Método | Path | RF | Descrição |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/registro` | RF01 | Registra usuário e gera hash da senha. |
| `POST` | `/api/auth/login` | RF02 | Autentica usuário e retorna JWT de 24h. |
| `POST` | `/api/auth/logout` | RF03 | Encerramento simbólico da sessão (Frontend apaga token). |
| `POST` | `/api/projetos` | RF04 | Cria projeto para o usuário autenticado. |
| `GET` | `/api/projetos` | RF05 | Lista projetos do usuário autenticado. |
| `PUT` | `/api/projetos/:id` | RF06 | Edita o projeto especificado. |
| `DELETE` | `/api/projetos/:id` | RF07 | Exclui projeto e suas tarefas em cascata. |
| `POST` | `/api/tags` | RF12 | Cria tag para o usuário. |
| `GET` | `/api/tags` | RF12 | Lista tags do usuário. |
| `PUT` | `/api/tags/:id` | RF12 | Edita tag do usuário. |
| `DELETE` | `/api/tags/:id` | RF12 | Exclui tag, mantendo tarefas intactas. |
| `POST` | `/api/tarefas/projeto/:projetoId` | RF08,13 | Cria tarefa em um projeto (aceita e associa tags). |
| `GET` | `/api/tarefas/projeto/:projetoId` | RF14 | Lista tarefas de um projeto com filtros/ordenação dinâmicos. |
| `PUT` | `/api/tarefas/:id` | RF09 | Edita os dados de uma tarefa e atualiza as tags vinculadas. |
| `DELETE` | `/api/tarefas/:id` | RF10 | Exclui uma tarefa permanentemente. |
| `PATCH` | `/api/tarefas/:id/status` | RF11 | Altera o status da tarefa respeitando as regras estritas. |
| `PUT` | `/api/tarefas/:tarefaId/tags` | RF13 | Sobrescreve as tags associadas a uma tarefa. |
