const express = require('express');
const router = express.Router();
const projetoController = require('../controllers/projetoController');
const authMiddleware = require('../middleware/auth');

// Todas as rotas de projeto são protegidas
router.use(authMiddleware);

router.post('/', projetoController.criar);
router.get('/', projetoController.listar);
router.put('/:id', projetoController.editar);
router.delete('/:id', projetoController.excluir);

module.exports = router;
