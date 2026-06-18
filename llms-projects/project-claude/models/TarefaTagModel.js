const pool = require('../config/database');

// ============================================================
// TarefaTagModel — Queries SQL para a entidade 'tarefa_tag'
// RF13: Associação de Tags a uma Tarefa
// ============================================================

class TarefaTagModel {
  /**
   * REGRA CRÍTICA RF13 — Verificação de Ownership de Tags.
   *
   * Valida se TODAS as tags da lista pertencem ao id_usuario da sessão.
   * A verificação é feita em uma única query: conta quantas tags da lista
   * pertencem ao usuário. Se a contagem for diferente do total da lista,
   * significa que pelo menos uma tag não pertence ao usuário ou não existe.
   *
   * Se QUALQUER tag falhar, retorna false e NENHUMA operação é executada.
   *
   * @param {number[]} idTags - Array de IDs de tags a verificar
   * @param {number} idUsuario - ID do usuário autenticado
   * @returns {boolean} true se TODAS as tags pertencem ao usuário
   */
  static async verificarOwnership(idTags, idUsuario) {
    if (!idTags || idTags.length === 0) return true;

    const result = await pool.query(
      'SELECT id_tag FROM tag WHERE id_tag = ANY($1::int[]) AND id_usuario = $2',
      [idTags, idUsuario]
    );

    // Se a quantidade retornada for diferente da enviada,
    // alguma tag não existe ou não pertence ao usuário
    return result.rows.length === idTags.length;
  }

  /**
   * Sincroniza as associações de tags de uma tarefa (RF13).
   * Remove todos os vínculos antigos e insere os novos.
   * Deve ser chamado APÓS verificarOwnership retornar true.
   *
   * @param {number} idTarefa - ID da tarefa
   * @param {number[]} idTags - Array de IDs de tags a associar
   */
  static async sincronizar(idTarefa, idTags) {
    // Remove todas as associações existentes da tarefa
    await pool.query(
      'DELETE FROM tarefa_tag WHERE id_tarefa = $1',
      [idTarefa]
    );

    // Insere as novas associações (se houver)
    if (idTags && idTags.length > 0) {
      const values = idTags.map((_, i) => `($1, $${i + 2})`).join(', ');
      const params = [idTarefa, ...idTags];
      await pool.query(
        `INSERT INTO tarefa_tag (id_tarefa, id_tag) VALUES ${values}`,
        params
      );
    }
  }

  /**
   * Lista as tags associadas a uma tarefa específica.
   * Retorna os dados da tag (id_tag, nome) via JOIN.
   */
  static async listarPorTarefa(idTarefa) {
    const result = await pool.query(
      `SELECT t.id_tag, t.nome
       FROM tarefa_tag tt
       JOIN tag t ON tt.id_tag = t.id_tag
       WHERE tt.id_tarefa = $1
       ORDER BY t.nome ASC`,
      [idTarefa]
    );
    return result.rows;
  }

  /**
   * Lista as tags para múltiplas tarefas de uma vez (batch).
   * Evita N+1 queries ao carregar tags para listagem de tarefas.
   * Retorna um objeto indexado por id_tarefa.
   */
  static async listarPorTarefas(idTarefas) {
    if (!idTarefas || idTarefas.length === 0) return {};

    const result = await pool.query(
      `SELECT tt.id_tarefa, t.id_tag, t.nome
       FROM tarefa_tag tt
       JOIN tag t ON tt.id_tag = t.id_tag
       WHERE tt.id_tarefa = ANY($1::int[])
       ORDER BY t.nome ASC`,
      [idTarefas]
    );

    // Agrupa tags por id_tarefa
    const tagsPorTarefa = {};
    for (const row of result.rows) {
      if (!tagsPorTarefa[row.id_tarefa]) {
        tagsPorTarefa[row.id_tarefa] = [];
      }
      tagsPorTarefa[row.id_tarefa].push({
        id_tag: row.id_tag,
        nome: row.nome
      });
    }
    return tagsPorTarefa;
  }
}

module.exports = TarefaTagModel;
