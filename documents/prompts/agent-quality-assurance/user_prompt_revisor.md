### User Prompt 1 — Agente Revisor

Analise o código completo do SGT (Backend + Frontend) que foi injetado no seu contexto e produza o relatório de aderência funcional.

**Fase 0 — Inventário de Arquivos (Auditoria do Workspace):**
Antes de iniciar a análise dos requisitos, utilize a sua ferramenta de leitura de arquivos para fazer uma varredura completa no diretório. Liste explicitamente quais arquivos reais você conseguiu encontrar e ler.

- Compare o que você encontrou com a lista de "Arquivos Esperados" definida no seu System Prompt.
- Regra rígida: Se você não encontrar um arquivo listado, assuma imediatamente que ele não existe e penalize todos os RFs que dependeriam dele com status ❌ AUSENTE. Não tente "adivinhar" o código.

**Antes de preencher qualquer tabela ou emitir qualquer classificação**, você deve executar a seguinte sequência de análise para **CADA** requisito funcional, de RF01 a RF14, em ordem. Escreva o raciocínio explicitamente para cada RF antes de classificá-lo. Não pule nenhuma etapa.

**Fase 1 — Sequência de Análise por RF (obrigatória — escreva antes de classificar):**

Para cada RF (de RF01 a RF14), execute os seguintes passos numerados:

1. **Localizar no Backend**: Identifique no código do Backend o endpoint (rota), o controller e o model que implementam este RF. Cite o arquivo e a função/trecho relevante. Se não encontrar, registre como "não localizado".

2. **Verificar validações de entrada**: Compare as regras de validação descritas no RF (limites de caracteres, campos obrigatórios, formatos) com as validações efetivamente presentes no código do controller ou model. Liste cada validação esperada e se ela está presente ou ausente no código.

3. **Verificar exceções e mensagens de erro**: Compare as mensagens de erro exatas em PT-BR definidas no RF com as mensagens presentes no código. A comparação deve ser **literal** — se o RF exige "E-mail já cadastrado" e o código retorna "Email já cadastrado" (sem acento) ou "Este e-mail já está em uso", isso é uma discrepância. Liste cada mensagem esperada e a mensagem encontrada no código.

4. **Verificar códigos HTTP**: Compare os códigos HTTP definidos no RF (400, 401, 403, 404, 409) com os códigos efetivamente retornados no código. Se o RF exige HTTP 409 e o código retorna HTTP 400, isso é uma discrepância.

5. **Localizar no Frontend**: Identifique no código do Frontend o componente, a página ou o modal que implementa a interface correspondente a este RF. Cite o arquivo e o trecho relevante. Se não encontrar, registre como "não localizado".

6. **Verificar feedback visual**: Verifique se o componente do Frontend implementa os seguintes elementos de feedback (quando aplicáveis ao RF):
   - Mensagens de erro da API exibidas via Toast
   - Spinner no botão de submissão durante requisições
   - Empty States com textos exatos em PT-BR (quando definidos pelo RF)
   - Modal de confirmação destrutivo com botão vermelho (para exclusões)
   - Indicador visual de status (para RF11)

7. **Classificar o status**: Com base **exclusivamente** nas evidências coletadas nos passos 1 a 6, classifique o RF como:
   - **✅ IMPLEMENTADO**: O requisito está completamente atendido tanto no Backend quanto no Frontend. Todas as validações, mensagens, códigos HTTP e feedbacks visuais estão corretos.
   - **⚠️ PARCIAL**: O requisito está parcialmente atendido. Alguma validação, mensagem, código HTTP ou componente está ausente, incorreto ou incompleto. Descreva exatamente o que falta.
   - **❌ AUSENTE**: O requisito não foi implementado. O endpoint não existe, o componente não foi criado, ou a funcionalidade simplesmente não está presente no código.

Repita esta sequência completa para cada um dos 14 RFs. Ao concluir os 14, produza o relatório final.

---

**Atenção especial aos itens marcados como ⚠️ CRÍTICO no System Prompt:**

