const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UsuarioModel = require('../models/UsuarioModel');

// ============================================================
// AuthController — Módulo de Autenticação
// RF01: Cadastro de Usuário
// RF02: Login e Sessão
// RF03: Logout
// ============================================================

/**
 * Valida formato básico de e-mail.
 */
function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * RF01 — Cadastro de Usuário
 *
 * Valida entradas (nome, email, senha), verifica duplicidade de e-mail,
 * gera hash da senha com bcrypt e persiste o registro.
 *
 * POST /api/auth/registro
 */
const registrar = async (req, res) => {
  try {
    const { nome, email, senha } = req.body;

    // Validação do nome (obrigatório, máximo 100 caracteres)
    if (!nome || nome.trim().length === 0) {
      return res.status(400).json({ erro: 'Nome é obrigatório' });
    }
    if (nome.trim().length > 100) {
      return res.status(400).json({ erro: 'Nome deve conter no máximo 100 caracteres' });
    }

    // Validação do e-mail (obrigatório, formato válido, máximo 255 caracteres)
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ erro: 'E-mail inválido' });
    }
    if (email.length > 255) {
      return res.status(400).json({ erro: 'E-mail deve conter no máximo 255 caracteres' });
    }

    // Validação da senha (obrigatório, mínimo 6 caracteres)
    if (!senha || senha.length < 6) {
      return res.status(400).json({ erro: 'Senha deve conter no mínimo 6 caracteres' });
    }

    // Verificação de duplicidade de e-mail (HTTP 409)
    const usuarioExistente = await UsuarioModel.buscarPorEmail(email.trim().toLowerCase());
    if (usuarioExistente) {
      return res.status(409).json({ erro: 'E-mail já cadastrado' });
    }

    // Hash da senha com bcrypt (saltRounds = 10)
    const senhaHash = await bcrypt.hash(senha, 10);

    // Persistir usuário
    const usuario = await UsuarioModel.criar(
      nome.trim(),
      email.trim().toLowerCase(),
      senhaHash
    );

    return res.status(201).json({
      mensagem: 'Usuário criado com sucesso',
      usuario: {
        id_usuario: usuario.id_usuario,
        nome: usuario.nome,
        email: usuario.email,
        criado_em: usuario.criado_em
      }
    });
  } catch (err) {
    console.error('Erro no registro:', err);
    return res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

/**
 * RF02 — Login e Sessão
 *
 * Busca o usuário pelo e-mail, valida credenciais via bcrypt.compare.
 * Se corretas, gera Token JWT com expiração de 24 horas.
 *
 * POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    const { email, senha } = req.body;

    // Campos obrigatórios — mesma mensagem genérica para segurança
    if (!email || !senha) {
      return res.status(401).json({ erro: 'E-mail ou senha incorretos' });
    }

    // Busca por e-mail
    const usuario = await UsuarioModel.buscarPorEmail(email.trim().toLowerCase());
    if (!usuario) {
      return res.status(401).json({ erro: 'E-mail ou senha incorretos' });
    }

    // Comparação de senha com bcrypt
    const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
    if (!senhaValida) {
      return res.status(401).json({ erro: 'E-mail ou senha incorretos' });
    }

    // Geração do Token JWT com expiração de 24h
    const token = jwt.sign(
      { id_usuario: usuario.id_usuario },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.status(200).json({
      token,
      usuario: {
        id_usuario: usuario.id_usuario,
        nome: usuario.nome,
        email: usuario.email
      }
    });
  } catch (err) {
    console.error('Erro no login:', err);
    return res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

/**
 * RF03 — Logout
 *
 * Endpoint simbólico. O descarte do token JWT é feito no frontend.
 * A sessão é logicamente encerrada no lado do cliente.
 *
 * POST /api/auth/logout
 */
const logout = async (req, res) => {
  return res.status(200).json({ mensagem: 'Logout realizado com sucesso' });
};

module.exports = { registrar, login, logout };
