const pool = require('../config/database');

// ============================================================
// ProjetoModel — Queries SQL para a entidade 'projeto'
// RF04: Criação de Projeto
// RF05: Listagem de Projetos
// RF06: Edição de Projeto
// RF07: Exclusão de Projeto (CASCADE cuida das tarefas e tarefa_tag)
// ============================================================

class ProjetoModel {
  /**
   * Cria um novo projeto vinculado ao id_usuario.
   * O campo criado_em é gerado automaticamente pelo DEFAULT.
   */
  static async criar(nome, descricao, idUsuario) {
    const result = await pool.query(
      `INSERT INTO projeto (nome, descricao, id_usuario)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [nome, descricao || null, idUsuario]
    );
    return result.rows[0];
  }

  /**
   * Lista todos os projetos de um usuário, ordenados por data de criação (mais recente primeiro).
   * Retorna array vazio se o usuário não tiver projetos (RF05).
   */
  static async listarPorUsuario(idUsuario) {
    const result = await pool.query(
      'SELECT * FROM projeto WHERE id_usuario = $1 ORDER BY criado_em DESC',
      [idUsuario]
    );
    return result.rows;
  }

  /**
   * Busca um projeto pelo ID. Retorna null se não encontrado.
   * Usado para verificação de ownership em RF06 e RF07.
   */
  static async buscarPorId(idProjeto) {
    const result = await pool.query(
      'SELECT * FROM projeto WHERE id_projeto = $1',
      [idProjeto]
    );
    return result.rows[0] || null;
  }

  /**
   * Atualiza nome e descrição de um projeto existente.
   */
  static async atualizar(idProjeto, nome, descricao) {
    const result = await pool.query(
      `UPDATE projeto SET nome = $1, descricao = $2
       WHERE id_projeto = $3
       RETURNING *`,
      [nome, descricao || null, idProjeto]
    );
    return result.rows[0];
  }

  /**
   * Exclui um projeto. A cláusula WHERE inclui id_usuario para segurança.
   * O ON DELETE CASCADE na FK tarefa.id_projeto remove automaticamente:
   *   - Todas as tarefas do projeto
   *   - Todas as associações tarefa_tag dessas tarefas (RF07)
   */
  static async excluir(idProjeto, idUsuario) {
    const result = await pool.query(
      'DELETE FROM projeto WHERE id_projeto = $1 AND id_usuario = $2',
      [idProjeto, idUsuario]
    );
    return result.rowCount > 0;
  }
}

module.exports = ProjetoModel;
