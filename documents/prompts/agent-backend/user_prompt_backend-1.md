### User Prompt 1 — Agente Backend

Antes de escrever qualquer linha de SQL, eu preciso que você raciocine explicitamente, passo a passo, em formato numerado. Não pule nenhuma etapa.

**Etapa de Raciocínio (obrigatória — escreva antes do código):**

1. Liste todas as 5 entidades do DER com seus respectivos atributos e tipos de dados exatos (ex: `id_usuario INTEGER`, `email VARCHAR(255)`).

2. Liste todos os relacionamentos entre as entidades, indicando a cardinalidade de cada um:
   - Quais são 1:N?
   - Qual é N:N?
   - Qual tabela resolve o N:N?

3. Liste todas as constraints necessárias para cada entidade, organizadas por tipo:
   - PRIMARY KEY (PKs)
   - FOREIGN KEY (FKs) — indicando tabela de origem e tabela de destino
   - UNIQUE
   - NOT NULL
   - DEFAULT (valores padrão)
   - ON DELETE CASCADE — liste explicitamente quais FKs exigem CASCADE e por qual RF (cite RF07 e RF12)

4. Defina a ordem correta de criação das tabelas, respeitando as dependências de FK. Raciocine assim:
   - Quais tabelas não dependem de nenhuma outra? (devem ser criadas primeiro)
   - Quais tabelas dependem apenas das anteriores?
   - Qual tabela depende de duas outras tabelas e deve ser criada por último?
   - A ordem esperada é: `usuario` → `tag` → `projeto` → `tarefa` → `tarefa_tag`

5. Liste os índices de performance necessários para as consultas mais frequentes do sistema. Considere que as queries mais executadas filtram por:
   - `id_usuario` na tabela `projeto` (RF05: listagem de projetos do usuário)
   - `id_usuario` na tabela `tag` (RF12: listagem de tags do usuário)
   - `id_projeto` na tabela `tarefa` (RF08/RF14: listagem de tarefas de um projeto)
   - `status` na tabela `tarefa` (RF14: filtragem por status)

**Etapa de Entrega (após o raciocínio):**

Após concluir o raciocínio acima, gere o seguinte arquivo:

**Arquivo: `database/schema.sql`**

O arquivo deve conter:
- `CREATE TABLE` para as 5 entidades, na exata ordem definida na etapa 4 do raciocínio
- Todas as constraints (PK, FK, UNIQUE, NOT NULL, DEFAULT) incorporadas diretamente nos `CREATE TABLE`
- Todas as cláusulas `ON DELETE CASCADE` nas FKs onde os RFs exigem (RF07: exclusão de projeto em cascata; RF12: exclusão de tag remove associações em tarefa_tag)
- Todos os `CREATE INDEX` identificados na etapa 5 do raciocínio
- Comentários SQL (`--`) explicando decisões de design relevantes, como: por que a PK de `tarefa_tag` é composta, por que determinada FK usa CASCADE, e por que cada índice foi criado

**Ação Autônoma (MCP Supabase):** 
Imediatamente após gerar o SQL, utilize a ferramenta apropriada do MCP Supabase para executar o conteúdo deste arquivo diretamente no banco de dados.

- Utilize ferramentas de inspeção do MCP para listar as tabelas e confirmar que a estrutura foi criada conforme o esperado.

Não gere nenhum outro arquivo além de `database/schema.sql` nesta entrega.

**Critério de Aceitação:**
Esta entrega estará completa quando `database/schema.sql` contiver as 5 tabelas com todas as constraints, FKs com ON DELETE CASCADE conforme RF07 e RF12, validação e confirmação de que as tabelas existem fisicamente no banco de dados e os índices de performance identificados no raciocínio 