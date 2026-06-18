const ProjetoModel = require('../models/ProjetoModel');

// ============================================================
// ProjetoController — Módulo de Projetos
// RF04: Criação de Projeto
// RF05: Listagem de Projetos
// RF06: Edição de Projeto
// RF07: Exclusão de Projeto
// ============================================================

/**
 * RF04 — Criação de Projeto
 *
 * Valida nome (3-100 caracteres), persiste com id_usuario do token.
 *
 * POST /api/projetos
 */
const criar = async (req, res) => {
  try {
    const { nome, descricao } = req.body;
    const idUsuario = req.userId;

    // Validação do nome (obrigatório, 3-100 caracteres)
    if (!nome || nome.trim().length < 3) {
      return res.status(400).json({ erro: 'O nome do projeto deve conter pelo menos 3 caracteres' });
    }
    if (nome.trim().length > 100) {
      return res.status(400).json({ erro: 'O nome do projeto deve conter no máximo 100 caracteres' });
    }

    const projeto = await ProjetoModel.criar(nome.trim(), descricao, idUsuario);
    return res.status(201).json(projeto);
  } catch (err) {
    console.error('Erro ao criar projeto:', err);
    return res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

/**
 * RF05 — Listagem de Projetos
 *
 * Retorna SOMENTE projetos do id_usuario autenticado.
 * Array vazio se não houver projetos.
 *
 * GET /api/projetos
 */
const listar = async (req, res) => {
  try {
    const idUsuario = req.userId;
    const projetos = await ProjetoModel.listarPorUsuario(idUsuario);
    return res.status(200).json(projetos);
  } catch (err) {
    console.error('Erro ao listar projetos:', err);
    return res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

/**
 * RF06 — Edição de Projeto
 *
 * Verifica ownership (projeto pertence ao id_usuario do token).
 * Valida nome (3-100 caracteres). Atualiza o registro.
 *
 * PUT /api/projetos/:id
 */
const atualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, descricao } = req.body;
    const idUsuario = req.userId;

    // Verificar se o projeto existe
    const projeto = await ProjetoModel.buscarPorId(id);
    if (!projeto) {
      return res.status(404).json({ erro: 'Projeto não encontrado' });
    }

    // Verificar ownership
    if (projeto.id_usuario !== idUsuario) {
      return res.status(403).json({ erro: 'Acesso negado' });
    }

    // Validação do nome
    if (!nome || nome.trim().length < 3) {
      return res.status(400).json({ erro: 'O nome do projeto deve conter pelo menos 3 caracteres' });
    }
    if (nome.trim().length > 100) {
      return res.status(400).json({ erro: 'O nome do projeto deve conter no máximo 100 caracteres' });
    }

    const projetoAtualizado = await ProjetoModel.atualizar(id, nome.trim(), descricao);
    return res.status(200).json(projetoAtualizado);
  } catch (err) {
    console.error('Erro ao atualizar projeto:', err);
    return res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

/**
 * RF07 — Exclusão de Projeto
 *
 * Verifica ownership. Executa DELETE simples — o ON DELETE CASCADE
 * no schema cuida de remover automaticamente:
 *   - Todas as tarefas do projeto (FK tarefa.id_projeto)
 *   - Todas as associações tarefa_tag dessas tarefas (FK tarefa_tag.id_tarefa)
 *
 * DELETE /api/projetos/:id
 */
const excluir = async (req, res) => {
  try {
    const { id } = req.params;
    const idUsuario = req.userId;

    // Verificar se o projeto existe
    const projeto = await ProjetoModel.buscarPorId(id);
    if (!projeto) {
      return res.status(404).json({ erro: 'Projeto não encontrado' });
    }

    // Verificar ownership
    if (projeto.id_usuario !== idUsuario) {
      return res.status(403).json({ erro: 'Acesso negado' });
    }

    await ProjetoModel.excluir(id, idUsuario);
    return res.status(200).json({ mensagem: 'Projeto excluído com sucesso' });
  } catch (err) {
    console.error('Erro ao excluir projeto:', err);
    return res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

module.exports = { criar, listar, atualizar, excluir };
