// ===== CA ERP — Conexão com o PostgreSQL =====
// As credenciais vêm de variáveis de ambiente (definidas no docker-compose).

const { Pool } = require('pg');

const pool = new Pool({
  // Aceita uma única DATABASE_URL (comum em hosts gerenciados) ou variáveis PG* separadas.
  connectionString: process.env.DATABASE_URL || undefined,
  host: process.env.PGHOST || 'localhost',
  port: Number(process.env.PGPORT) || 5432,
  database: process.env.PGDATABASE || 'ca_erp',
  user: process.env.PGUSER || 'ca_erp',
  password: process.env.PGPASSWORD || 'ca_erp_dev',
  // SSL para Postgres gerenciado (ex.: conexão externa do Render). Ative com PGSSL=true.
  ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : false,
  max: 10,
  idleTimeoutMillis: 30000,
});

pool.on('error', (err) => {
  console.error('[db] erro inesperado no pool de conexões:', err);
});

module.exports = { pool };
