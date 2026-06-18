-- Schema SQL for Sistema de Gerenciamento de Tarefas (SGT)

-- 1. Tabela usuario
CREATE TABLE usuario (
    id_usuario INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabela tag (depende de usuario)
CREATE TABLE tag (
    id_tag INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    nome VARCHAR(20) NOT NULL,
    id_usuario INTEGER NOT NULL,
    CONSTRAINT fk_tag_usuario FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    CONSTRAINT uq_tag_nome_usuario UNIQUE (nome, id_usuario)
);

-- 3. Tabela projeto (depende de usuario)
CREATE TABLE projeto (
    id_projeto INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    id_usuario INTEGER NOT NULL,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_projeto_usuario FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE
);

-- 4. Tabela tarefa (depende de projeto)
CREATE TABLE tarefa (
    id_tarefa INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    titulo VARCHAR(150) NOT NULL,
    descricao TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'Pendente',
    data_conclusao DATE,
    id_projeto INTEGER NOT NULL,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_tarefa_projeto FOREIGN KEY (id_projeto) REFERENCES projeto(id_projeto) ON DELETE CASCADE
);

-- 5. Tabela tarefa_tag (associação N:N entre tarefa e tag)
CREATE TABLE tarefa_tag (
    id_tarefa INTEGER NOT NULL,
    id_tag INTEGER NOT NULL,
    CONSTRAINT pk_tarefa_tag PRIMARY KEY (id_tarefa, id_tag),
    CONSTRAINT fk_tarefa_tag_tarefa FOREIGN KEY (id_tarefa) REFERENCES tarefa(id_tarefa) ON DELETE CASCADE,
    CONSTRAINT fk_tarefa_tag_tag FOREIGN KEY (id_tag) REFERENCES tag(id_tag) ON DELETE CASCADE
);

-- Índices de performance
CREATE INDEX idx_projeto_id_usuario ON projeto(id_usuario);
CREATE INDEX idx_tag_id_usuario ON tag(id_usuario);
CREATE INDEX idx_tarefa_id_projeto ON tarefa(id_projeto);
CREATE INDEX idx_tarefa_status ON tarefa(status);
