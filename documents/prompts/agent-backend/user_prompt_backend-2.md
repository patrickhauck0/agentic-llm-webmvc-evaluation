### User Prompt 2 — Agente Backend

Com base no `database/schema.sql` que você gerou acima, implemente agora a API REST completa do SGT em Node.js com arquitetura MVC.

**Importante:** O output desta entrega será consumido pelo Agente Frontend. Ele precisará saber exatamente quais endpoints existem, quais payloads enviar e quais respostas esperar. Por isso, além do código, você deve gerar um arquivo `API_CONTRACT.md` que servirá como handoff para o próximo agente.

**Arquivos obrigatórios desta entrega (gere todos):**

1. **`package.json`**
   - O package.json deve incluir tanto os scripts do servidor (`"start": "node server.js"`, `"dev": "nodemon server.js"`) quanto o script do cliente (`"client": "vite"`) para que ambas as camadas (API e interface) possam ser executadas a partir da raiz do monorepo.
2. **`.env`**
   - Crie este arquivo na raiz contendo as variáveis obrigatórias: `PORT=3000`, `JWT_SECRET=super_secret_jwt_key_sgt_2026`, e a `DATABASE_URL` (formato: postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres).
   - Inclua um comentário no código orientando o usuário a substituir as credenciais.
3. **`server.js`**
   - Configuração do Express com middlewares `cors` e `express.json()`
   - Importação e registro de todas as rotas
   - Escuta na porta definida via variável de ambiente (PORT) ou 3000
   - **Regra Obrigatória:** Trate o evento de erro `'EADDRINUSE'` no servidor, exibindo uma mensagem clara de que a porta já está em uso e encerrando o processo com `process.exit(1)` ao invés de lançar uma exceção não tratada.
4. **`config/database.js`**
   - Pool de conexão PostgreSQL usando a biblioteca `pg`
   - Configuração via variável de ambiente DATABASE_URL com a string de conexão direta do Supabase
   - **Regra Obrigatória de Segurança (SSL):** O Supabase exige SSL. Instancie o pool exatamente assim: `new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: true, ca: fs.readFileSync(path.join(__dirname, '../supabase-ca.crt')).toString() } })`.
   - Importe `fs` e `path` no topo do arquivo. Deixe um comentário de código informando que o arquivo `supabase-ca.crt` deverá ser baixado manualmente pelo usuário e colocado na raiz do projeto.
5. **`middleware/auth.js`**
   - Middleware de validação de Token JWT
   - Extrai o token do header `Authorization: Bearer <token>`
   - Se o token for inválido ou expirado, retorna HTTP 401 com mensagem em PT-BR conforme RF02
   - Se válido, injeta `id_usuario` no objeto `req` para uso nos controllers
6. **`models/UsuarioModel.js`**
   - Queries SQL puras (com `pg`) para:
     - Buscar usuário por e-mail (RF02)
     - Criar novo usuário (RF01)
     - Verificar se e-mail já existe (RF01)
7. **`models/ProjetoModel.js`**
   - Queries SQL puras para:
     - Criar projeto vinculado ao id_usuario (RF04)
     - Listar projetos por id_usuario (RF05)
     - Buscar projeto por id com verificação de ownership (RF06, RF07)
     - Atualizar projeto (RF06)
     - Excluir projeto — o CASCADE na FK cuida das tarefas e tarefa_tag (RF07)
8. **`models/TarefaModel.js`**
   - Queries SQL puras para:
     - Criar tarefa com status padrão 'Pendente' (RF08)
     - Buscar tarefa por id com verificação de ownership via projeto (RF09, RF10, RF11)
     - Atualizar tarefa (RF09)
     - Excluir tarefa (RF10)
     - Atualizar status com validação de transição (RF11)
     - Listar tarefas de um projeto com filtros (status, tags) e ordenação (RF14)
   - Para RF14, a query de filtragem por múltiplas tags deve aplicar **AND lógico estrito**: a tarefa deve possuir TODAS as tags selecionadas. Use subquery com `GROUP BY id_tarefa HAVING COUNT(DISTINCT tt.id_tag) = $n` onde `$n` é o número de tags selecionadas.
   - A ordenação padrão é "Data de Conclusão Crescente" com tarefas sem data por último (`NULLS LAST`).
9. **`models/TarefaTagModel.js`**
   - Queries SQL puras para:
     - Associar tags a uma tarefa (INSERT em tarefa_tag) (RF13)
     - Remover todas as associações de uma tarefa (DELETE de tarefa_tag por id_tarefa) (RF13)
     - Verificar se todas as tags de uma lista pertencem ao id_usuario da sessão (RF13)
   - **REGRA CRÍTICA RF13**: A função de verificação de ownership deve validar TODAS as tags da lista de uma vez. Se QUALQUER id_tag não existir ou não pertencer ao id_usuario, retornar falha. Nenhuma operação parcial é permitida.
10. **`controllers/authController.js`**
   - RF01 — Cadastro: validar entradas, verificar duplicidade de e-mail, hash da senha com bcrypt, persistir usuário. Mensagens de erro exatas em PT-BR.
   - RF02 — Login: buscar por e-mail, comparar senha com bcrypt, gerar JWT com expiração de 24h. Mensagens de erro exatas em PT-BR.
   - RF03 — Logout: endpoint simbólico que retorna HTTP 200 (o descarte do token é feito no frontend).
