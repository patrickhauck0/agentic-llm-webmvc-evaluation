// controllers/authController.js

const bcrypt = require('bcryptjs'); // using bcryptjs as chosen hashing lib
const jwt = require('jsonwebtoken');
require('dotenv').config();
const UsuarioModel = require('../models/UsuarioModel');

/**
 * RF01 – Cadastro de usuário
 */
async function register(req, res) {
  const { nome, email, senha } = req.body;

  // validações básicas
  if (!nome || nome.length > 100) {
    return res.status(400).json({ mensagem: 'Nome inválido' });
  }
  if (!email || email.length > 255) {
    return res.status(400).json({ mensagem: 'E-mail inválido' });
  }
  if (!senha || senha.length < 6) {
    return res.status(400).json({ mensagem: 'Senha deve conter no mínimo 6 caracteres' });
  }

  // verifica e‑mail duplicado
  if (await UsuarioModel.emailExists(email)) {
    return res.status(409).json({ mensagem: 'E-mail já cadastrado' });
  }

  const senhaHash = await bcrypt.hash(senha, 10);
  const usuario = await UsuarioModel.create(nome, email, senhaHash);
  return res.status(201).json({ id_usuario: usuario.id_usuario, nome: usuario.nome, email: usuario.email, criado_em: usuario.criado_em });
}

/**
 * RF02 – Login
 */
async function login(req, res) {
  const { email, senha } = req.body;
  if (!email || !senha) {
    return res.status(400).json({ mensagem: 'E-mail ou senha incorretos' });
  }
  const usuario = await UsuarioModel.findByEmail(email);
  if (!usuario) {
    return res.status(401).json({ mensagem: 'E-mail ou senha incorretos' });
  }
  const match = await bcrypt.compare(senha, usuario.senha_hash);
  if (!match) {
    return res.status(401).json({ mensagem: 'E-mail ou senha incorretos' });
  }
  const token = jwt.sign({ id_usuario: usuario.id_usuario }, process.env.JWT_SECRET, { expiresIn: '24h' });
  return res.status(200).json({ token });
}

/**
 * RF03 – Logout (só devolve 200, o front descarta o token)
 */
function logout(req, res) {
  return res.status(200).json({ mensagem: 'Logout realizado com sucesso' });
}

module.exports = { register, login, logout };
