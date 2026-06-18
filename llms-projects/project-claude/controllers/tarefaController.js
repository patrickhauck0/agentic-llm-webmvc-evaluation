const TarefaModel = require('../models/TarefaModel');
const ProjetoModel = require('../models/ProjetoModel');
const TarefaTagModel = require('../models/TarefaTagModel');

// ============================================================
// TarefaController — Módulo de Tarefas
// RF08: Criação de Tarefa (+ RF13)
// RF09: Edição de Tarefa (+ RF13)
// RF10: Exclusão de Tarefa
// RF11: Alteração de Status da Tarefa
// RF14: Filtragem e Ordenação de Tarefas
// ============================================================

/**
 * Mapa de transições de status válidas (RF11).
 * Transições bidirecionais e estritamente sequenciais:
 *   Pendente ↔ Em Andamento ↔ Concluída
 * Transições inválidas (bloqueadas):
 *   Pendente → Concluída ❌
 *   Concluída → Pendente ❌
 */
const TRANSICOES_VALIDAS = {
  'Pendente': ['Em Andamento'],
  'Em Andamento': ['Pendente', 'Concluída'],
  'Concluída': ['Em Andamento']
};

/**
 * Valida formato de data YYYY-MM-DD.
 * Verifica se o dia/mês/ano são coerentes (ex: rejeita 2024-02-30).
 */
function isValidDate(dateStr) {
  if (!dateStr) return true; // Campo opcional
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateStr)) return false;

  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

/**
 * RF08 — Criação de Tarefa (com RF13 integrado)
 *
 * Fluxo conforme Diagrama de Sequência:
 * 1. Valida dados básicos (título, data)
 * 2. Verifica ownership do projeto
 * 3. Se houver tags: valida ownership de TODAS antes do INSERT (RF13)
 *    → Se falhar, ABORTA TUDO (não cria a tarefa)
 * 4. Insere tarefa com status 'Pendente'
 * 5. Se houver tags válidas: insere associações em tarefa_tag
 * 6. Retorna HTTP 201 com dados da tarefa + tags
 *
 * POST /api/projetos/:projetoId/tarefas
 */
