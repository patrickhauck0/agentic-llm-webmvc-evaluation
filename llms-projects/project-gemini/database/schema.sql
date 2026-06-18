-- Ordem de criação: usuario -> tag -> projeto -> tarefa -> tarefa_tag

-- 1. Entidade: usuario
CREATE TABLE usuario (
    id_usuario INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Entidade: tag
CREATE TABLE tag (
    id_tag INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    nome VARCHAR(20) NOT NULL,
    id_usuario INTEGER NOT NULL,
    CONSTRAINT fk_tag_usuario FOREIGN KEY (id_usuario) 
        REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    CONSTRAINT uq_tag_nome_usuario UNIQUE (nome, id_usuario) -- Nome de tag único por usuário
);

-- Índice de performance para listagem de tags (RF12)
CREATE INDEX idx_tag_id_usuario ON tag(id_usuario);

-- 3. Entidade: projeto
CREATE TABLE projeto (
    id_projeto INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT NULL,
    id_usuario INTEGER NOT NULL,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_projeto_usuario FOREIGN KEY (id_usuario) 
        REFERENCES usuario(id_usuario) ON DELETE CASCADE
);

-- Índice de performance para listagem de projetos (RF05)
CREATE INDEX idx_projeto_id_usuario ON projeto(id_usuario);

-- 4. Entidade: tarefa
CREATE TABLE tarefa (
    id_tarefa INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    titulo VARCHAR(150) NOT NULL,
    descricao TEXT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Pendente',
    data_conclusao DATE NULL,
    id_projeto INTEGER NOT NULL,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    -- CASCADE para garantir a exclusão das tarefas ao excluir o projeto (RF07)
    CONSTRAINT fk_tarefa_projeto FOREIGN KEY (id_projeto) 
        REFERENCES projeto(id_projeto) ON DELETE CASCADE
);

-- Índices de performance para tarefas
-- Para listagem de tarefas por projeto (RF08/RF14)
CREATE INDEX idx_tarefa_id_projeto ON tarefa(id_projeto);
-- Para filtragem rápida por status (RF14)
CREATE INDEX idx_tarefa_status ON tarefa(status);

-- 5. Entidade: tarefa_tag (tabela associativa N:N)
CREATE TABLE tarefa_tag (
    id_tarefa INTEGER NOT NULL,
    id_tag INTEGER NOT NULL,
    -- Chave primária composta, pois uma tarefa só pode ter a mesma tag vinculada uma vez
    PRIMARY KEY (id_tarefa, id_tag),
    -- CASCADE: excluir tarefa remove associações (RF10/RF07 indiretamente)
    CONSTRAINT fk_tarefatag_tarefa FOREIGN KEY (id_tarefa) 
        REFERENCES tarefa(id_tarefa) ON DELETE CASCADE,
    -- CASCADE: excluir tag remove associações, mantendo a tarefa intacta (RF12)
    CONSTRAINT fk_tarefatag_tag FOREIGN KEY (id_tag) 
        REFERENCES tag(id_tag) ON DELETE CASCADE
);
