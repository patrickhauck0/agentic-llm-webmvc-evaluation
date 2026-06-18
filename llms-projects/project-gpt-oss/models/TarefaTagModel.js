// models/TarefaTagModel.js

const db = require('../config/database');

/**
 * Associa várias tags a uma tarefa.
 * @param {number} id_tarefa
 * @param {number[]} tagIds - array de id_tag já verificado
 */
async function associateTags(id_tarefa, tagIds) {
  if (!tagIds.length) return;
  // construímos a query INSERT VALUES (...), (...)
  const values = [];
  const rows = tagIds.map((tagId, i) => {
    const idx1 = i * 2 + 1;
    const idx2 = i * 2 + 2;
    values.push(id_tarefa, tagId);
    return `($${idx1}, $${idx2})`;
  }).join(',');
  const query = `INSERT INTO tarefa_tag (id_tarefa, id_tag) VALUES ${rows}`;
  await db.query(query, values);
}

/**
 * Remove todas as associações de tags de uma tarefa.
 */
async function clearTagsForTarefa(id_tarefa) {
  await db.query('DELETE FROM tarefa_tag WHERE id_tarefa = $1', [id_tarefa]);
}

/**
 * Verifica se todas as tags pertencem ao usuário informado.
 * Retorna true se todas pertencem, false caso contrário.
 */
async function verifyOwnershipOfTags(tagIds, id_usuario) {
  if (!tagIds.length) return true; // nada a validar
  const placeholders = tagIds.map((_, i) => `$${i + 2}`).join(',');
  const query = `SELECT COUNT(*) AS cnt FROM tag WHERE id_tag IN (${placeholders}) AND id_usuario = $1`;
  const params = [id_usuario, ...tagIds];
  const result = await db.query(query, params);
  const count = parseInt(result.rows[0].cnt, 10);
  return count === tagIds.length;
}

module.exports = { associateTags, clearTagsForTarefa, verifyOwnershipOfTags };
