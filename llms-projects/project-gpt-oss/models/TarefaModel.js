// models/TarefaModel.js

const db = require('../config/database');

/**
 * Cria nova tarefa com status padrão "Pendente".
 */
async function create(titulo, descricao, data_conclusao, id_projeto) {
  const result = await db.query(
    `INSERT INTO tarefa (titulo, descricao, data_conclusao, id_projeto) VALUES ($1, $2, $3, $4) RETURNING id_tarefa, titulo, descricao, status, data_conclusao, criado_em`,
    [titulo, descricao, data_conclusao, id_projeto]
  );
  return result.rows[0];
}

/**
 * Busca tarefa por id e verifica ownership através do projeto (usuario).
 * Retorna a tarefa ou null.
 */
async function findByIdAndUser(id_tarefa, id_usuario) {
  const result = await db.query(
    `SELECT t.* FROM tarefa t
     INNER JOIN projeto p ON t.id_projeto = p.id_projeto
     WHERE t.id_tarefa = $1 AND p.id_usuario = $2`,
    [id_tarefa, id_usuario]
  );
  return result.rows[0] || null;
}

/**
 * Atualiza campos da tarefa. Os parâmetros podem ser null (não alterado).
 */
async function update(id_tarefa, titulo, descricao, data_conclusao) {
  const result = await db.query(
    `UPDATE tarefa SET titulo = $1, descricao = $2, data_conclusao = $3 WHERE id_tarefa = $4 RETURNING id_tarefa, titulo, descricao, status, data_conclusao, criado_em`,
    [titulo, descricao, data_conclusao, id_tarefa]
  );
  return result.rows[0];
}

/**
 * Remove tarefa (cascata remove associações em tarefa_tag).
 */
async function remove(id_tarefa) {
  await db.query(`DELETE FROM tarefa WHERE id_tarefa = $1`, [id_tarefa]);
}

/**
 * Atualiza status da tarefa, garantindo transição válida.
 */
async function changeStatus(id_tarefa, novo_status) {
  const result = await db.query(
    `UPDATE tarefa SET status = $1 WHERE id_tarefa = $2 RETURNING id_tarefa, status`,
    [novo_status, id_tarefa]
  );
  return result.rows[0];
}

/**
 * Lista tarefas de um projeto com filtros opcionais.
 * params: { id_usuario, id_projeto, statusArray, tagIds, order }
 * - statusArray: array de statuses (ex: ['Pendente','Concluída'])
 * - tagIds: array de id_tag que devem estar presentes em todas as tarefas (AND lógico)
 * - order: { field: 'data_conclusao'|'titulo', direction: 'ASC'|'DESC' }
 */
async function listFiltered({ id_usuario, id_projeto, statusArray, tagIds, order }) {
  const values = [id_usuario, id_projeto];
  let idx = 3;
  let whereClauses = [];

  // garante que o projeto pertença ao usuário
  whereClauses.push(`p.id_usuario = $1`);
  whereClauses.push(`t.id_projeto = $2`);

  if (statusArray && statusArray.length) {
    const placeholders = statusArray.map(() => `$${idx++}`).join(',');
    values.push(...statusArray);
    whereClauses.push(`t.status IN (${placeholders})`);
  }

  // filtro por tags (AND estrito)
  let havingClause = '';
  if (tagIds && tagIds.length) {
    const tagPlaceholders = tagIds.map(() => `$${idx++}`).join(',');
    values.push(...tagIds);
    whereClauses.push(`tt.id_tag IN (${tagPlaceholders})`);
    havingClause = `HAVING COUNT(DISTINCT tt.id_tag) = ${tagIds.length}`;
  }

  // montar ORDER BY
  let orderClause = '';
  if (order && order.field) {
    const direction = order.direction === 'DESC' ? 'DESC' : 'ASC';
    if (order.field === 'data_conclusao') {
      orderClause = `ORDER BY t.data_conclusao ${direction} NULLS LAST`;
    } else if (order.field === 'titulo') {
      orderClause = `ORDER BY t.titulo ${direction}`;
    }
  } else {
    // padrão: data_conclusao crescente, nulls last
    orderClause = 'ORDER BY t.data_conclusao ASC NULLS LAST';
  }

  const query = `
    SELECT DISTINCT t.* FROM tarefa t
    INNER JOIN projeto p ON t.id_projeto = p.id_projeto
    ${tagIds && tagIds.length ? 'INNER JOIN tarefa_tag tt ON t.id_tarefa = tt.id_tarefa' : ''}
    WHERE ${whereClauses.join(' AND ')}
    ${havingClause}
    ${orderClause}
  `;

  const result = await db.query(query, values);
  return result.rows;
}

module.exports = { create, findByIdAndUser, update, remove, changeStatus, listFiltered };
