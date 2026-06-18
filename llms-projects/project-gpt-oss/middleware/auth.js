// middleware/auth.js - validação de JWT

const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * Middleware que verifica o token JWT enviado no header Authorization.
 * Caso o token seja válido, anexa ao req o objeto user com id_usuario.
 * Em caso de token ausente, inválido ou expirado, responde 401 com a mensagem
 * definida no RF02: "E-mail ou senha incorretos" (para login falho) ou
 * "Sessão expirada. Faça login novamente" (para token inválido/expirado).
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ mensagem: 'Sessão expirada. Faça login novamente' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      // Token inválido ou expirado
      return res.status(401).json({ mensagem: 'Sessão expirada. Faça login novamente' });
    }
    // decoded deve conter id_usuario (conforme geração do token)
    req.user = { id_usuario: decoded.id_usuario };
    next();
  });
}

module.exports = { authenticateToken };
