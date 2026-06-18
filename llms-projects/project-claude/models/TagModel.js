const pool = require('../config/database');

// ============================================================
// TagModel — Queries SQL para a entidade 'tag'
// RF12: Gerenciamento de Tags (CRUD)
// ============================================================

class TagModel {
  /**
   * Cria uma nova tag vinculada ao id_usuario.
   */
  static async criar(nome, idUsuario) {
    const result = await pool.query(
      'INSERT INTO tag (nome, id_usuario) VALUES ($1, $2) RETURNING *',
      [nome, idUsuario]
    );
    return result.rows[0];
  }

  /**
   * Lista todas as tags de um usuário, ordenadas alfabeticamente.
   * Retorna array vazio se o usuário não tiver tags.
   */
  static async listarPorUsuario(idUsuario) {
    const result = await pool.query(
      'SELECT * FROM tag WHERE id_usuario = $1 ORDER BY nome ASC',
      [idUsuario]
    );
    return result.rows;
  }

  /**
   * Busca uma tag pelo ID. Retorna null se não encontrada.
   */
  static async buscarPorId(idTag) {
    const result = await pool.query(
      'SELECT * FROM tag WHERE id_tag = $1',
      [idTag]
    );
    return result.rows[0] || null;
  }

  /**
   * Atualiza o nome de uma tag existente.
   */
  static async atualizar(idTag, nome) {
    const result = await pool.query(
      'UPDATE tag SET nome = $1 WHERE id_tag = $2 RETURNING *',
      [nome, idTag]
    );
    return result.rows[0];
  }

  /**
   * Exclui uma tag. A cláusula WHERE inclui id_usuario para segurança.
   * O ON DELETE CASCADE em tarefa_tag.id_tag remove automaticamente
   * as associações, mas as tarefas permanecem intactas (RF12).
   */
  static async excluir(idTag, idUsuario) {
    const result = await pool.query(
      'DELETE FROM tag WHERE id_tag = $1 AND id_usuario = $2',
      [idTag, idUsuario]
    );
    return result.rowCount > 0;
  }

  /**
   * Busca uma tag pelo nome e id_usuario.
   * Usado para verificar duplicidade — a constraint UNIQUE(nome, id_usuario)
   * garante unicidade por usuário, não global (RF12).
   */
  static async buscarPorNomeEUsuario(nome, idUsuario) {
    const result = await pool.query(
      'SELECT * FROM tag WHERE nome = $1 AND id_usuario = $2',
      [nome, idUsuario]
    );
    return result.rows[0] || null;
  }
}

module.exports = TagModel;