Ao analisar os seguintes RFs, dedique atenção redobrada aos pontos críticos listados. Estes são os requisitos mais frequentemente implementados de forma incorreta:

- **RF02**: O JWT tem expiração de 24h? O middleware retorna HTTP 401? O frontend armazena em memória (useState) e redireciona ao receber 401?
- **RF07**: O schema.sql possui ON DELETE CASCADE nas FKs de `tarefa.id_projeto` e `tarefa_tag.id_tarefa`? A cascata é completa (projeto → tarefas → tarefa_tag)? As tags permanecem intactas?
- **RF10**: A exclusão de tarefa remove apenas registros em `tarefa_tag`, não as tags em si?
- **RF11**: Existe um mapa de transições válidas? As transições "Pendente" → "Concluída" e "Concluída" → "Pendente" são bloqueadas? O HTTP é 400 e a mensagem é exatamente "Transição de status inválida"?
- **RF12**: A verificação de duplicidade de nome é por usuário (NOME + ID_USUARIO), não global? O HTTP é 409 e a mensagem é "Tag já existe"?
- **RF13**: A validação de ownership verifica TODAS as tags de uma vez? Se UMA falhar, aborta tudo (inclusive a criação da tarefa no contexto de RF08)? O HTTP é 403 e a mensagem é "Acesso negado. A tag não pertence a este usuário"?
- **RF14**: O filtro de tags usa AND lógico estrito (HAVING COUNT = N)? A ordenação padrão é Data de Conclusão Crescente com NULLS LAST?

---

**Formato de Entrega — Relatório de Aderência Funcional do SGT**

Após concluir a análise dos 14 RFs, organize o relatório nas 4 seções abaixo:

---

**SEÇÃO 0 — Inventário de Arquivos Lidos**
Liste os arquivos encontrados e os arquivos ausentes (comparando com a lista do System Prompt) divididos por Backend e Frontend.

---

**SEÇÃO 1 — Tabela de Aderência RF por RF**

Preencha a tabela completa para os 14 RFs:

| RF   | Descrição Resumida              | Status Backend | Status Frontend | Observações |
|------|---------------------------------|----------------|-----------------|-------------|
| RF01 | Cadastro de Usuário             | ✅/⚠️/❌       | ✅/⚠️/❌        | ...         |
| RF02 | Login e Sessão (JWT 24h)        | ✅/⚠️/❌       | ✅/⚠️/❌        | ...         |
| RF03 | Logout                          | ✅/⚠️/❌       | ✅/⚠️/❌        | ...         |
| RF04 | Criação de Projeto              | ✅/⚠️/❌       | ✅/⚠️/❌        | ...         |
| RF05 | Listagem de Projetos            | ✅/⚠️/❌       | ✅/⚠️/❌        | ...         |
| RF06 | Edição de Projeto               | ✅/⚠️/❌       | ✅/⚠️/❌        | ...         |
| RF07 | Exclusão de Projeto (CASCADE)   | ✅/⚠️/❌       | ✅/⚠️/❌        | ...         |
| RF08 | Criação de Tarefa               | ✅/⚠️/❌       | ✅/⚠️/❌        | ...         |
| RF09 | Edição de Tarefa                | ✅/⚠️/❌       | ✅/⚠️/❌        | ...         |
| RF10 | Exclusão de Tarefa              | ✅/⚠️/❌       | ✅/⚠️/❌        | ...         |
| RF11 | Alteração de Status (Estrita)   | ✅/⚠️/❌       | ✅/⚠️/❌        | ...         |
| RF12 | Gerenciamento de Tags (CRUD)    | ✅/⚠️/❌       | ✅/⚠️/❌        | ...         |
| RF13 | Associação de Tags à Tarefa     | ✅/⚠️/❌       | ✅/⚠️/❌        | ...         |
| RF14 | Filtragem e Ordenação (AND)     | ✅/⚠️/❌       | ✅/⚠️/❌        | ...         |

