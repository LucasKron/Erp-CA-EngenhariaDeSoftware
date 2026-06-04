// ============================================================
//  CA ERP — API REST (Express + PostgreSQL) + painel + login
//
//  Por recurso (membros, financeiro, eventos, reunioes, tarefas, documentos):
//    GET  /api/:recurso   -> lista (eventos/membros são públicos; resto exige login)
//    PUT  /api/:recurso   -> substitui a coleção (sempre exige login)
//
//  Autenticação do painel (e-mail autorizado + senha):
//    GET  /api/auth/status?email=
//    POST /api/auth/register   { email, password }
//    POST /api/auth/login      { email, password }
//
//  Também serve as páginas do painel (home.html, membros.html, ...) e os
//  assets (css/js/assets), para o painel rodar como um serviço único.
// ============================================================

'use strict';

const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const { pool } = require('./db');
const { RESOURCES } = require('./resources');
const auth = require('./auth');

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const ROOT = path.join(__dirname, '..'); // raiz do projeto (páginas do painel)

// GET público (sem login): só o que o site institucional precisa exibir.
const PUBLIC_GET = new Set(['eventos', 'membros', 'noticias']);
// Campos de membro liberados ao público (sem e-mail, telefone, período...).
const PUBLIC_MEMBRO_FIELDS = new Set(['id', 'nome', 'cargo', 'ativo', 'observacao', 'foto']);

app.use(cors());
app.use(express.json({ limit: '25mb' }));

// Garante o schema antes de qualquer rota (uma vez por instância — funciona em serverless)
let _schemaReady = false;
let _schemaPromise = null;
app.use((req, res, next) => {
  if (_schemaReady) return next();
  if (!_schemaPromise) _schemaPromise = ensureSchema().then(() => { _schemaReady = true; });
  _schemaPromise.then(next).catch((err) => {
    console.error('[CA ERP API] falha ao preparar o schema:', err);
    res.status(503).json({ error: 'banco indisponível na inicialização' });
  });
});

// ---------- Helpers de conversão ----------
function selectList(columns) {
  return columns
    .map(([jsonKey, dbCol, type]) => {
      if (type === 'date') return `to_char("${dbCol}", 'YYYY-MM-DD') AS "${jsonKey}"`;
      if (type === 'time') return `to_char("${dbCol}", 'HH24:MI') AS "${jsonKey}"`;
      if (type === 'ts')
        return `to_char("${dbCol}" AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS "${jsonKey}"`;
      return `"${dbCol}" AS "${jsonKey}"`;
    })
    .join(', ');
}

function coerceWrite(type, value) {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if ((type === 'date' || type === 'time' || type === 'ts' || type === 'num') && value === '') {
    return null;
  }
  if (type === 'bool') return Boolean(value);
  return value;
}

// ---------- Autenticação ----------
function isAuthed(req) {
  return !!auth.verifyToken(auth.getTokenFromReq(req));
}
function requireAuth(req, res, next) {
  if (!isAuthed(req)) return res.status(401).json({ ok: false, error: 'não autenticado' });
  next();
}

async function getUser(email) {
  const { rows } = await pool.query('SELECT email, salt, hash FROM app_users WHERE email = $1', [email]);
  return rows[0] || null;
}

app.get('/api/auth/status', async (req, res) => {
  const email = auth.normEmail(req.query.email);
  if (!auth.isAllowedEmail(email)) return res.json({ ok: true, allowed: false, registered: false });
  const u = await getUser(email);
  res.json({ ok: true, allowed: true, registered: !!u });
});

app.post('/api/auth/register', async (req, res) => {
  const email = auth.normEmail(req.body && req.body.email);
  const password = String((req.body && req.body.password) || '');
  if (!auth.isAllowedEmail(email)) return res.status(403).json({ ok: false, error: 'e-mail não autorizado' });
  if (password.length < 8) return res.status(400).json({ ok: false, error: 'senha muito curta (mínimo 8 caracteres)' });
  if (await getUser(email)) return res.status(409).json({ ok: false, error: 'este e-mail já tem senha — faça login' });
  const { salt, hash } = auth.hashPassword(password);
  await pool.query('INSERT INTO app_users (email, salt, hash) VALUES ($1, $2, $3)', [email, salt, hash]);
  res.json({ ok: true, token: auth.makeToken(email), email });
});

app.post('/api/auth/login', async (req, res) => {
  const email = auth.normEmail(req.body && req.body.email);
  const password = String((req.body && req.body.password) || '');
  if (!auth.isAllowedEmail(email)) return res.status(403).json({ ok: false, error: 'e-mail não autorizado' });
  const u = await getUser(email);
  if (!u) return res.status(404).json({ ok: false, error: 'e-mail sem senha cadastrada' });
  if (!auth.verifyPassword(password, u.salt, u.hash)) {
    return res.status(401).json({ ok: false, error: 'senha incorreta' });
  }
  res.json({ ok: true, token: auth.makeToken(email), email });
});

