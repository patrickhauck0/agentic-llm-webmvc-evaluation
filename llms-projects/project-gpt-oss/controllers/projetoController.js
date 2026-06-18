// controllers/projetoController.js

const ProjetoModel = require('../models/ProjetoModel');

/**
 * RF04 – Criação de Projeto
 */
async function createProjeto(req, res) {
  const { nome, descricao } = req.body;
  const id_usuario = req.user.id_usuario;

  if (!nome || nome.length < 3) {
    return res.status(400).json({ mensagem: 'O nome do projeto deve conter pelo menos 3 caracteres' });
  }

  try {
    const projeto = await ProjetoModel.create(nome, descricao || null, id_usuario);
    return res.status(201).json(projeto);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ mensagem: 'Erro ao criar projeto' });
  }
}

/**
 * RF05 – Listagem de Projetos do usuário
 */
async function listProjetos(req, res) {
  const id_usuario = req.user.id_usuario;
  try {
    const projetos = await ProjetoModel.findAllByUser(id_usuario);
    return res.status(200).json(projetos);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ mensagem: 'Erro ao listar projetos' });
  }
}

/**
 * RF06 – Atualização de Projeto
 */
async function updateProjeto(req, res) {
  const { id } = req.params; // id_projeto
  const { nome, descricao } = req.body;
  const id_usuario = req.user.id_usuario;

  if (!nome || nome.length < 3) {
    return res.status(400).json({ mensagem: 'O nome do projeto deve conter pelo menos 3 caracteres' });
  }

  const projeto = await ProjetoModel.findByIdAndUser(id, id_usuario);
  if (!projeto) {
    // pode ser não encontrado ou não pertence ao usuário
    const exists = await ProjetoModel.findByIdAndUser(id, null);
    if (!exists) return res.status(404).json({ mensagem: 'Projeto não encontrado' });
    return res.status(403).json({ mensagem: 'Projeto não pertence ao usuário' });
  }

  try {
    const updated = await ProjetoModel.update(id, nome, descricao || null);
    return res.status(200).json(updated);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ mensagem: 'Erro ao atualizar projeto' });
  }
}

/**
 * RF07 – Exclusão de Projeto
 */
async function deleteProjeto(req, res) {
  const { id } = req.params; // id_projeto
  const id_usuario = req.user.id_usuario;

  const projeto = await ProjetoModel.findByIdAndUser(id, id_usuario);
  if (!projeto) {
    const exists = await ProjetoModel.findByIdAndUser(id, null);
    if (!exists) return res.status(404).json({ mensagem: 'Projeto não encontrado' });
    return res.status(403).json({ mensagem: 'Projeto não pertence ao usuário' });
  }

  try {
    await ProjetoModel.remove(id);
    return res.status(200).json({ mensagem: 'Projeto excluído com sucesso' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ mensagem: 'Erro ao excluir projeto' });
  }
}

module.exports = { createProjeto, listProjetos, updateProjeto, deleteProjeto };
