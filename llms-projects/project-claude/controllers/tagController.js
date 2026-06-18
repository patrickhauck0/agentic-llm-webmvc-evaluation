const TagModel = require('../models/TagModel');
const TarefaModel = require('../models/TarefaModel');
const TarefaTagModel = require('../models/TarefaTagModel');

// ============================================================
// TagController — Módulo de Tags
// RF12: Gerenciamento de Tags (CRUD)
// RF13: Associação de Tags a uma Tarefa
// ============================================================

/**
 * RF12 — Criar Tag
 *
 * Valida nome (obrigatório, máximo 20 caracteres).
 * Verifica duplicidade para o MESMO usuário — dois usuários
 * diferentes podem ter tags com o mesmo nome.
 *
 * POST /api/tags
 */
const criar = async (req, res) => {
  try {
    const { nome } = req.body;
    const idUsuario = req.userId;

    // Validação do nome
    if (!nome || nome.trim().length === 0) {
      return res.status(400).json({ erro: 'Nome da tag é obrigatório' });
    }
    if (nome.trim().length > 20) {
      return res.status(400).json({ erro: 'Nome da tag deve conter no máximo 20 caracteres' });
    }

    // Verificar duplicidade para o MESMO usuário (constraint UNIQUE(nome, id_usuario))
    const existente = await TagModel.buscarPorNomeEUsuario(nome.trim(), idUsuario);
    if (existente) {
      return res.status(409).json({ erro: 'Tag já existe' });
    }

    const tag = await TagModel.criar(nome.trim(), idUsuario);
    return res.status(201).json(tag);
  } catch (err) {
    console.error('Erro ao criar tag:', err);
    return res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

/**
 * RF12 — Listar Tags
 *
 * Retorna APENAS as tags do id_usuario autenticado.
 * Array vazio se o usuário não tiver tags.
 *
 * GET /api/tags
 */
const listar = async (req, res) => {
  try {
    const idUsuario = req.userId;
    const tags = await TagModel.listarPorUsuario(idUsuario);
    return res.status(200).json(tags);
  } catch (err) {
    console.error('Erro ao listar tags:', err);
    return res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

/**
 * RF12 — Editar Tag
 *
 * Verifica ownership. Valida nome. Verifica duplicidade do novo nome.
 *
 * PUT /api/tags/:id
 */
const atualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const { nome } = req.body;
    const idUsuario = req.userId;

    // Verificar se a tag existe
    const tag = await TagModel.buscarPorId(id);
    if (!tag) {
      return res.status(404).json({ erro: 'Tag não encontrada' });
    }

    // Verificar ownership
    if (tag.id_usuario !== idUsuario) {
      return res.status(403).json({ erro: 'Acesso negado' });
    }

    // Validação do nome
    if (!nome || nome.trim().length === 0) {
      return res.status(400).json({ erro: 'Nome da tag é obrigatório' });
    }
    if (nome.trim().length > 20) {
      return res.status(400).json({ erro: 'Nome da tag deve conter no máximo 20 caracteres' });
    }

    // Verificar duplicidade do novo nome para o MESMO usuário
    const existente = await TagModel.buscarPorNomeEUsuario(nome.trim(), idUsuario);
    if (existente && existente.id_tag !== parseInt(id)) {
      return res.status(409).json({ erro: 'Tag já existe' });
    }

    const tagAtualizada = await TagModel.atualizar(id, nome.trim());
    return res.status(200).json(tagAtualizada);
  } catch (err) {
    console.error('Erro ao atualizar tag:', err);
    return res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

/**
 * RF12 — Excluir Tag
 *
 * Verifica ownership. O CASCADE em tarefa_tag.id_tag remove
 * automaticamente as associações. As tarefas permanecem intactas.
 *
 * DELETE /api/tags/:id
 */
const excluir = async (req, res) => {
  try {
    const { id } = req.params;
    const idUsuario = req.userId;

    // Verificar se a tag existe
    const tag = await TagModel.buscarPorId(id);
    if (!tag) {
      return res.status(404).json({ erro: 'Tag não encontrada' });
    }

    // Verificar ownership
    if (tag.id_usuario !== idUsuario) {
      return res.status(403).json({ erro: 'Acesso negado' });
    }

    await TagModel.excluir(id, idUsuario);
    return res.status(200).json({ mensagem: 'Tag excluída com sucesso' });
  } catch (err) {
    console.error('Erro ao excluir tag:', err);
    return res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

/**
 * RF13 — Associar Tags a uma Tarefa
 *
 * REGRA CRÍTICA: Valida ownership de TODAS as tags da lista
 * ANTES de qualquer INSERT/UPDATE em tarefa_tag.
 * Se QUALQUER tag falhar, NENHUMA operação é executada.
 *
 * PUT /api/tarefas/:tarefaId/tags
 */
const associarTags = async (req, res) => {
  try {
    const { tarefaId } = req.params;
    const { tags } = req.body; // Array de id_tag
    const idUsuario = req.userId;

    // Verificar se a tarefa existe e ownership via projeto
    const tarefa = await TarefaModel.buscarPorId(tarefaId);
    if (!tarefa) {
      return res.status(404).json({ erro: 'Tarefa não encontrada' });
    }
    if (tarefa.id_usuario !== idUsuario) {
      return res.status(403).json({ erro: 'Acesso negado' });
    }

    // Validar ownership de TODAS as tags
    if (tags && tags.length > 0) {
      const tagsValidas = await TarefaTagModel.verificarOwnership(tags, idUsuario);
      if (!tagsValidas) {
        return res.status(403).json({ erro: 'Acesso negado. A tag não pertence a este usuário' });
      }
    }

    // Sincronizar tags (remove antigas, insere novas)
    await TarefaTagModel.sincronizar(tarefaId, tags || []);

    // Carregar tags atualizadas para a resposta
    const tarefaTags = await TarefaTagModel.listarPorTarefa(tarefaId);

    return res.status(200).json({
      id_tarefa: parseInt(tarefaId),
      tags: tarefaTags
    });
  } catch (err) {
    console.error('Erro ao associar tags:', err);
    return res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

module.exports = { criar, listar, atualizar, excluir, associarTags };
