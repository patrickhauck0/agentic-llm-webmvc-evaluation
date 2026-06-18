const pool = require('../config/database');

// ============================================================
// TarefaModel — Queries SQL para a entidade 'tarefa'
// RF08: Criação de Tarefa
// RF09: Edição de Tarefa
// RF10: Exclusão de Tarefa
// RF11: Alteração de Status da Tarefa
// RF14: Filtragem e Ordenação de Tarefas
// ============================================================

class TarefaModel {
  /**
   * Cria uma nova tarefa com status padrão 'Pendente' (DEFAULT do schema).
   * O campo criado_em é gerado automaticamente.
   */
  static async criar(titulo, descricao, dataConclusao, idProjeto) {
    const result = await pool.query(
      `INSERT INTO tarefa (titulo, descricao, data_conclusao, id_projeto)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [titulo, descricao || null, dataConclusao || null, idProjeto]
    );
    return result.rows[0];
  }

  /**
   * Busca uma tarefa pelo ID, incluindo o id_usuario do projeto dono.
   * O JOIN com projeto permite verificar ownership sem query adicional.
   * Usado em RF09, RF10 e RF11.
   */
  static async buscarPorId(idTarefa) {
    const result = await pool.query(
      `SELECT t.*, p.id_usuario
       FROM tarefa t
       JOIN projeto p ON t.id_projeto = p.id_projeto
       WHERE t.id_tarefa = $1`,
      [idTarefa]
    );
    return result.rows[0] || null;
  }

  /**
   * Atualiza título, descrição e data de conclusão de uma tarefa.
   * O status NÃO é alterado aqui — é responsabilidade de atualizarStatus (RF11).
   */
  static async atualizar(idTarefa, titulo, descricao, dataConclusao) {
    const result = await pool.query(
      `UPDATE tarefa
       SET titulo = $1, descricao = $2, data_conclusao = $3
       WHERE id_tarefa = $4
       RETURNING *`,
      [titulo, descricao || null, dataConclusao || null, idTarefa]
    );
    return result.rows[0];
  }

  /**
   * Exclui uma tarefa. O CASCADE em tarefa_tag.id_tarefa remove
   * automaticamente as associações com tags (RF10).
   */
  static async excluir(idTarefa) {
    const result = await pool.query(
      'DELETE FROM tarefa WHERE id_tarefa = $1',
      [idTarefa]
    );
    return result.rowCount > 0;
  }

  /**
   * Atualiza apenas o status de uma tarefa (RF11).
   * A validação da transição é feita no controller, não no model.
   */
  static async atualizarStatus(idTarefa, novoStatus) {
    const result = await pool.query(
      'UPDATE tarefa SET status = $1 WHERE id_tarefa = $2 RETURNING *',
      [novoStatus, idTarefa]
    );
    return result.rows[0];
  }

  /**
   * Lista tarefas de um projeto com filtros opcionais e ordenação (RF14).
   *
   * Filtros suportados:
   *   - status: array de status (ex: ['Pendente', 'Em Andamento'])
   *   - tags: array de id_tag com AND lógico estrito
   *
   * Ordenação:
   *   - ordenar: 'data_conclusao' (padrão) ou 'titulo'
   *   - direcao: 'ASC' (padrão) ou 'DESC'
   *
   * REGRA CRÍTICA RF14 — AND lógico estrito para tags:
   * Se múltiplas tags forem selecionadas, a tarefa DEVE possuir TODAS.
   * Implementado com subquery GROUP BY + HAVING COUNT(DISTINCT id_tag).
   *
   * Tarefas sem data_conclusao ficam por último (NULLS LAST).
   */
  static async listarPorProjeto(idProjeto, filtros = {}) {
    const { status, tags, ordenar, direcao } = filtros;

    let query = 'SELECT DISTINCT t.* FROM tarefa t';
    const params = [];
    let paramIndex = 0;
    const conditions = [];

    // Condição base: filtrar pelo projeto
    paramIndex++;
    conditions.push(`t.id_projeto = $${paramIndex}`);
    params.push(idProjeto);

    // Filtro por tags com AND lógico estrito (RF14)
    // A tarefa deve possuir TODAS as tags selecionadas
    if (tags && tags.length > 0) {
      paramIndex++;
      const tagArrayParam = `$${paramIndex}`;
      paramIndex++;
      const tagCountParam = `$${paramIndex}`;

      conditions.push(
        `t.id_tarefa IN (
          SELECT tt.id_tarefa
          FROM tarefa_tag tt
          WHERE tt.id_tag = ANY(${tagArrayParam}::int[])
          GROUP BY tt.id_tarefa
          HAVING COUNT(DISTINCT tt.id_tag) = ${tagCountParam}
        )`
      );
      params.push(tags);
      params.push(tags.length);
    }

    // Filtro por status (múltipla escolha, OR entre os status selecionados)
    if (status && status.length > 0) {
      paramIndex++;
      conditions.push(`t.status = ANY($${paramIndex}::varchar[])`);
      params.push(status);
    }

    // Montar WHERE
    query += ` WHERE ${conditions.join(' AND ')}`;

    // Ordenação — valores permitidos para prevenção de SQL injection
    const camposOrdenacao = {
      'data_conclusao': 'data_conclusao',
      'titulo': 'titulo'
    };
    const campoOrdem = camposOrdenacao[ordenar] || 'data_conclusao';
    const direcaoOrdem = direcao === 'DESC' ? 'DESC' : 'ASC';

    if (campoOrdem === 'data_conclusao') {
      // Tarefas sem data ficam por último independente da direção
      query += ` ORDER BY t.data_conclusao ${direcaoOrdem} NULLS LAST`;
    } else {
      query += ` ORDER BY t.titulo ${direcaoOrdem}`;
    }

    const result = await pool.query(query, params);
    return result.rows;
  }
}

module.exports = TarefaModel;
