const db = require('../config/database');

class TagModel {
    static async criarTag(nome, id_usuario) {
        const query = `
            INSERT INTO tag (nome, id_usuario)
            VALUES ($1, $2)
            RETURNING id_tag, nome
        `;
        const result = await db.query(query, [nome, id_usuario]);
        return result.rows[0];
    }

    static async listarTags(id_usuario) {
        const query = `
            SELECT id_tag, nome
            FROM tag
            WHERE id_usuario = $1
            ORDER BY nome ASC
        `;
        const result = await db.query(query, [id_usuario]);
        return result.rows;
    }

    static async buscarTagPorNome(nome, id_usuario) {
        const query = `
            SELECT id_tag
            FROM tag
            WHERE nome = $1 AND id_usuario = $2
        `;
        const result = await db.query(query, [nome, id_usuario]);
        return result.rows[0];
    }

    static async buscarTagPorId(id_tag, id_usuario) {
        const query = `
            SELECT id_tag, nome
            FROM tag
            WHERE id_tag = $1 AND id_usuario = $2
        `;
        const result = await db.query(query, [id_tag, id_usuario]);
        return result.rows[0];
    }

    static async atualizarTag(id_tag, nome, id_usuario) {
        const query = `
            UPDATE tag
            SET nome = $1
            WHERE id_tag = $2 AND id_usuario = $3
            RETURNING id_tag, nome
        `;
        const result = await db.query(query, [nome, id_tag, id_usuario]);
        return result.rows[0];
    }

    static async excluirTag(id_tag, id_usuario) {
        const query = `
            DELETE FROM tag
            WHERE id_tag = $1 AND id_usuario = $2
            RETURNING id_tag
        `;
        const result = await db.query(query, [id_tag, id_usuario]);
        return result.rowCount > 0;
    }
}

module.exports = TagModel;
