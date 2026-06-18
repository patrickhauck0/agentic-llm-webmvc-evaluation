const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth'); // Opcional para logout

router.post('/registro', authController.registrar);
router.post('/login', authController.login);
router.post('/logout', authController.logout); // Não estritamente protegido, mas poderia

module.exports = router;
