const TarefaModel = require('../models/TarefaModel');
const ProjetoModel = require('../models/ProjetoModel');
const TarefaTagModel = require('../models/TarefaTagModel');

class TarefaController {
    static async criar(req, res) {
        try {
            const { projetoId } = req.params;
            const { titulo, descricao, data_conclusao, tags } = req.body;
            const id_usuario = req.id_usuario;

            if (!titulo || titulo.length < 3 || titulo.length > 150) {
                return res.status(400).json({ erro: 'Título inválido' });
            }
            if (data_conclusao && isNaN(Date.parse(data_conclusao))) {
                return res.status(400).json({ erro: 'Data inválida' });
            }

            // Verificar ownership do projeto
            const projeto = await ProjetoModel.buscarProjeto(projetoId, id_usuario);
            if (!projeto) {
                return res.status(404).json({ erro: 'Projeto não encontrado' });
            }

            // Validar ownership das tags (RF13) ANTES de criar a tarefa
            if (tags && tags.length > 0) {
                const todasTagsValidas = await TarefaTagModel.verificarOwnershipTags(tags, id_usuario);
                if (!todasTagsValidas) {
                    return res.status(403).json({ erro: 'Acesso negado. A tag não pertence a este usuário' });
                }
            }

            // Criar a tarefa
            const novaTarefa = await TarefaModel.criarTarefa(titulo, descricao, data_conclusao || null, projetoId);

            // Associar as tags
            if (tags && tags.length > 0) {
                await TarefaTagModel.associarTags(novaTarefa.id_tarefa, tags);
            }

            return res.status(201).json(novaTarefa);
        } catch (error) {
            console.error('Erro ao criar tarefa:', error);
            return res.status(500).json({ erro: 'Erro interno do servidor' });
        }
    }

    static async editar(req, res) {
        try {
            const { id } = req.params;
            const { titulo, descricao, data_conclusao, tags } = req.body;
            const id_usuario = req.id_usuario;

            if (!titulo || titulo.length < 3 || titulo.length > 150) {
                return res.status(400).json({ erro: 'Título inválido' });
            }
            if (data_conclusao && isNaN(Date.parse(data_conclusao))) {
                return res.status(400).json({ erro: 'Data inválida' });
            }

            // Verifica se tarefa existe e pertence ao usuário
            const tarefa = await TarefaModel.buscarTarefa(id, id_usuario);
            if (!tarefa) {
                return res.status(404).json({ erro: 'Tarefa não encontrada' });
            }

            // Validar tags
            if (tags) {
                const todasTagsValidas = await TarefaTagModel.verificarOwnershipTags(tags, id_usuario);
                if (!todasTagsValidas) {
                    return res.status(403).json({ erro: 'Acesso negado. A tag não pertence a este usuário' });
                }
            }

            const tarefaAtualizada = await TarefaModel.atualizarTarefa(id, titulo, descricao, data_conclusao || null);

            // Sincronizar tags se enviadas
            if (tags) {
                await TarefaTagModel.removerAssociacoes(id);
                if (tags.length > 0) {
                    await TarefaTagModel.associarTags(id, tags);
                }
            }

            return res.status(200).json(tarefaAtualizada);
        } catch (error) {
            console.error('Erro ao editar tarefa:', error);
            return res.status(500).json({ erro: 'Erro interno do servidor' });
        }
    }

    static async excluir(req, res) {
        try {
            const { id } = req.params;
            const id_usuario = req.id_usuario;

            const tarefa = await TarefaModel.buscarTarefa(id, id_usuario);
            if (!tarefa) {
                return res.status(404).json({ erro: 'Tarefa não encontrada' });
            }

            await TarefaModel.excluirTarefa(id);
            return res.status(200).json({ mensagem: 'Tarefa excluída com sucesso' });
        } catch (error) {
            console.error('Erro ao excluir tarefa:', error);
            return res.status(500).json({ erro: 'Erro interno do servidor' });
        }
    }

    static async alterarStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body; // Novo status
            const id_usuario = req.id_usuario;

            const tarefa = await TarefaModel.buscarTarefa(id, id_usuario);
            if (!tarefa) {
                return res.status(404).json({ erro: 'Tarefa não encontrada' });
            }

            const statusAtual = tarefa.status;

            // Validação estrita de transição bidirecional (RF11)
            const transicoesValidas = {
                'Pendente': ['Em Andamento'],
                'Em Andamento': ['Pendente', 'Concluída'],
                'Concluída': ['Em Andamento']
            };

            const proximosStatus = transicoesValidas[statusAtual];
            if (!proximosStatus || !proximosStatus.includes(status)) {
                return res.status(400).json({ erro: 'Transição de status inválida' });
            }

            const tarefaAtualizada = await TarefaModel.atualizarStatus(id, status);
            return res.status(200).json(tarefaAtualizada);
        } catch (error) {
            console.error('Erro ao alterar status:', error);
            return res.status(500).json({ erro: 'Erro interno do servidor' });
        }
    }

    static async listar(req, res) {
        try {
            const { projetoId } = req.params;
            const id_usuario = req.id_usuario;

            // Verificar se o projeto pertence ao usuário
            const projeto = await ProjetoModel.buscarProjeto(projetoId, id_usuario);
            if (!projeto) {
                return res.status(404).json({ erro: 'Projeto não encontrado' });
            }

            // Extrair filtros e ordenação do req.query
            // Espera-se status array: ?status=Pendente&status=Em Andamento
            // Espera-se tags array: ?tags=1&tags=2
            // Espera-se ordenacao string: ?ordenacao=data_asc
            
            let queryStatus = req.query.status;
            let queryTags = req.query.tags;
            const ordenacao = req.query.ordenacao || 'data_asc';

            // Garantir que status seja um array ou undefined
            if (queryStatus && !Array.isArray(queryStatus)) {
                queryStatus = [queryStatus];
            }
            
            // Garantir que tags seja um array ou undefined
            if (queryTags && !Array.isArray(queryTags)) {
                queryTags = [queryTags];
            }

            const filtros = {
                status: queryStatus,
                tags: queryTags ? queryTags.map(Number).filter(n => !isNaN(n)) : undefined
            };

            const tarefas = await TarefaModel.listarTarefasProjeto(projetoId, id_usuario, filtros, ordenacao);
            
            if (tarefas.length === 0 && (filtros.status || filtros.tags)) {
                return res.status(200).json([]);
            }

            return res.status(200).json(tarefas);
        } catch (error) {
            console.error('Erro ao listar tarefas:', error);
            return res.status(500).json({ erro: 'Erro interno do servidor' });
        }
    }
}

module.exports = TarefaController;
