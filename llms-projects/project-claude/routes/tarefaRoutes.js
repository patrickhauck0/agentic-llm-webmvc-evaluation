const express = require('express');
const tarefaController = require('../controllers/tarefaController');
const auth = require('../middleware/auth');

// ============================================================
// Rotas de Tarefas — Módulo de Tarefas
// Todas protegidas pelo middleware JWT.
//
// Dois grupos de rotas:
//   1. Rotas no contexto de projeto: /api/projetos/:projetoId/tarefas
//      (criação e listagem de tarefas dentro de um projeto)
//   2. Rotas diretas: /api/tarefas/:id
//      (edição, exclusão e alteração de status de tarefa individual)
// ============================================================

// Router para rotas diretas: /api/tarefas
const tarefaRouter = express.Router();
tarefaRouter.use(auth);

// RF09 — Editar Tarefa
tarefaRouter.put('/:id', tarefaController.atualizar);

// RF10 — Excluir Tarefa
tarefaRouter.delete('/:id', tarefaController.excluir);

// RF11 — Alterar Status da Tarefa
tarefaRouter.patch('/:id/status', tarefaController.alterarStatus);

// Router para rotas no contexto de projeto: /api/projetos/:projetoId/tarefas
const projetoTarefaRouter = express.Router({ mergeParams: true });
projetoTarefaRouter.use(auth);

// RF08 — Criar Tarefa (dentro de um projeto)
projetoTarefaRouter.post('/', tarefaController.criar);

// RF14 — Listar Tarefas com filtros e ordenação
projetoTarefaRouter.get('/', tarefaController.listar);

module.exports = { tarefaRouter, projetoTarefaRouter };
