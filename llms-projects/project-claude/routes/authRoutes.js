const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

// ============================================================
// Rotas de Autenticação — Módulo de Autenticação
// ============================================================

// RF01 — Cadastro de Usuário (PÚBLICO)
router.post('/registro', authController.registrar);

// RF02 — Login e Sessão (PÚBLICO)
router.post('/login', authController.login);

// RF03 — Logout (PROTEGIDO — requer token válido)
router.post('/logout', auth, authController.logout);

module.exports = router;
