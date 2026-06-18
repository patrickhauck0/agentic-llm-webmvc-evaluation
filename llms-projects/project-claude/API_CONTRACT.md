# API Contract — SGT (Sistema de Gerenciamento de Tarefas)

> **Documento de Handoff para o Agente Frontend.**
> Este contrato define todos os endpoints, payloads e respostas da API REST do SGT.

---

## Base URL

```
http://localhost:3000/api
```

---

## Esquema de Autenticação

| Item | Detalhes |
|------|----------|
| Tipo | Bearer Token (JWT) |
| Obtenção | Endpoint `POST /api/auth/login` (RF02) |
| Envio | Header `Authorization: Bearer <token>` |
| Expiração | **24 horas** após emissão |
| Payload do Token | `{ id_usuario: number }` |
| Erro de token ausente/inválido/expirado | HTTP **401** — `{ "erro": "Sessão expirada. Faça login novamente" }` |

### Fluxo de Autenticação

1. O usuário se registra via `POST /api/auth/registro` (RF01)
2. O usuário faz login via `POST /api/auth/login` (RF02) e recebe um `token`
3. Todas as requisições subsequentes (exceto registro e login) devem incluir o header:
   ```
   Authorization: Bearer <token>
   ```
4. Quando o token expira (após 24h), qualquer requisição protegida retorna HTTP 401
5. O frontend deve redirecionar o usuário para a tela de login e descartar o token localmente

---

## Módulo de Autenticação

### POST `/api/auth/registro` — RF01: Cadastro de Usuário

**Acesso:** Público (sem JWT)

**Request Body:**
```json
{
  "nome": "Patrick Silva",
  "email": "patrick@email.com",
  "senha": "123456"
}
```

| Campo | Tipo | Obrigatório | Validação |
|-------|------|-------------|-----------|
| nome | string | Sim | Máximo 100 caracteres |
| email | string | Sim | Formato válido, máximo 255 caracteres, único |
| senha | string | Sim | Mínimo 6 caracteres |

**Response 201 — Sucesso:**
```json
{
  "mensagem": "Usuário criado com sucesso",
  "usuario": {
    "id_usuario": 1,
    "nome": "Patrick Silva",
    "email": "patrick@email.com",
    "criado_em": "2026-05-22T16:00:00.000Z"
  }
}
```

**Erros:**

| Status | Condição | Corpo |
|--------|----------|-------|
| 400 | Nome vazio | `{ "erro": "Nome é obrigatório" }` |
| 400 | Nome > 100 chars | `{ "erro": "Nome deve conter no máximo 100 caracteres" }` |
| 400 | E-mail inválido | `{ "erro": "E-mail inválido" }` |
| 400 | Senha < 6 chars | `{ "erro": "Senha deve conter no mínimo 6 caracteres" }` |
| 409 | E-mail já cadastrado | `{ "erro": "E-mail já cadastrado" }` |

---

### POST `/api/auth/login` — RF02: Login e Sessão

**Acesso:** Público (sem JWT)

**Request Body:**
```json
{
  "email": "patrick@email.com",
  "senha": "123456"
}
```

| Campo | Tipo | Obrigatório |
|-------|------|-------------|
| email | string | Sim |
| senha | string | Sim |

