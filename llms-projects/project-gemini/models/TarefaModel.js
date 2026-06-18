const db = require('../config/database');

class TarefaModel {
    static async criarTarefa(titulo, descricao, data_conclusao, id_projeto) {
        const query = `
            INSERT INTO tarefa (titulo, descricao, data_conclusao, id_projeto)
            VALUES ($1, $2, $3, $4)
            RETURNING id_tarefa, titulo, descricao, status, data_conclusao, id_projeto, criado_em
        `;
        const result = await db.query(query, [titulo, descricao, data_conclusao, id_projeto]);
        return result.rows[0];
    }

    static async buscarTarefa(id_tarefa, id_usuario) {
        // Verifica a tarefa e o ownership do projeto associado
        const query = `
            SELECT t.id_tarefa, t.titulo, t.descricao, t.status, t.data_conclusao, t.id_projeto, t.criado_em
            FROM tarefa t
            INNER JOIN projeto p ON t.id_projeto = p.id_projeto
            WHERE t.id_tarefa = $1 AND p.id_usuario = $2
        `;
        const result = await db.query(query, [id_tarefa, id_usuario]);
        return result.rows[0];
    }

    static async atualizarTarefa(id_tarefa, titulo, descricao, data_conclusao) {
        const query = `
            UPDATE tarefa
            SET titulo = $1, descricao = $2, data_conclusao = $3
            WHERE id_tarefa = $4
            RETURNING id_tarefa, titulo, descricao, status, data_conclusao, id_projeto, criado_em
        `;
        const result = await db.query(query, [titulo, descricao, data_conclusao, id_tarefa]);
        return result.rows[0];
    }

    static async excluirTarefa(id_tarefa) {
        const query = `
            DELETE FROM tarefa
            WHERE id_tarefa = $1
            RETURNING id_tarefa
        `;
        const result = await db.query(query, [id_tarefa]);
        return result.rowCount > 0;
    }

    static async atualizarStatus(id_tarefa, novo_status) {
        const query = `
            UPDATE tarefa
            SET status = $1
            WHERE id_tarefa = $2
            RETURNING id_tarefa, status
        `;
        const result = await db.query(query, [novo_status, id_tarefa]);
        return result.rows[0];
    }

    static async listarTarefasProjeto(id_projeto, id_usuario, filtros = {}, ordenacao = 'data_asc') {
        // Verifica ownership indiretamente na query também, só por precaução
        let queryStr = `
            SELECT t.id_tarefa, t.titulo, t.descricao, t.status, t.data_conclusao, t.criado_em
            FROM tarefa t
            INNER JOIN projeto p ON t.id_projeto = p.id_projeto
            WHERE t.id_projeto = $1 AND p.id_usuario = $2
        `;
        
        const params = [id_projeto, id_usuario];
        let paramCount = 3;

        // Filtro de Status
        if (filtros.status && filtros.status.length > 0) {
            const statusPlaceholders = filtros.status.map(() => `$${paramCount++}`).join(', ');
            queryStr += ` AND t.status IN (${statusPlaceholders})`;
            params.push(...filtros.status);
        }

        // Filtro de Tags (AND lógico estrito)
        if (filtros.tags && filtros.tags.length > 0) {
            const numTags = filtros.tags.length;
            const tagPlaceholders = filtros.tags.map(() => `$${paramCount++}`).join(', ');
            queryStr += ` 
                AND t.id_tarefa IN (
                    SELECT tt.id_tarefa 
                    FROM tarefa_tag tt 
                    WHERE tt.id_tag IN (${tagPlaceholders})
                    GROUP BY tt.id_tarefa 
                    HAVING COUNT(DISTINCT tt.id_tag) = ${numTags}
                )
            `;
            params.push(...filtros.tags);
        }

        // Ordenação
        switch (ordenacao) {
            case 'data_desc':
                queryStr += ` ORDER BY t.data_conclusao DESC NULLS LAST, t.criado_em DESC`;
                break;
            case 'alfa_asc':
                queryStr += ` ORDER BY t.titulo ASC`;
                break;
            case 'alfa_desc':
                queryStr += ` ORDER BY t.titulo DESC`;
                break;
            case 'data_asc':
            default:
                queryStr += ` ORDER BY t.data_conclusao ASC NULLS LAST, t.criado_em ASC`;
                break;
        }

        const result = await db.query(queryStr, params);
        return result.rows;
    }
}

module.exports = TarefaModel;
