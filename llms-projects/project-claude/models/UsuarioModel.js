const pool = require('../config/database');

// ============================================================
// UsuarioModel — Queries SQL para a entidade 'usuario'
// RF01: Cadastro de Usuário
// RF02: Login e Sessão
// ============================================================

class UsuarioModel {
  /**
   * Busca um usuário pelo e-mail.
   * Usado em RF01 (verificar duplicidade) e RF02 (login).
   */
  static async buscarPorEmail(email) {
    const result = await pool.query(
      'SELECT * FROM usuario WHERE email = $1',
      [email]
    );
    return result.rows[0] || null;
  }

  /**
   * Cria um novo usuário com senha já hashada.
   * Usado em RF01. O campo criado_em é gerado automaticamente pelo DEFAULT.
   */
  static async criar(nome, email, senhaHash) {
    const result = await pool.query(
      `INSERT INTO usuario (nome, email, senha_hash)
       VALUES ($1, $2, $3)
       RETURNING id_usuario, nome, email, criado_em`,
      [nome, email, senhaHash]
    );
    return result.rows[0];
  }
}

module.exports = UsuarioModel;
