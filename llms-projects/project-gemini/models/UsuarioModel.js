const db = require('../config/database');

class UsuarioModel {
    static async criarUsuario(nome, email, senhaHash) {
        const query = `
            INSERT INTO usuario (nome, email, senha_hash)
            VALUES ($1, $2, $3)
            RETURNING id_usuario, nome, email, criado_em
        `;
        const result = await db.query(query, [nome, email, senhaHash]);
        return result.rows[0];
    }

    static async buscarPorEmail(email) {
        const query = `
            SELECT id_usuario, nome, email, senha_hash, criado_em
            FROM usuario
            WHERE email = $1
        `;
        const result = await db.query(query, [email]);
        return result.rows[0];
    }

    static async verificarEmailExiste(email) {
        const query = `
            SELECT id_usuario
            FROM usuario
            WHERE email = $1
        `;
        const result = await db.query(query, [email]);
        return result.rows.length > 0;
    }
}

module.exports = UsuarioModel;
