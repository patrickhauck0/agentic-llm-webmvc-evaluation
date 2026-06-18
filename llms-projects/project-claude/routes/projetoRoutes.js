const express = require('express');
const router = express.Router();
const projetoController = require('../controllers/projetoController');
const auth = require('../middleware/auth');

// ============================================================
// Rotas de Projetos — Módulo de Projetos
// Todas protegidas pelo middleware JWT.
// Base path: /api/projetos
// ============================================================

router.use(auth);

// RF04 — Criar Projeto
router.post('/', projetoController.criar);

// RF05 — Listar Projetos do Usuário
router.get('/', projetoController.listar);

// RF06 — Editar Projeto
router.put('/:id', projetoController.atualizar);

// RF07 — Excluir Projeto (CASCADE cuida das tarefas e tarefa_tag)
router.delete('/:id', projetoController.excluir);

module.exports = router;
