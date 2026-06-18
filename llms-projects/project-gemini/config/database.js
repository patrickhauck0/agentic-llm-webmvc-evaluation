const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// NOTA: O arquivo supabase-ca.crt deverá ser baixado manualmente e colocado na raiz do projeto
// para que a validação do certificado SSL do Supabase funcione corretamente.
let sslConfig = false;

try {
    const certPath = path.join(__dirname, '../supabase-ca.crt');
    if (fs.existsSync(certPath)) {
        sslConfig = {
            rejectUnauthorized: true,
            ca: fs.readFileSync(certPath).toString()
        };
    } else {
        // Fallback simples caso não exista o arquivo localmente, porém o Supabase exige SSL
        console.warn("Aviso: supabase-ca.crt não encontrado na raiz do projeto. Usando { rejectUnauthorized: false }");
        sslConfig = { rejectUnauthorized: false };
    }
} catch (error) {
    console.error("Erro ao configurar SSL para o banco de dados", error);
    sslConfig = { rejectUnauthorized: false };
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: sslConfig
});

module.exports = {
    query: (text, params) => pool.query(text, params),
};
