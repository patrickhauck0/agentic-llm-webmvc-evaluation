const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Importação das Rotas
const authRoutes = require('./routes/authRoutes');
const projetoRoutes = require('./routes/projetoRoutes');
const tarefaRoutes = require('./routes/tarefaRoutes');
const tagRoutes = require('./routes/tagRoutes');

// Registro das Rotas
app.use('/api/auth', authRoutes);
app.use('/api/projetos', projetoRoutes);
app.use('/api/tarefas', tarefaRoutes);
app.use('/api/tags', tagRoutes);

// Regra Obrigatória: Tratar o evento EADDRINUSE
const server = app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});

server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`ERRO: A porta ${PORT} já está em uso.`);
        process.exit(1);
    } else {
        console.error('Ocorreu um erro ao iniciar o servidor:', error);
        process.exit(1);
    }
});