**Response 200 — Sucesso:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "usuario": {
    "id_usuario": 1,
    "nome": "Patrick Silva",
    "email": "patrick@email.com"
  }
}
```

**Erros:**

| Status | Condição | Corpo |
|--------|----------|-------|
| 401 | E-mail não encontrado | `{ "erro": "E-mail ou senha incorretos" }` |
| 401 | Senha incorreta | `{ "erro": "E-mail ou senha incorretos" }` |
| 401 | Campos vazios | `{ "erro": "E-mail ou senha incorretos" }` |

---

### POST `/api/auth/logout` — RF03: Logout

**Acesso:** Protegido (JWT obrigatório)

**Request Body:** Nenhum

**Response 200 — Sucesso:**
```json
{
  "mensagem": "Logout realizado com sucesso"
}
```

> O descarte do token é responsabilidade do frontend (remover do localStorage/estado).

---

## Módulo de Projetos

### POST `/api/projetos` — RF04: Criar Projeto

**Acesso:** Protegido (JWT obrigatório)

**Request Body:**
```json
{
  "nome": "Meu Projeto TCC",
  "descricao": "Projeto para o trabalho de conclusão de curso"
}
```

| Campo | Tipo | Obrigatório | Validação |
|-------|------|-------------|-----------|
| nome | string | Sim | 3–100 caracteres |
| descricao | string | Não | Texto livre |

**Response 201 — Sucesso:**
```json
{
  "id_projeto": 1,
  "nome": "Meu Projeto TCC",
  "descricao": "Projeto para o trabalho de conclusão de curso",
  "id_usuario": 1,
  "criado_em": "2026-05-22T16:00:00.000Z"
}
```

**Erros:**

| Status | Condição | Corpo |
|--------|----------|-------|
| 400 | Nome < 3 chars ou vazio | `{ "erro": "O nome do projeto deve conter pelo menos 3 caracteres" }` |
| 400 | Nome > 100 chars | `{ "erro": "O nome do projeto deve conter no máximo 100 caracteres" }` |
| 401 | Token inválido/expirado | `{ "erro": "Sessão expirada. Faça login novamente" }` |

---

### GET `/api/projetos` — RF05: Listar Projetos

**Acesso:** Protegido (JWT obrigatório)

**Request Body:** Nenhum

**Response 200 — Sucesso:**
```json
[
  {
    "id_projeto": 1,
    "nome": "Meu Projeto TCC",
    "descricao": "Projeto para o trabalho de conclusão de curso",
    "id_usuario": 1,
    "criado_em": "2026-05-22T16:00:00.000Z"
  },
  {
    "id_projeto": 2,
    "nome": "Projeto Pessoal",
    "descricao": null,
    "id_usuario": 1,
    "criado_em": "2026-05-22T17:00:00.000Z"
  }
]
```

> Retorna `[]` (array vazio) se o usuário não tiver projetos. Ordenado por `criado_em DESC`.

---

### PUT `/api/projetos/:id` — RF06: Editar Projeto

**Acesso:** Protegido (JWT obrigatório)

**Parâmetros de Rota:**

| Param | Tipo | Descrição |
|-------|------|-----------|
| id | number | `id_projeto` do projeto |

**Request Body:**
```json
{
  "nome": "Projeto TCC Atualizado",
  "descricao": "Nova descrição do projeto"
}
```

| Campo | Tipo | Obrigatório | Validação |
|-------|------|-------------|-----------|
| nome | string | Sim | 3–100 caracteres |
| descricao | string | Não | Texto livre |

**Response 200 — Sucesso:**
```json
{
  "id_projeto": 1,
  "nome": "Projeto TCC Atualizado",
  "descricao": "Nova descrição do projeto",
  "id_usuario": 1,
  "criado_em": "2026-05-22T16:00:00.000Z"
}
```

**Erros:**

| Status | Condição | Corpo |
|--------|----------|-------|
| 400 | Nome < 3 chars | `{ "erro": "O nome do projeto deve conter pelo menos 3 caracteres" }` |
| 403 | Projeto não pertence ao usuário | `{ "erro": "Acesso negado" }` |
| 404 | Projeto não encontrado | `{ "erro": "Projeto não encontrado" }` |

---

### DELETE `/api/projetos/:id` — RF07: Excluir Projeto

**Acesso:** Protegido (JWT obrigatório)

**Parâmetros de Rota:**

| Param | Tipo | Descrição |
|-------|------|-----------|
| id | number | `id_projeto` do projeto |

**Request Body:** Nenhum

**Response 200 — Sucesso:**
```json
{
  "mensagem": "Projeto excluído com sucesso"
}
```

> **Cascata automática**: Ao excluir um projeto, todas as tarefas filhas e suas associações em `tarefa_tag` são removidas automaticamente pelo banco de dados.

**Erros:**

| Status | Condição | Corpo |
|--------|----------|-------|
| 403 | Projeto não pertence ao usuário | `{ "erro": "Acesso negado" }` |
| 404 | Projeto não encontrado | `{ "erro": "Projeto não encontrado" }` |

---

## Módulo de Tarefas

### POST `/api/projetos/:projetoId/tarefas` — RF08: Criar Tarefa

**Acesso:** Protegido (JWT obrigatório)

**Parâmetros de Rota:**

| Param | Tipo | Descrição |
|-------|------|-----------|
| projetoId | number | `id_projeto` do projeto |

**Request Body:**
```json
{
  "titulo": "Escrever introdução do TCC",
  "descricao": "Redigir os primeiros capítulos",
  "data_conclusao": "2026-06-15",
  "tags": [1, 3]
}
```

| Campo | Tipo | Obrigatório | Validação |
|-------|------|-------------|-----------|
| titulo | string | Sim | 3–150 caracteres |
| descricao | string | Não | Texto livre |
| data_conclusao | string | Não | Formato `YYYY-MM-DD` |
| tags | number[] | Não | Array de `id_tag` do usuário |

**Response 201 — Sucesso:**
```json
{
  "id_tarefa": 1,
  "titulo": "Escrever introdução do TCC",
  "descricao": "Redigir os primeiros capítulos",
  "status": "Pendente",
  "data_conclusao": "2026-06-15",
  "id_projeto": 1,
  "criado_em": "2026-05-22T16:00:00.000Z",
  "tags": [
    { "id_tag": 1, "nome": "Urgente" },
    { "id_tag": 3, "nome": "TCC" }
  ]
}
```

> O `status` é sempre `"Pendente"` na criação. Se `tags` não for enviado, `tags` retorna `[]`.

**Erros:**

| Status | Condição | Corpo |
|--------|----------|-------|
| 400 | Título < 3 chars ou vazio | `{ "erro": "Título inválido" }` |
| 400 | Data em formato incorreto | `{ "erro": "Data inválida" }` |
| 403 | Projeto não pertence ao usuário | `{ "erro": "Acesso negado" }` |
| 403 | Tag não pertence ao usuário | `{ "erro": "Acesso negado. A tag não pertence a este usuário" }` |
| 404 | Projeto não encontrado | `{ "erro": "Projeto não encontrado" }` |

---

### GET `/api/projetos/:projetoId/tarefas` — RF14: Listar Tarefas (com filtros)

**Acesso:** Protegido (JWT obrigatório)

**Parâmetros de Rota:**

| Param | Tipo | Descrição |
|-------|------|-----------|
| projetoId | number | `id_projeto` do projeto |

**Query Parameters:**

| Param | Tipo | Descrição | Exemplo |
|-------|------|-----------|---------|
| status | string ou string[] | Filtro por status (múltipla escolha) | `?status=Pendente&status=Em Andamento` |
| tags | number ou number[] | Filtro por tags (**AND lógico estrito**) | `?tags=1&tags=3` |
| ordenar | string | Campo de ordenação: `data_conclusao` (padrão) ou `titulo` | `?ordenar=titulo` |
| direcao | string | Direção: `ASC` (padrão) ou `DESC` | `?direcao=DESC` |

> **AND Lógico Estrito para Tags**: Se `tags=1&tags=3`, somente tarefas que possuem **AMBAS** as tags 1 e 3 serão retornadas.

> **Ordenação padrão**: `data_conclusao ASC` com tarefas sem data por último (`NULLS LAST`).

**Response 200 — Sucesso:**
```json
[
  {
    "id_tarefa": 1,
    "titulo": "Escrever introdução do TCC",
    "descricao": "Redigir os primeiros capítulos",
    "status": "Pendente",
    "data_conclusao": "2026-06-15",
    "id_projeto": 1,
    "criado_em": "2026-05-22T16:00:00.000Z",
    "tags": [
      { "id_tag": 1, "nome": "Urgente" },
      { "id_tag": 3, "nome": "TCC" }
    ]
  }
]
```

> Retorna `[]` (array vazio) se nenhuma tarefa corresponder aos filtros. A mensagem de empty state é tratada no frontend.

---

### PUT `/api/tarefas/:id` — RF09: Editar Tarefa

**Acesso:** Protegido (JWT obrigatório)

**Parâmetros de Rota:**

| Param | Tipo | Descrição |
|-------|------|-----------|
| id | number | `id_tarefa` da tarefa |

**Request Body:**
```json
{
  "titulo": "Título atualizado",
  "descricao": "Nova descrição",
  "data_conclusao": "2026-07-01",
  "tags": [2, 4]
}
```

| Campo | Tipo | Obrigatório | Validação |
|-------|------|-------------|-----------|
| titulo | string | Sim | 3–150 caracteres |
| descricao | string | Não | Texto livre |
| data_conclusao | string | Não | Formato `YYYY-MM-DD` |
| tags | number[] | Não | Se enviado, sincroniza tags. Se `[]`, remove todas. Se ausente, mantém as existentes. |

**Response 200 — Sucesso:**
```json
{
  "id_tarefa": 1,
  "titulo": "Título atualizado",
  "descricao": "Nova descrição",
  "status": "Pendente",
  "data_conclusao": "2026-07-01",
  "id_projeto": 1,
  "criado_em": "2026-05-22T16:00:00.000Z",
  "tags": [
    { "id_tag": 2, "nome": "Faculdade" },
    { "id_tag": 4, "nome": "Revisão" }
  ]
}
```

**Erros:**

| Status | Condição | Corpo |
|--------|----------|-------|
| 400 | Título < 3 chars | `{ "erro": "Título inválido" }` |
| 400 | Data inválida | `{ "erro": "Data inválida" }` |
| 403 | Tarefa não pertence ao usuário | `{ "erro": "Acesso negado" }` |
| 403 | Tag não pertence ao usuário | `{ "erro": "Acesso negado. A tag não pertence a este usuário" }` |
| 404 | Tarefa não encontrada | `{ "erro": "Tarefa não encontrada" }` |

---

### DELETE `/api/tarefas/:id` — RF10: Excluir Tarefa

**Acesso:** Protegido (JWT obrigatório)

**Parâmetros de Rota:**

| Param | Tipo | Descrição |
|-------|------|-----------|
| id | number | `id_tarefa` da tarefa |

**Request Body:** Nenhum

**Response 200 — Sucesso:**
```json
{
  "mensagem": "Tarefa excluída com sucesso"
}
```

> A exclusão remove automaticamente as associações em `tarefa_tag`. As tags permanecem intactas.

**Erros:**

| Status | Condição | Corpo |
|--------|----------|-------|
| 403 | Tarefa não pertence ao usuário | `{ "erro": "Acesso negado" }` |
| 404 | Tarefa não encontrada | `{ "erro": "Tarefa não encontrada" }` |

---

### PATCH `/api/tarefas/:id/status` — RF11: Alterar Status

**Acesso:** Protegido (JWT obrigatório)

**Parâmetros de Rota:**

| Param | Tipo | Descrição |
|-------|------|-----------|
| id | number | `id_tarefa` da tarefa |

**Request Body:**
```json
{
  "status": "Em Andamento"
}
```

| Campo | Tipo | Obrigatório | Valores Válidos |
|-------|------|-------------|-----------------|
| status | string | Sim | `"Pendente"`, `"Em Andamento"`, `"Concluída"` |

**Transições Válidas:**

```
Pendente ↔ Em Andamento ↔ Concluída
```

| De | Para | Permitido? |
|----|------|------------|
| Pendente | Em Andamento | ✅ |
| Em Andamento | Pendente | ✅ |
| Em Andamento | Concluída | ✅ |
| Concluída | Em Andamento | ✅ |
| Pendente | Concluída | ❌ |
| Concluída | Pendente | ❌ |

**Response 200 — Sucesso:**
```json
{
  "id_tarefa": 1,
  "titulo": "Escrever introdução do TCC",
  "descricao": "Redigir os primeiros capítulos",
  "status": "Em Andamento",
  "data_conclusao": "2026-06-15",
  "id_projeto": 1,
  "criado_em": "2026-05-22T16:00:00.000Z"
}
```

**Erros:**

| Status | Condição | Corpo |
|--------|----------|-------|
| 400 | Transição não permitida | `{ "erro": "Transição de status inválida" }` |
| 403 | Tarefa não pertence ao usuário | `{ "erro": "Acesso negado" }` |
| 404 | Tarefa não encontrada | `{ "erro": "Tarefa não encontrada" }` |

---

## Módulo de Tags

### POST `/api/tags` — RF12: Criar Tag

**Acesso:** Protegido (JWT obrigatório)

**Request Body:**
```json
{
  "nome": "Urgente"
}
```

| Campo | Tipo | Obrigatório | Validação |
|-------|------|-------------|-----------|
| nome | string | Sim | Máximo 20 caracteres, único por usuário |

**Response 201 — Sucesso:**
```json
{
  "id_tag": 1,
  "nome": "Urgente",
  "id_usuario": 1
}
```

**Erros:**

| Status | Condição | Corpo |
|--------|----------|-------|
| 400 | Nome vazio | `{ "erro": "Nome da tag é obrigatório" }` |
| 400 | Nome > 20 chars | `{ "erro": "Nome da tag deve conter no máximo 20 caracteres" }` |
| 409 | Tag duplicada para o mesmo usuário | `{ "erro": "Tag já existe" }` |

---

### GET `/api/tags` — RF12: Listar Tags

**Acesso:** Protegido (JWT obrigatório)

**Request Body:** Nenhum

**Response 200 — Sucesso:**
```json
[
  { "id_tag": 1, "nome": "Urgente", "id_usuario": 1 },
  { "id_tag": 2, "nome": "Faculdade", "id_usuario": 1 },
  { "id_tag": 3, "nome": "TCC", "id_usuario": 1 }
]
```

> Retorna `[]` se o usuário não tiver tags. Ordenado por `nome ASC`.

---

### PUT `/api/tags/:id` — RF12: Editar Tag

**Acesso:** Protegido (JWT obrigatório)

**Parâmetros de Rota:**

| Param | Tipo | Descrição |
|-------|------|-----------|
| id | number | `id_tag` da tag |

**Request Body:**
```json
{
  "nome": "Importante"
}
```

| Campo | Tipo | Obrigatório | Validação |
|-------|------|-------------|-----------|
| nome | string | Sim | Máximo 20 caracteres, único por usuário |

**Response 200 — Sucesso:**
```json
{
  "id_tag": 1,
  "nome": "Importante",
  "id_usuario": 1
}
```

**Erros:**

| Status | Condição | Corpo |
|--------|----------|-------|
| 400 | Nome vazio | `{ "erro": "Nome da tag é obrigatório" }` |
| 400 | Nome > 20 chars | `{ "erro": "Nome da tag deve conter no máximo 20 caracteres" }` |
| 403 | Tag não pertence ao usuário | `{ "erro": "Acesso negado" }` |
| 404 | Tag não encontrada | `{ "erro": "Tag não encontrada" }` |
| 409 | Novo nome já existe para o usuário | `{ "erro": "Tag já existe" }` |

---

### DELETE `/api/tags/:id` — RF12: Excluir Tag

**Acesso:** Protegido (JWT obrigatório)

**Parâmetros de Rota:**

| Param | Tipo | Descrição |
|-------|------|-----------|
| id | number | `id_tag` da tag |

**Request Body:** Nenhum

**Response 200 — Sucesso:**
```json
{
  "mensagem": "Tag excluída com sucesso"
}
```

> A exclusão remove automaticamente as associações em `tarefa_tag`. As **tarefas permanecem intactas**.

**Erros:**

| Status | Condição | Corpo |
|--------|----------|-------|
| 403 | Tag não pertence ao usuário | `{ "erro": "Acesso negado" }` |
| 404 | Tag não encontrada | `{ "erro": "Tag não encontrada" }` |

---

### PUT `/api/tarefas/:tarefaId/tags` — RF13: Associar Tags à Tarefa

**Acesso:** Protegido (JWT obrigatório)

**Parâmetros de Rota:**

| Param | Tipo | Descrição |
|-------|------|-----------|
| tarefaId | number | `id_tarefa` da tarefa |

**Request Body:**
```json
{
  "tags": [1, 3, 5]
}
```

| Campo | Tipo | Obrigatório | Validação |
|-------|------|-------------|-----------|
| tags | number[] | Sim | Array de `id_tag`. Enviar `[]` para remover todas. |

> **Comportamento**: Remove **todos** os vínculos anteriores e insere os novos. É uma operação de **sincronização completa**.

> **Regra Crítica**: Todas as tags da lista devem pertencer ao `id_usuario` da sessão. Se **qualquer** tag falhar na verificação, a operação inteira é abortada.

**Response 200 — Sucesso:**
```json
{
  "id_tarefa": 1,
  "tags": [
    { "id_tag": 1, "nome": "Urgente" },
    { "id_tag": 3, "nome": "TCC" },
    { "id_tag": 5, "nome": "Prioridade" }
  ]
}
```

**Erros:**

| Status | Condição | Corpo |
|--------|----------|-------|
| 403 | Tarefa não pertence ao usuário | `{ "erro": "Acesso negado" }` |
| 403 | Tag não pertence ao usuário | `{ "erro": "Acesso negado. A tag não pertence a este usuário" }` |
| 404 | Tarefa não encontrada | `{ "erro": "Tarefa não encontrada" }` |

---

## Códigos de Status HTTP Globais

| Status | Significado |
|--------|-------------|
| 200 | Operação realizada com sucesso |
| 201 | Recurso criado com sucesso |
| 400 | Erro de validação (dados inválidos) |
| 401 | Não autenticado (token ausente, inválido ou expirado) |
| 403 | Acesso negado (recurso não pertence ao usuário) |
| 404 | Recurso não encontrado |
| 409 | Conflito (recurso duplicado) |
| 500 | Erro interno do servidor |

---

## Quadro Resumo de Endpoints

| Método | Path | RF | Descrição | Acesso |
|--------|------|----|-----------|--------|
| POST | `/api/auth/registro` | RF01 | Cadastro de usuário | Público |
| POST | `/api/auth/login` | RF02 | Login (retorna JWT) | Público |
| POST | `/api/auth/logout` | RF03 | Logout (simbólico) | Protegido |
| POST | `/api/projetos` | RF04 | Criar projeto | Protegido |
| GET | `/api/projetos` | RF05 | Listar projetos do usuário | Protegido |
| PUT | `/api/projetos/:id` | RF06 | Editar projeto | Protegido |
| DELETE | `/api/projetos/:id` | RF07 | Excluir projeto (cascade) | Protegido |
| POST | `/api/projetos/:projetoId/tarefas` | RF08 | Criar tarefa em um projeto | Protegido |
| PUT | `/api/tarefas/:id` | RF09 | Editar tarefa | Protegido |
| DELETE | `/api/tarefas/:id` | RF10 | Excluir tarefa | Protegido |
| PATCH | `/api/tarefas/:id/status` | RF11 | Alterar status da tarefa | Protegido |
| POST | `/api/tags` | RF12 | Criar tag | Protegido |
| GET | `/api/tags` | RF12 | Listar tags do usuário | Protegido |
| PUT | `/api/tags/:id` | RF12 | Editar tag | Protegido |
| DELETE | `/api/tags/:id` | RF12 | Excluir tag (cascade em tarefa_tag) | Protegido |
| PUT | `/api/tarefas/:tarefaId/tags` | RF13 | Associar tags à tarefa | Protegido |
| GET | `/api/projetos/:projetoId/tarefas` | RF14 | Listar tarefas com filtros | Protegido |
