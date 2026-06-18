const express = require('express');
const tagController = require('../controllers/tagController');
const auth = require('../middleware/auth');

// ============================================================
// Rotas de Tags — Módulo de Tags
// Todas protegidas pelo middleware JWT.
//
// Dois grupos de rotas:
//   1. CRUD de tags: /api/tags (RF12)
//   2. Associação de tags a tarefa: /api/tarefas/:tarefaId/tags (RF13)
// ============================================================

// Router para CRUD de tags: /api/tags
const tagRouter = express.Router();
tagRouter.use(auth);

// RF12 — Criar Tag
tagRouter.post('/', tagController.criar);

// RF12 — Listar Tags do Usuário
tagRouter.get('/', tagController.listar);

// RF12 — Editar Tag
tagRouter.put('/:id', tagController.atualizar);

// RF12 — Excluir Tag (CASCADE remove associações em tarefa_tag)
tagRouter.delete('/:id', tagController.excluir);

// Router para associação de tags: /api/tarefas/:tarefaId/tags
const tarefaTagRouter = express.Router({ mergeParams: true });
tarefaTagRouter.use(auth);

// RF13 — Associar Tags a uma Tarefa
tarefaTagRouter.put('/', tagController.associarTags);

module.exports = { tagRouter, tarefaTagRouter };
