const TagModel = require('../models/TagModel');
const TarefaTagModel = require('../models/TarefaTagModel');
const TarefaModel = require('../models/TarefaModel');

class TagController {
    static async criar(req, res) {
        try {
            const { nome } = req.body;
            const id_usuario = req.id_usuario;

            if (!nome || nome.trim() === '' || nome.length > 20) {
                return res.status(400).json({ erro: 'Nome de tag inválido' });
            }

            const tagExistente = await TagModel.buscarTagPorNome(nome, id_usuario);
            if (tagExistente) {
                return res.status(409).json({ erro: 'Tag já existe' });
            }

            const novaTag = await TagModel.criarTag(nome, id_usuario);
            return res.status(201).json(novaTag);
        } catch (error) {
            console.error('Erro ao criar tag:', error);
            return res.status(500).json({ erro: 'Erro interno do servidor' });
        }
    }

    static async listar(req, res) {
        try {
            const id_usuario = req.id_usuario;
            const tags = await TagModel.listarTags(id_usuario);
            return res.status(200).json(tags);
        } catch (error) {
            console.error('Erro ao listar tags:', error);
            return res.status(500).json({ erro: 'Erro interno do servidor' });
        }
    }

    static async editar(req, res) {
        try {
            const { id } = req.params;
            const { nome } = req.body;
            const id_usuario = req.id_usuario;

            if (!nome || nome.trim() === '' || nome.length > 20) {
                return res.status(400).json({ erro: 'Nome de tag inválido' });
            }

            const tag = await TagModel.buscarTagPorId(id, id_usuario);
            if (!tag) {
                return res.status(404).json({ erro: 'Tag não encontrada' });
            }

            const tagExistente = await TagModel.buscarTagPorNome(nome, id_usuario);
            if (tagExistente && tagExistente.id_tag != id) {
                return res.status(409).json({ erro: 'Tag já existe' });
            }

            const tagAtualizada = await TagModel.atualizarTag(id, nome, id_usuario);
            return res.status(200).json(tagAtualizada);
        } catch (error) {
            console.error('Erro ao editar tag:', error);
            return res.status(500).json({ erro: 'Erro interno do servidor' });
        }
    }

    static async excluir(req, res) {
        try {
            const { id } = req.params;
            const id_usuario = req.id_usuario;

            const tag = await TagModel.buscarTagPorId(id, id_usuario);
            if (!tag) {
                return res.status(404).json({ erro: 'Tag não encontrada' });
            }

            await TagModel.excluirTag(id, id_usuario);
            return res.status(200).json({ mensagem: 'Tag excluída com sucesso' });
        } catch (error) {
            console.error('Erro ao excluir tag:', error);
            return res.status(500).json({ erro: 'Erro interno do servidor' });
        }
    }

    // RF13: Associação de Tags à Tarefa
    static async associarTagsTarefa(req, res) {
        try {
            const { tarefaId } = req.params;
            const { tags } = req.body; // array de IDs de tags
            const id_usuario = req.id_usuario;

            // Verificar se a tarefa pertence ao usuário
            const tarefa = await TarefaModel.buscarTarefa(tarefaId, id_usuario);
            if (!tarefa) {
                return res.status(404).json({ erro: 'Tarefa não encontrada' });
            }

            if (tags && tags.length > 0) {
                // REGRA CRÍTICA RF13: Verificar ownership de TODAS as tags
                const todasTagsValidas = await TarefaTagModel.verificarOwnershipTags(tags, id_usuario);
                
                if (!todasTagsValidas) {
                    return res.status(403).json({ erro: 'Acesso negado. A tag não pertence a este usuário' });
                }
            }

            // Remove as associações antigas
            await TarefaTagModel.removerAssociacoes(tarefaId);

            // Insere as novas associações, se houver
            if (tags && tags.length > 0) {
                await TarefaTagModel.associarTags(tarefaId, tags);
            }

            return res.status(200).json({ mensagem: 'Tags associadas com sucesso' });
        } catch (error) {
            console.error('Erro ao associar tags à tarefa:', error);
            return res.status(500).json({ erro: 'Erro interno do servidor' });
        }
    }
}

module.exports = TagController;