11. **`controllers/projetoController.js`**
    - RF04 — Criar projeto: validar nome (3-100 caracteres), persistir com id_usuario do token.
    - RF05 — Listar projetos: retornar apenas projetos do id_usuario do token.
    - RF06 — Editar projeto: validar ownership, validar nome, atualizar.
    - RF07 — Excluir projeto: validar ownership, excluir (CASCADE cuida do resto).
12. **`controllers/tarefaController.js`**
    - RF08 — Criar tarefa: validar título (3-150 chars), validar data se informada, verificar ownership do projeto, persistir tarefa. Se tags forem enviadas, invocar a lógica de RF13 (validar ownership das tags ANTES de criar a tarefa — se falhar, abortar tudo).
    - RF09 — Editar tarefa: validar campos, verificar ownership, atualizar. Se tags alteradas, sincronizar via RF13.
    - RF10 — Excluir tarefa: verificar ownership, excluir (CASCADE em tarefa_tag).
    - RF11 — Alterar status: verificar ownership, validar transição bidirecional estrita (Pendente ↔ Em Andamento ↔ Concluída). Rejeitar transições inválidas com HTTP 400 e mensagem exata **"Transição de status inválida"**.
13. **`controllers/tagController.js`**
    - RF12 — CRUD de Tags:
      - Criar: validar nome (max 20 chars), verificar duplicidade para o mesmo usuário, persistir.
      - Listar: retornar tags do id_usuario.
      - Editar: validar ownership, atualizar nome.
      - Excluir: validar ownership, excluir (CASCADE em tarefa_tag).
    - RF13 — Associar tags à tarefa: validar ownership de TODAS as tags, limpar associações antigas, inserir novas.
    - RF14 — Filtrar e ordenar tarefas: receber query params (status[], tags[], ordenação), montar query dinâmica com AND lógico estrito para tags.
14. **`routes/authRoutes.js`**
    - POST `/api/auth/registro` → RF01
    - POST `/api/auth/login` → RF02
    - POST `/api/auth/logout` → RF03
    - Essas rotas são **públicas** (não exigem middleware JWT), exceto logout que pode opcionalmente exigir.
15. **`routes/projetoRoutes.js`** (todas protegidas pelo middleware JWT)
    - POST `/api/projetos` → RF04
    - GET `/api/projetos` → RF05
    - PUT `/api/projetos/:id` → RF06
    - DELETE `/api/projetos/:id` → RF07
16. **`routes/tarefaRoutes.js`** (todas protegidas pelo middleware JWT)
    - POST `/api/projetos/:projetoId/tarefas` → RF08
    - PUT `/api/tarefas/:id` → RF09
    - DELETE `/api/tarefas/:id` → RF10
    - PATCH `/api/tarefas/:id/status` → RF11
    - GET `/api/projetos/:projetoId/tarefas` → RF14 (com query params para filtros e ordenação)
17. **`routes/tagRoutes.js`** (todas protegidas pelo middleware JWT)
    - POST `/api/tags` → RF12 (criar)
    - GET `/api/tags` → RF12 (listar)
    - PUT `/api/tags/:id` → RF12 (editar)
    - DELETE `/api/tags/:id` → RF12 (excluir)
    - PUT `/api/tarefas/:tarefaId/tags` → RF13 (associar tags à tarefa)
18. **`API_CONTRACT.md`**
    Este é o arquivo de handoff para o Agente Frontend. Deve documentar:
    - **Esquema de autenticação**: como o JWT é obtido (RF02), como deve ser enviado no header (`Authorization: Bearer <token>`), tempo de expiração (24h), e o que acontece quando expira (HTTP 401)
    - **Todos os endpoints**, organizados por módulo, contendo para cada um:
      - Método HTTP e path
      - Se é público ou protegido (JWT)
      - Payload de request (body JSON e/ou query params, com tipos)
      - Payload de response (body JSON com exemplo de estrutura, incluindo campos retornados)
      - Códigos de status HTTP possíveis (200, 201, 400, 401, 403, 404) com as mensagens de erro exatas em PT-BR
    - **Quadro resumo** no final com todos os endpoints em formato de tabela: Método | Path | RF | Descrição

**Regras finais obrigatórias:**
- Todos os endpoints devem retornar os status HTTP corretos: 200, 201, 400, 401, 403, 404, 409.
- Todas as mensagens de erro devem estar em PT-BR conforme definido nos RFs.
- Não invente endpoints, entidades ou regras que não existam nos RFs.
- Use queries SQL parametrizadas (`$1`, `$2`) em todos os models para prevenção de SQL injection.
- O código deve ser diretamente executável após `npm install` das dependências listadas no System Prompt.

**Critério de Aceitação:**
Esta entrega estará completa quando todos os endpoints dos RFs estiverem implementados, os arquivos `package.json` e `.env` estiverem corretamente gerados na raiz, a configuração de segurança do Supabase estiver no `database.js`, e o `API_CONTRACT.md` estiver documentando todos eles com payloads precisos.
