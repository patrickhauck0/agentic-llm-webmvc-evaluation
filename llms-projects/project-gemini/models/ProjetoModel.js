const db = require('../config/database');

class ProjetoModel {
    static async criarProjeto(nome, descricao, id_usuario) {
        const query = `
            INSERT INTO projeto (nome, descricao, id_usuario)
            VALUES ($1, $2, $3)
            RETURNING id_projeto, nome, descricao, criado_em
        `;
        const result = await db.query(query, [nome, descricao, id_usuario]);
        return result.rows[0];
    }

    static async listarProjetos(id_usuario) {
        const query = `
            SELECT id_projeto, nome, descricao, criado_em
            FROM projeto
            WHERE id_usuario = $1
            ORDER BY criado_em DESC
        `;
        const result = await db.query(query, [id_usuario]);
        return result.rows;
    }

    static async buscarProjeto(id_projeto, id_usuario) {
        const query = `
            SELECT id_projeto, nome, descricao, criado_em
            FROM projeto
            WHERE id_projeto = $1 AND id_usuario = $2
        `;
        const result = await db.query(query, [id_projeto, id_usuario]);
        return result.rows[0]; // Retorna undefined se não achar/não for do dono
    }

    static async atualizarProjeto(id_projeto, nome, descricao, id_usuario) {
        const query = `
            UPDATE projeto
            SET nome = $1, descricao = $2
            WHERE id_projeto = $3 AND id_usuario = $4
            RETURNING id_projeto, nome, descricao, criado_em
        `;
        const result = await db.query(query, [nome, descricao, id_projeto, id_usuario]);
        return result.rows[0];
    }

    static async excluirProjeto(id_projeto, id_usuario) {
        const query = `
            DELETE FROM projeto
            WHERE id_projeto = $1 AND id_usuario = $2
            RETURNING id_projeto
        `;
        const result = await db.query(query, [id_projeto, id_usuario]);
        return result.rowCount > 0;
    }
}

module.exports = ProjetoModel;
