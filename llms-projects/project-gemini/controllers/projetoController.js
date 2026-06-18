const ProjetoModel = require('../models/ProjetoModel');

class ProjetoController {
    static async criar(req, res) {
        try {
            const { nome, descricao } = req.body;
            const id_usuario = req.id_usuario;

            if (!nome || nome.length < 3 || nome.length > 100) {
                return res.status(400).json({ erro: 'O nome do projeto deve conter pelo menos 3 caracteres' });
            }

            const novoProjeto = await ProjetoModel.criarProjeto(nome, descricao, id_usuario);
            return res.status(201).json(novoProjeto);
        } catch (error) {
            console.error('Erro ao criar projeto:', error);
            return res.status(500).json({ erro: 'Erro interno do servidor' });
        }
    }

    static async listar(req, res) {
        try {
            const id_usuario = req.id_usuario;
            const projetos = await ProjetoModel.listarProjetos(id_usuario);
            return res.status(200).json(projetos);
        } catch (error) {
            console.error('Erro ao listar projetos:', error);
            return res.status(500).json({ erro: 'Erro interno do servidor' });
        }
    }

    static async editar(req, res) {
        try {
            const { id } = req.params;
            const { nome, descricao } = req.body;
            const id_usuario = req.id_usuario;

            if (!nome || nome.length < 3 || nome.length > 100) {
                return res.status(400).json({ erro: 'O nome do projeto deve conter pelo menos 3 caracteres' });
            }

            // Verificar ownership
            const projeto = await ProjetoModel.buscarProjeto(id, id_usuario);
            if (!projeto) {
                // Para não vazar se o projeto existe mas é de outro, retornamos 404
                return res.status(404).json({ erro: 'Projeto não encontrado' });
            }

            const projetoAtualizado = await ProjetoModel.atualizarProjeto(id, nome, descricao, id_usuario);
            return res.status(200).json(projetoAtualizado);
        } catch (error) {
            console.error('Erro ao editar projeto:', error);
            return res.status(500).json({ erro: 'Erro interno do servidor' });
        }
    }

    static async excluir(req, res) {
        try {
            const { id } = req.params;
            const id_usuario = req.id_usuario;

            // Verificar ownership / existência
            const projeto = await ProjetoModel.buscarProjeto(id, id_usuario);
            if (!projeto) {
                return res.status(404).json({ erro: 'Projeto não encontrado' });
            }

            await ProjetoModel.excluirProjeto(id, id_usuario);
            return res.status(200).json({ mensagem: 'Projeto excluído com sucesso' });
        } catch (error) {
            console.error('Erro ao excluir projeto:', error);
            return res.status(500).json({ erro: 'Erro interno do servidor' });
        }
    }
}

module.exports = ProjetoController;
