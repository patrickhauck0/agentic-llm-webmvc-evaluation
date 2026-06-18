const jwt = require('jsonwebtoken');

// ============================================================
// Middleware de Autenticação JWT
// ============================================================
// Extrai e valida o token do header Authorization: Bearer <token>.
// Se válido, injeta req.userId (id_usuario) para uso nos controllers.
// Mensagem de erro em PT-BR conforme RF02.
// ============================================================

const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ erro: 'Sessão expirada. Faça login novamente' });
  }

  const parts = authHeader.split(' ');

  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ erro: 'Sessão expirada. Faça login novamente' });
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id_usuario;
    next();
  } catch (err) {
    return res.status(401).json({ erro: 'Sessão expirada. Faça login novamente' });
  }
};

module.exports = auth;
