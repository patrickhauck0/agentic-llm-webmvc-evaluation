const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// ============================================================
// Pool de Conexão PostgreSQL — Supabase
// ============================================================
// O arquivo 'supabase-ca.crt' deve ser baixado manualmente e
// colocado na raiz do projeto para habilitar SSL seguro.
//
// Para obtê-lo, acesse o painel do Supabase:
//   Settings → Database → SSL → Download Certificate
//
// A variável DATABASE_URL deve conter a string de conexão
// direta do Supabase no formato:
//   postgresql://postgres.[ref]:[password]@[host]:5432/postgres
// ============================================================

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: true,
    ca: fs.readFileSync(path.join(__dirname, '../supabase-ca.crt')).toString()
  }
});

module.exports = pool;
