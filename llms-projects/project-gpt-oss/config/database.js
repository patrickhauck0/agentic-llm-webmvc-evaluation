// config/database.js - Configuração do pool de conexão PostgreSQL com SSL para Supabase

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// O arquivo supabase-ca.crt deve estar na raiz do projeto (mesmo nível de package.json)
// Baixe o certificado da CA da sua instância Supabase e coloque-o no caminho abaixo.
const caPath = path.join(__dirname, '..', 'supabase-ca.crt');
let caCert;
try {
  caCert = fs.readFileSync(caPath).toString();
} catch (err) {
  console.warn('Arquivo supabase-ca.crt não encontrado. SSL pode falhar se o certificado for obrigatório.');
  caCert = null;
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Supabase requer SSL. Caso o certificado não esteja disponível, ainda habilitamos SSL sem verificação estrita.
  ssl: caCert ? { rejectUnauthorized: true, ca: caCert } : { rejectUnauthorized: true }
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  getPool: () => pool
};
