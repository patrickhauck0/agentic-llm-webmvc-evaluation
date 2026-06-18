// server.js - ponto de entrada da API SGT

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// Middlewares globais
app.use(cors()); // permissivo por padrão, alterar se necessário
app.use(express.json());

// Importação de rotas
const authRoutes = require('./routes/authRoutes');
const projetoRoutes = require('./routes/projetoRoutes');
const tarefaRoutes = require('./routes/tarefaRoutes');
const tagRoutes = require('./routes/tagRoutes');

// Registro de rotas
app.use('/api/auth', authRoutes);
app.use('/api/projetos', projetoRoutes);
app.use('/api/tarefas', tarefaRoutes);
app.use('/api/tags', tagRoutes);

// Tratamento de rotas não encontradas
app.use((req, res) => {
  res.status(404).json({ mensagem: 'Recurso não encontrado' });
});

// Captura de erro genérico
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ mensagem: 'Erro interno do servidor' });
});

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

// Tratamento de erro de porta já em uso
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Porta ${PORT} já está em uso. Encerrando processo.`);
    process.exit(1);
  } else {
    console.error('Erro inesperado no servidor:', err);
  }
});
