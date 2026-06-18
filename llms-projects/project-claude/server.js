require('dotenv').config();
const express = require('express');
const cors = require('cors');

// ============================================================
// SGT - Sistema de Gerenciamento de Tarefas
// Entry Point — server.js
// ============================================================

// Importação das rotas
const authRoutes = require('./routes/authRoutes');
const projetoRoutes = require('./routes/projetoRoutes');
const { tarefaRouter, projetoTarefaRouter } = require('./routes/tarefaRoutes');
const { tagRouter, tarefaTagRouter } = require('./routes/tagRoutes');

const app = express();

// ============================================================
// Middlewares Globais
// ============================================================
app.use(cors());
app.use(express.json());

// ============================================================
// Registro de Rotas
// ============================================================

// Módulo de Autenticação (RF01, RF02, RF03)
app.use('/api/auth', authRoutes);

// Módulo de Projetos (RF04, RF05, RF06, RF07)
app.use('/api/projetos', projetoRoutes);

// Módulo de Tarefas — rotas no contexto de projeto (RF08, RF14)
app.use('/api/projetos/:projetoId/tarefas', projetoTarefaRouter);

// Módulo de Tarefas — rotas diretas (RF09, RF10, RF11)
app.use('/api/tarefas', tarefaRouter);

// Módulo de Tags — CRUD (RF12)
app.use('/api/tags', tagRouter);

// Módulo de Tags — Associação de tags a tarefa (RF13)
app.use('/api/tarefas/:tarefaId/tags', tarefaTagRouter);

// ============================================================
// Tratamento Global de Erros
// ============================================================
app.use((err, req, res, next) => {
  console.error('Erro interno:', err);
  res.status(500).json({ erro: 'Erro interno do servidor' });
});

// ============================================================
// Inicialização do Servidor
// ============================================================
const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`Servidor SGT rodando na porta ${PORT}`);
});

// Tratamento do erro EADDRINUSE — porta já em uso
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(
      `Erro: A porta ${PORT} já está em uso. Encerre o processo que está usando essa porta ou altere a variável PORT no arquivo .env.`
    );
    process.exit(1);
  }
  throw err;
});
