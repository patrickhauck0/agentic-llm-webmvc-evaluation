const db = require('../config/database');

class TarefaTagModel {
    static async associarTags(id_tarefa, tagsIds) {
        if (!tagsIds || tagsIds.length === 0) return;

        // Monta a query para multiplos inserts
        const values = [];
        const placeholders = [];
        let index = 1;
        
        for (const tagId of tagsIds) {
            placeholders.push(`($${index}, $${index + 1})`);
            values.push(id_tarefa, tagId);
            index += 2;
        }

        const query = `
            INSERT INTO tarefa_tag (id_tarefa, id_tag)
            VALUES ${placeholders.join(', ')}
            ON CONFLICT DO NOTHING
        `;
        
        await db.query(query, values);
    }

    static async removerAssociacoes(id_tarefa) {
        const query = `
            DELETE FROM tarefa_tag
            WHERE id_tarefa = $1
        `;
        await db.query(query, [id_tarefa]);
    }

    static async verificarOwnershipTags(tagsIds, id_usuario) {
        if (!tagsIds || tagsIds.length === 0) return true;

        // Cria array de placeholders $1, $2...
        const placeholders = tagsIds.map((_, i) => `$${i + 1}`).join(', ');
        
        const query = `
            SELECT COUNT(DISTINCT id_tag) as count
            FROM tag
            WHERE id_tag IN (${placeholders}) AND id_usuario = $${tagsIds.length + 1}
        `;
        
        const params = [...tagsIds, id_usuario];
        const result = await db.query(query, params);
        
        // Se a quantidade de tags encontradas para este usuário for igual ao número de tags únicas solicitadas, 
        // significa que todas pertencem a ele.
        const tagsUnicasSolicitadas = new Set(tagsIds).size;
        return parseInt(result.rows[0].count, 10) === tagsUnicasSolicitadas;
    }
}

module.exports = TarefaTagModel;
