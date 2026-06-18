// models/UsuarioModel.js

const db = require('../config/database');

/**
 * Busca usuário pelo e‑mail.
 * @param {string} email
 * @returns {Promise<Object|null>} usuário ou null
 */
async function findByEmail(email) {
  const result = await db.query('SELECT * FROM usuario WHERE email = $1', [email]);
  return result.rows[0] || null;
}

/**
 * Verifica se já existe um usuário com o e‑mail informado.
 */
async function emailExists(email) {
  const result = await db.query('SELECT 1 FROM usuario WHERE email = $1', [email]);
  return result.rowCount > 0;
}

/**
 * Cria novo usuário.
 * @param {string} nome
 * @param {string} email
 * @param {string} senhaHash
 * @returns {Promise<Object>} usuário criado
 */
async function create(nome, email, senhaHash) {
  const result = await db.query(
    `INSERT INTO usuario (nome, email, senha_hash) VALUES ($1, $2, $3) RETURNING id_usuario, nome, email, criado_em`,
    [nome, email, senhaHash]
  );
  return result.rows[0];
}

module.exports = { findByEmail, emailExists, create };