Regras de preenchimento:
- Use **✅ IMPLEMENTADO** apenas quando a implementação está 100% correta em todos os aspectos daquele lado (Backend ou Frontend).
- Use **⚠️ PARCIAL** quando qualquer detalhe está incorreto, incompleto ou com mensagem/código HTTP divergente.
- Use **❌ AUSENTE** quando o endpoint, componente ou funcionalidade não existe no código.
- A coluna **Observações** deve descrever brevemente a discrepância encontrada (ex: "Mensagem de erro divergente: esperado 'E-mail já cadastrado', encontrado 'Email já existe'").

---

**SEÇÃO 2 — Detalhamento dos Itens Críticos**

Para cada RF que recebeu status **⚠️ PARCIAL** ou **❌ AUSENTE** em qualquer coluna (Backend ou Frontend), produza uma entrada detalhada contendo:

- **RF**: Identificador
- **Lado afetado**: Backend, Frontend ou ambos
- **O que está faltando ou incorreto**: Descrição precisa da discrepância
- **Arquivo e trecho**: Cite o nome do arquivo e, se possível, o trecho de código onde a falha foi identificada (ou onde deveria estar e não está)
- **Impacto**: Qual comportamento incorreto o usuário final experimentaria

---

**SEÇÃO 3 — Score de Aderência**

Calcule o score da seguinte forma:

1. Conte quantos RFs possuem **✅ IMPLEMENTADO** em **AMBAS** as colunas (Backend E Frontend). Apenas estes contam como IMPLEMENTADO para o score.
2. Calcule: **(Quantidade de RFs IMPLEMENTADOS ÷ 14) × 100 = Score%**
3. Classifique:
   - **Excelente**: Score ≥ 90% (13 ou 14 RFs implementados)
   - **Satisfatório**: Score ≥ 70% (10 a 12 RFs implementados)
   - **Insatisfatório**: Score < 70% (9 ou menos RFs implementados)

Apresente o resultado no formato:

```
RFs IMPLEMENTADOS (Backend ✅ + Frontend ✅): X/14
RFs PARCIAIS: X/14
RFs AUSENTES: X/14
Score de Aderência: X%
Classificação: [Excelente / Satisfatório / Insatisfatório]
```

---

**SEÇÃO 4 — Riscos de Qualidade**

Verifique **cada um** dos 7 riscos abaixo no código. Para cada risco, indique:
- Se foi encontrado: **SIM** ou **NÃO**
- Se SIM, cite o **arquivo** e a **linha ou trecho** onde ocorre

| # | Risco | Encontrado | Arquivo / Trecho |
|---|-------|------------|------------------|
| 1 | Endpoint privado acessível sem validação de JWT (rota protegida sem middleware `auth`) | SIM/NÃO | ... |
| 2 | Ausência de validação de ownership — usuário consegue acessar/modificar recurso de outro usuário | SIM/NÃO | ... |
| 3 | Query SQL vulnerável a SQL Injection — concatenação de string direta em query ao invés de query parametrizada ($1, $2) | SIM/NÃO | ... |
| 4 | Token JWT armazenado em localStorage ou sessionStorage no frontend (violação de requisito — deve ser useState em memória) | SIM/NÃO | ... |
| 5 | Transição de status aceita fora da sequência bidirecional estrita definida no RF11 — ausência de mapa de validação | SIM/NÃO | ... |
| 6 | Exclusão de projeto sem cascata completa — FK `tarefa.id_projeto` ou `tarefa_tag.id_tarefa` sem ON DELETE CASCADE (RF07) | SIM/NÃO | ... |
| 7 | Operação de associação de tags (RF13) sem validação de ownership — tags de outro usuário aceitas sem erro | SIM/NÃO | ... |

---

**Critério de Aceitação:**

Este relatório estará completo quando:
1. A **Seção 1** contiver os 14 RFs avaliados com raciocínio explícito para cada um (os 7 passos de análise escritos antes da classificação).
2. A **Seção 2** contiver o detalhamento de todos os RFs com status ⚠️ PARCIAL ou ❌ AUSENTE.
3. A **Seção 3** contiver o score calculado explicitamente com a fórmula e a classificação.
4. A **Seção 4** tiver verificado **todos os 7 riscos** listados — mesmo que com resultado "NÃO encontrado" para cada um.
