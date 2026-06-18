const express = require('express');
const router = express.Router();
const tagController = require('../controllers/tagController');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// CRUD de Tags (RF12)
router.post('/', tagController.criar);
router.get('/', tagController.listar);
router.put('/:id', tagController.editar);
router.delete('/:id', tagController.excluir);

module.exports = router;
