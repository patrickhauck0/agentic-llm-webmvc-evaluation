// models/TagModel.js

const db = require('../config/database');

/**
 * Cria nova tag para o usuário.
 */
async function create(nome, id_usuario) {
  const result = await db.query(
    `INSERT INTO tag (nome, id_usuario) VALUES ($1, $2) RETURNING id_tag, nome, criado_em`,
    [nome, id_usuario]
  );
  return result.rows[0];
}

/**
 * Lista todas as tags do usuário.
 */
async function listByUser(id_usuario) {
  const result = await db.query(
    `SELECT id_tag, nome FROM tag WHERE id_usuario = $1 ORDER BY nome ASC`,
    [id_usuario]
  );
  return result.rows;
}

/**
 * Busca tag por id e usuário (ownership).
 */
async function findByIdAndUser(id_tag, id_usuario) {
  const result = await db.query(
    `SELECT id_tag, nome FROM tag WHERE id_tag = $1 AND id_usuario = $2`,
    [id_tag, id_usuario]
  );
  return result.rows[0] || null;
}

/**
 * Atualiza nome da tag (ownership já garantida).
 */
async function update(id_tag, nome) {
  const result = await db.query(
    `UPDATE tag SET nome = $1 WHERE id_tag = $2 RETURNING id_tag, nome`,
    [nome, id_tag]
  );
  return result.rows[0];
}

/**
 * Remove tag. O cascade em tarefa_tag cuida das associações.
 */
async function remove(id_tag) {
  await db.query(`DELETE FROM tag WHERE id_tag = $1`, [id_tag]);
}

/**
 * Verifica se já existe uma tag com o mesmo nome para o mesmo usuário.
 */
async function existsUnique(nome, id_usuario) {
  const result = await db.query(
    `SELECT 1 FROM tag WHERE nome = $1 AND id_usuario = $2`,
    [nome, id_usuario]
  );
  return result.rowCount > 0;
}

module.exports = { create, listByUser, findByIdAndUser, update, remove, existsUnique };
