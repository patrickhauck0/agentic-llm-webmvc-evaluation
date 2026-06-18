// models/ProjetoModel.js

const db = require('../config/database');

/**
 * Cria um novo projeto associado ao usuário.
 */
async function create(nome, descricao, id_usuario) {
  const result = await db.query(
    `INSERT INTO projeto (nome, descricao, id_usuario) VALUES ($1, $2, $3) RETURNING id_projeto, nome, descricao, criado_em`,
    [nome, descricao, id_usuario]
  );
  return result.rows[0];
}

/**
 * Lista todos os projetos do usuário.
 */
async function findAllByUser(id_usuario) {
  const result = await db.query(
    `SELECT id_projeto, nome, descricao, criado_em FROM projeto WHERE id_usuario = $1 ORDER BY criado_em DESC`,
    [id_usuario]
  );
  return result.rows;
}

/**
 * Busca projeto por id verificando ownership.
 */
async function findByIdAndUser(id_projeto, id_usuario) {
  const result = await db.query(
    `SELECT id_projeto, nome, descricao, criado_em FROM projeto WHERE id_projeto = $1 AND id_usuario = $2`,
    [id_projeto, id_usuario]
  );
  return result.rows[0] || null;
}

/**
 * Atualiza nome e descrição de um projeto (ownership já garantida).
 */
async function update(id_projeto, nome, descricao) {
  const result = await db.query(
    `UPDATE projeto SET nome = $1, descricao = $2 WHERE id_projeto = $3 RETURNING id_projeto, nome, descricao, criado_em`,
    [nome, descricao, id_projeto]
  );
  return result.rows[0];
}

/**
 * Exclui projeto. Cascades cuidam de tarefas e associações.
 */
async function remove(id_projeto) {
  await db.query(`DELETE FROM projeto WHERE id_projeto = $1`, [id_projeto]);
}

module.exports = { create, findAllByUser, findByIdAndUser, update, remove };