const criar = async (req, res) => {
  try {
    const { projetoId } = req.params;
    const { titulo, descricao, data_conclusao, tags } = req.body;
    const idUsuario = req.userId;

    // Verificar ownership do projeto
    const projeto = await ProjetoModel.buscarPorId(projetoId);
    if (!projeto) {
      return res.status(404).json({ erro: 'Projeto não encontrado' });
    }
    if (projeto.id_usuario !== idUsuario) {
      return res.status(403).json({ erro: 'Acesso negado' });
    }

    // Validação do título (obrigatório, 3-150 caracteres)
    if (!titulo || titulo.trim().length < 3 || titulo.trim().length > 150) {
      return res.status(400).json({ erro: 'Título inválido' });
    }

    // Validação da data de conclusão (opcional, formato YYYY-MM-DD)
    if (data_conclusao && !isValidDate(data_conclusao)) {
      return res.status(400).json({ erro: 'Data inválida' });
    }

    // RF13: Validar ownership de TODAS as tags ANTES de criar a tarefa
    if (tags && tags.length > 0) {
      const tagsValidas = await TarefaTagModel.verificarOwnership(tags, idUsuario);
      if (!tagsValidas) {
        return res.status(403).json({ erro: 'Acesso negado. A tag não pertence a este usuário' });
      }
    }

    // Inserir tarefa (status = 'Pendente' via DEFAULT do schema)
    const tarefa = await TarefaModel.criar(
      titulo.trim(),
      descricao,
      data_conclusao || null,
      projetoId
    );

    // Associar tags à tarefa (se houver)
    if (tags && tags.length > 0) {
      await TarefaTagModel.sincronizar(tarefa.id_tarefa, tags);
    }

    // Carregar tags para a resposta
    const tarefaTags = await TarefaTagModel.listarPorTarefa(tarefa.id_tarefa);

    return res.status(201).json({ ...tarefa, tags: tarefaTags });
  } catch (err) {
    console.error('Erro ao criar tarefa:', err);
    return res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

/**
 * RF09 — Edição de Tarefa (com RF13 integrado)
 *
 * Verifica ownership via JOIN com projeto.
 * Atualiza campos da tarefa.
 * Se tags foram enviadas, re-sincroniza via RF13.
 *
 * PUT /api/tarefas/:id
 */
const atualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descricao, data_conclusao, tags } = req.body;
    const idUsuario = req.userId;

    // Verificar se a tarefa existe e ownership via projeto
    const tarefa = await TarefaModel.buscarPorId(id);
    if (!tarefa) {
      return res.status(404).json({ erro: 'Tarefa não encontrada' });
    }
    if (tarefa.id_usuario !== idUsuario) {
      return res.status(403).json({ erro: 'Acesso negado' });
    }

    // Validação do título (obrigatório, 3-150 caracteres)
    if (!titulo || titulo.trim().length < 3 || titulo.trim().length > 150) {
      return res.status(400).json({ erro: 'Título inválido' });
    }

    // Validação da data de conclusão (opcional, formato YYYY-MM-DD)
    if (data_conclusao && !isValidDate(data_conclusao)) {
      return res.status(400).json({ erro: 'Data inválida' });
    }

    // RF13: Validar ownership das tags se fornecidas
    if (tags && tags.length > 0) {
      const tagsValidas = await TarefaTagModel.verificarOwnership(tags, idUsuario);
      if (!tagsValidas) {
        return res.status(403).json({ erro: 'Acesso negado. A tag não pertence a este usuário' });
      }
    }

    // Atualizar tarefa
    const tarefaAtualizada = await TarefaModel.atualizar(
      id,
      titulo.trim(),
      descricao,
      data_conclusao || null
    );

    // Sincronizar tags se fornecidas (incluindo array vazio para limpar todas)
    if (tags !== undefined) {
      await TarefaTagModel.sincronizar(tarefaAtualizada.id_tarefa, tags || []);
    }

    // Carregar tags para a resposta
    const tarefaTags = await TarefaTagModel.listarPorTarefa(tarefaAtualizada.id_tarefa);

    return res.status(200).json({ ...tarefaAtualizada, tags: tarefaTags });
  } catch (err) {
    console.error('Erro ao atualizar tarefa:', err);
    return res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

/**
 * RF10 — Exclusão de Tarefa
 *
 * Verifica ownership. Executa DELETE — o CASCADE em tarefa_tag.id_tarefa
 * remove as associações automaticamente. Tags permanecem intactas.
 *
 * DELETE /api/tarefas/:id
 */
const excluir = async (req, res) => {
  try {
    const { id } = req.params;
    const idUsuario = req.userId;

    // Verificar se a tarefa existe e ownership
    const tarefa = await TarefaModel.buscarPorId(id);
    if (!tarefa) {
      return res.status(404).json({ erro: 'Tarefa não encontrada' });
    }
    if (tarefa.id_usuario !== idUsuario) {
      return res.status(403).json({ erro: 'Acesso negado' });
    }

    await TarefaModel.excluir(id);
    return res.status(200).json({ mensagem: 'Tarefa excluída com sucesso' });
  } catch (err) {
    console.error('Erro ao excluir tarefa:', err);
    return res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

/**
 * RF11 — Alteração de Status da Tarefa
 *
 * Transição bidirecional estritamente sequencial:
 *   Pendente ↔ Em Andamento ↔ Concluída
 *
 * Valida a transição ANTES do UPDATE. Se inválida, retorna erro
 * imediatamente sem atualizar o banco.
 *
 * PATCH /api/tarefas/:id/status
 */
const alterarStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const idUsuario = req.userId;

    // Verificar se a tarefa existe e ownership
    const tarefa = await TarefaModel.buscarPorId(id);
    if (!tarefa) {
      return res.status(404).json({ erro: 'Tarefa não encontrada' });
    }
    if (tarefa.id_usuario !== idUsuario) {
      return res.status(403).json({ erro: 'Acesso negado' });
    }

    // Validar transição de status
    const transicoesPermitidas = TRANSICOES_VALIDAS[tarefa.status];
    if (!transicoesPermitidas || !transicoesPermitidas.includes(status)) {
      return res.status(400).json({ erro: 'Transição de status inválida' });
    }

    const tarefaAtualizada = await TarefaModel.atualizarStatus(id, status);
    return res.status(200).json(tarefaAtualizada);
  } catch (err) {
    console.error('Erro ao alterar status:', err);
    return res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

/**
 * RF14 — Filtragem e Ordenação de Tarefas
 *
 * Query params suportados:
 *   - status: string ou array de status (ex: ?status=Pendente&status=Em Andamento)
 *   - tags: string ou array de id_tag (ex: ?tags=1&tags=2) — AND lógico estrito
 *   - ordenar: 'data_conclusao' (padrão) ou 'titulo'
 *   - direcao: 'ASC' (padrão) ou 'DESC'
 *
 * Retorna array vazio se não encontrar tarefas para os filtros.
 *
 * GET /api/projetos/:projetoId/tarefas
 */
const listar = async (req, res) => {
  try {
    const { projetoId } = req.params;
    const idUsuario = req.userId;

    // Verificar ownership do projeto
    const projeto = await ProjetoModel.buscarPorId(projetoId);
    if (!projeto) {
      return res.status(404).json({ erro: 'Projeto não encontrado' });
    }
    if (projeto.id_usuario !== idUsuario) {
      return res.status(403).json({ erro: 'Acesso negado' });
    }

    // Parsear query params
    const filtros = {
      status: req.query.status
        ? (Array.isArray(req.query.status) ? req.query.status : [req.query.status])
        : null,
      tags: req.query.tags
        ? (Array.isArray(req.query.tags) ? req.query.tags.map(Number) : [Number(req.query.tags)])
        : null,
      ordenar: req.query.ordenar || 'data_conclusao',
      direcao: req.query.direcao || 'ASC'
    };

    // Buscar tarefas filtradas
    const tarefas = await TarefaModel.listarPorProjeto(projetoId, filtros);

    // Carregar tags em batch (evita N+1 queries)
    const idTarefas = tarefas.map(t => t.id_tarefa);
    const tagsPorTarefa = await TarefaTagModel.listarPorTarefas(idTarefas);

    // Combinar tarefas com suas tags
    const tarefasComTags = tarefas.map(tarefa => ({
      ...tarefa,
      tags: tagsPorTarefa[tarefa.id_tarefa] || []
    }));

    return res.status(200).json(tarefasComTags);
  } catch (err) {
    console.error('Erro ao listar tarefas:', err);
    return res.status(500).json({ erro: 'Erro interno do servidor' });
  }
};

module.exports = { criar, atualizar, excluir, alterarStatus, listar };
