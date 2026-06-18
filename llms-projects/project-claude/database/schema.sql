-- ============================================================================
-- SGT - Sistema de Gerenciamento de Tarefas
-- Schema do Banco de Dados (PostgreSQL / Supabase)
-- ============================================================================
-- Ordem de criação respeitando dependências de FK:
--   1. usuario  (sem dependências)
--   2. tag      (depende de usuario)
--   3. projeto  (depende de usuario)
--   4. tarefa   (depende de projeto)
--   5. tarefa_tag (depende de tarefa e tag — criada por último)
-- ============================================================================

-- ============================================================================
-- 1. ENTIDADE: usuario
-- ============================================================================
-- Tabela raiz do sistema. Todos os recursos (projetos, tags) pertencem a um
-- usuário. A PK usa GENERATED ALWAYS AS IDENTITY para auto-incremento seguro
-- (impede INSERTs manuais de ID). O email possui constraint UNIQUE para
-- garantir unicidade global (RF01: "E-mail já cadastrado").
-- ============================================================================
CREATE TABLE usuario (
    id_usuario  INTEGER       GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome        VARCHAR(100)  NOT NULL,
    email       VARCHAR(255)  NOT NULL UNIQUE,
    senha_hash  VARCHAR(255)  NOT NULL,
    criado_em   TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 2. ENTIDADE: tag
-- ============================================================================
-- Tags são criadas por usuário (RF12). A constraint UNIQUE(nome, id_usuario)
-- garante que um mesmo usuário não pode ter duas tags com o mesmo nome, mas
-- usuários diferentes podem (ex: dois usuários podem ter a tag "Urgente").
-- ON DELETE CASCADE na FK id_usuario: excluir usuário remove todas as suas tags.
-- ============================================================================
CREATE TABLE tag (
    id_tag      INTEGER      GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome        VARCHAR(20)  NOT NULL,
    id_usuario  INTEGER      NOT NULL,

    -- FK: tag pertence a um usuário. CASCADE: excluir usuário remove suas tags.
    CONSTRAINT fk_tag_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuario (id_usuario)
        ON DELETE CASCADE,

    -- UNIQUE composta: nome de tag é único POR USUÁRIO, não globalmente (RF12).
    CONSTRAINT uq_tag_nome_usuario
        UNIQUE (nome, id_usuario)
);

-- ============================================================================
-- 3. ENTIDADE: projeto
-- ============================================================================
-- Projetos pertencem a um usuário (1:N). O campo descricao é opcional (NULL).
-- ON DELETE CASCADE na FK id_usuario: excluir usuário remove todos os seus
-- projetos, o que por sua vez dispara cascade nas tarefas (via tarefa.id_projeto).
-- ============================================================================
CREATE TABLE projeto (
    id_projeto  INTEGER       GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome        VARCHAR(100)  NOT NULL,
    descricao   TEXT,
    id_usuario  INTEGER       NOT NULL,
    criado_em   TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- FK: projeto pertence a um usuário. CASCADE: excluir usuário remove projetos.
    CONSTRAINT fk_projeto_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuario (id_usuario)
        ON DELETE CASCADE
);

-- ============================================================================
-- 4. ENTIDADE: tarefa
-- ============================================================================
-- Tarefas pertencem a um projeto (1:N). O status inicia como 'Pendente' e segue
-- a máquina de estados: Pendente ↔ Em Andamento ↔ Concluída (RF11).
-- data_conclusao é opcional (DATE, NULL).
-- ON DELETE CASCADE na FK id_projeto (RF07): excluir projeto remove todas as
-- tarefas filhas, que por sua vez disparam cascade na tabela tarefa_tag.
-- ============================================================================
CREATE TABLE tarefa (
    id_tarefa       INTEGER       GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    titulo          VARCHAR(150)  NOT NULL,
    descricao       TEXT,
    status          VARCHAR(20)   NOT NULL DEFAULT 'Pendente',
    data_conclusao  DATE,
    id_projeto      INTEGER       NOT NULL,
    criado_em       TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- FK: tarefa pertence a um projeto.
    -- CASCADE (RF07): excluir projeto → remove todas as tarefas do projeto.
    -- Isso também dispara cascade em tarefa_tag (via tarefa_tag.id_tarefa).
    CONSTRAINT fk_tarefa_projeto
        FOREIGN KEY (id_projeto)
        REFERENCES projeto (id_projeto)
        ON DELETE CASCADE
);

-- ============================================================================
-- 5. ENTIDADE: tarefa_tag (tabela associativa N:N)
-- ============================================================================
-- Resolve o relacionamento N:N entre tarefa e tag (RF13).
-- A PK é composta por (id_tarefa, id_tag), o que:
--   1. Garante unicidade: uma mesma tag não pode ser associada duas vezes à
--      mesma tarefa.
--   2. Cria um índice implícito na PK composta, otimizando buscas por id_tarefa.
--
-- ON DELETE CASCADE em AMBAS as FKs:
--   - id_tarefa CASCADE (RF07/RF10): excluir tarefa remove as associações.
--   - id_tag CASCADE (RF12): excluir tag remove as associações, mas as tarefas
--     permanecem intactas (apenas o vínculo é removido).
-- ============================================================================
CREATE TABLE tarefa_tag (
    id_tarefa  INTEGER  NOT NULL,
    id_tag     INTEGER  NOT NULL,

    -- PK composta: garante unicidade da associação e cria índice implícito.
    PRIMARY KEY (id_tarefa, id_tag),

    -- FK: associação referencia uma tarefa.
    -- CASCADE (RF07/RF10): excluir tarefa remove seus vínculos com tags.
    CONSTRAINT fk_tarefa_tag_tarefa
        FOREIGN KEY (id_tarefa)
        REFERENCES tarefa (id_tarefa)
        ON DELETE CASCADE,

    -- FK: associação referencia uma tag.
    -- CASCADE (RF12): excluir tag remove seus vínculos com tarefas.
    -- As tarefas NÃO são excluídas — apenas a associação é removida.
    CONSTRAINT fk_tarefa_tag_tag
        FOREIGN KEY (id_tag)
        REFERENCES tag (id_tag)
        ON DELETE CASCADE
);

-- ============================================================================
-- ÍNDICES DE PERFORMANCE
-- ============================================================================
-- Os índices abaixo cobrem as consultas mais frequentes do sistema.
-- Nota: PKs e colunas UNIQUE já possuem índices implícitos criados pelo
-- PostgreSQL, portanto não são duplicados aqui.
-- ============================================================================

-- RF05: Listagem de projetos do usuário
-- Query: SELECT * FROM projeto WHERE id_usuario = $1
-- Justificativa: Toda vez que o usuário acessa o dashboard, esta query é
-- executada. Sem índice, o PostgreSQL faria full table scan na tabela projeto.
CREATE INDEX idx_projeto_id_usuario ON projeto (id_usuario);

-- RF12: Listagem de tags do usuário
-- Query: SELECT * FROM tag WHERE id_usuario = $1
-- Justificativa: Tags são listadas frequentemente (no modal de criação/edição
-- de tarefas e na tela de gerenciamento de tags). O índice acelera o filtro.
-- Nota: a constraint UNIQUE(nome, id_usuario) cria um índice composto, mas
-- ele não é otimizado para buscas apenas por id_usuario. Este índice cobre
-- esse caso.
CREATE INDEX idx_tag_id_usuario ON tag (id_usuario);

-- RF08/RF14: Listagem de tarefas de um projeto
-- Query: SELECT * FROM tarefa WHERE id_projeto = $1
-- Justificativa: Ao abrir um projeto, todas as tarefas são carregadas.
-- Este é o ponto de entrada para a filtragem (RF14).
CREATE INDEX idx_tarefa_id_projeto ON tarefa (id_projeto);

-- RF14: Filtragem por status
-- Query: SELECT * FROM tarefa WHERE status = ANY($1)
-- Justificativa: O filtro por status é um dos critérios mais usados (RF14).
-- O índice permite ao PostgreSQL fazer index scan em vez de full table scan
-- ao filtrar por 'Pendente', 'Em Andamento' ou 'Concluída'.
CREATE INDEX idx_tarefa_status ON tarefa (status);
