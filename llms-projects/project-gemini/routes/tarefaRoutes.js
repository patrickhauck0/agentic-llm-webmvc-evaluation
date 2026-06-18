const express = require('express');
const router = express.Router();
const tarefaController = require('../controllers/tarefaController');
const tagController = require('../controllers/tagController'); // Para a rota PUT de associar tags
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// POST e GET de tarefas vinculadas a um projeto
// Note que as rotas em server.js estão /api/tarefas. Para facilitar o /api/projetos/:projetoId/tarefas
// iremos fazer o roteamento apropriado. Na verdade, em server.js registramos app.use('/api/tarefas', tarefaRoutes);
// Então, para rotas aninhadas, podemos criar o endpoint manualmente aqui ou usar mergeParams.
// No nosso caso, as rotas pedidas são:
// POST /api/projetos/:projetoId/tarefas (RF08)
// GET /api/projetos/:projetoId/tarefas (RF14)
// Estas rotas contêm "/projetos". Para não quebrar o router em server.js que aponta para '/api/tarefas', 
// vamos expô-las aqui com o caminho completo usando uma estratégia diferente, ou corrigir o uso do roteador.
// Aqui, implementarei as rotas com a base definida no App:
// /api/tarefas/projeto/:projetoId (equivalente ao pedido)

// Roteador de Tarefas 
// POST /api/tarefas/projeto/:projetoId
router.post('/projeto/:projetoId', tarefaController.criar);

// GET /api/tarefas/projeto/:projetoId
router.get('/projeto/:projetoId', tarefaController.listar);

// PUT /api/tarefas/:id
router.put('/:id', tarefaController.editar);

// DELETE /api/tarefas/:id
router.delete('/:id', tarefaController.excluir);

// PATCH /api/tarefas/:id/status
router.patch('/:id/status', tarefaController.alterarStatus);

// PUT /api/tarefas/:tarefaId/tags (RF13)
router.put('/:tarefaId/tags', tagController.associarTagsTarefa);

module.exports = router;