// ---------- Saúde ----------
app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true });
  } catch {
    res.status(503).json({ ok: false, error: 'banco indisponível' });
  }
});

// ---------- Recursos ----------
function resolveResource(req, res, next) {
  const resource = RESOURCES[req.params.resource];
  if (!resource) return res.status(404).json({ error: `recurso desconhecido: ${req.params.resource}` });
  req.resource = resource;
  next();
}

// Listar — eventos/membros públicos (membros com campos reduzidos); resto exige login.
app.get('/api/:resource', resolveResource, async (req, res) => {
  const name = req.params.resource;
  const authed = isAuthed(req);
  if (!PUBLIC_GET.has(name) && !authed) {
    return res.status(401).json({ ok: false, error: 'não autenticado' });
  }
  let columns = req.resource.columns;
  if (name === 'membros' && !authed) {
    columns = columns.filter(([jsonKey]) => PUBLIC_MEMBRO_FIELDS.has(jsonKey));
  }
  try {
    const { rows } = await pool.query(
      `SELECT ${selectList(columns)} FROM ${req.resource.table} ORDER BY ${req.resource.order}`,
    );
    res.json(rows);
  } catch (err) {
    console.error(`[GET ${req.resource.table}]`, err);
    res.status(500).json({ error: 'falha ao listar registros' });
  }
});

// Substituir a coleção inteira — SEMPRE exige login.
app.put('/api/:resource', requireAuth, resolveResource, async (req, res) => {
  const r = req.resource;
  const items = Array.isArray(req.body) ? req.body : null;
  if (!items) return res.status(400).json({ error: 'o corpo deve ser um array de registros' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(`DELETE FROM ${r.table}`);
    for (const item of items) {
      const cols = [];
      const placeholders = [];
      const values = [];
      let i = 1;
      for (const [jsonKey, dbCol, type] of r.columns) {
        const v = coerceWrite(type, item[jsonKey]);
        if (v === undefined) continue;
        cols.push(`"${dbCol}"`);
        placeholders.push(`$${i++}`);
        values.push(v);
      }
      if (!cols.length) continue;
      await client.query(
        `INSERT INTO ${r.table} (${cols.join(', ')}) VALUES (${placeholders.join(', ')})`,
        values,
      );
    }
    await client.query('COMMIT');
    const { rows } = await client.query(
      `SELECT ${selectList(r.columns)} FROM ${r.table} ORDER BY ${r.order}`,
    );
    res.json(rows);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(`[PUT ${r.table}]`, err);
    res.status(500).json({ error: 'falha ao salvar registros' });
  } finally {
    client.release();
  }
});

// ---------- Páginas do painel + assets (sem expor .env/server/db) ----------
const PAGES = ['home', 'membros', 'financeiro', 'eventos', 'reunioes', 'tarefas', 'documentos', 'noticias', 'login'];
app.use('/css', express.static(path.join(ROOT, 'css')));
app.use('/js', express.static(path.join(ROOT, 'js')));
app.use('/assets', express.static(path.join(ROOT, 'assets')));

// Site institucional público (estático) servido no MESMO deploy do painel.
// Fica em /site/ e lê a diretoria da própria API (erp-sync.js -> /api/membros).
// O 1º middleware garante a barra final (/site -> /site/) para os caminhos
// relativos do site (config.js, erp-sync.js, style.css...) resolverem certo.
app.use(
  '/site',
  (req, res, next) => {
    if (req.originalUrl.split('?')[0] === '/site') return res.redirect(301, '/site/');
    next();
  },
  express.static(path.join(ROOT, 'site-publico')),
);

app.get('/', (_req, res) => res.sendFile(path.join(ROOT, 'home.html')));
PAGES.forEach((p) => app.get('/' + p + '.html', (_req, res) => res.sendFile(path.join(ROOT, p + '.html'))));

// ---------- Boot ----------
async function ensureSchema() {
  const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  await pool.query(sql);
}

module.exports = app;

if (require.main === module) {
  ensureSchema()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`[CA ERP API] ouvindo em http://localhost:${PORT}`);
        console.log(`  painel: /  ·  login: /login.html  ·  autorizados: ${auth.ALLOWED_EMAILS.join(', ')}`);
      });
    })
    .catch((err) => {
      console.error('[CA ERP API] falha ao preparar o schema:', err);
      process.exit(1);
    });
}
