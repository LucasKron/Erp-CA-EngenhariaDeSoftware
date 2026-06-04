// ===== CA ERP — Autenticação do painel =====
// Login por e-mail autorizado (allowlist) + senha. Sem dependências extras:
// hash de senha com scrypt e token de sessão stateless assinado com HMAC.

'use strict';

const crypto = require('crypto');

const SCRYPT_KEYLEN = 64;
const TOKEN_TTL_MS = 1000 * 60 * 60 * 12; // 12h

// E-mails autorizados a usar o painel (vêm do .env; padrão = a diretoria atual).
const ALLOWED_EMAILS = String(
  process.env.PANEL_EMAILS || 'lucaskronbauer16@gmail.com,kainanneres262@gmail.com',
)
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

// Segredo para assinar tokens. Em produção, defina AUTH_SECRET no ambiente.
const SECRET = process.env.AUTH_SECRET || 'dev-secret-troque-em-producao';

function normEmail(e) {
  return String(e || '').trim().toLowerCase();
}
function isAllowedEmail(email) {
  return ALLOWED_EMAILS.includes(normEmail(email));
}

// ── Senha (scrypt + salt) ──────────────────────────────────────────────────
function hashPassword(password, salt) {
  const s = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(String(password), s, SCRYPT_KEYLEN).toString('hex');
  return { salt: s, hash };
}
function verifyPassword(password, salt, expectedHash) {
  const a = Buffer.from(hashPassword(password, salt).hash, 'hex');
  const b = Buffer.from(String(expectedHash || ''), 'hex');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

// ── Token: base64url(payload).base64url(hmac) ───────────────────────────────
function b64url(buf) {
  return Buffer.from(buf).toString('base64').replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
}
function unb64url(str) {
  return Buffer.from(String(str).replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
}
function sign(payloadB64) {
  return b64url(crypto.createHmac('sha256', SECRET).update(payloadB64).digest());
}
function makeToken(email) {
  const p = b64url(JSON.stringify({ email: normEmail(email), exp: Date.now() + TOKEN_TTL_MS }));
  return p + '.' + sign(p);
}
function verifyToken(token) {
  if (!token || typeof token !== 'string' || !token.includes('.')) return null;
  const [p, sig] = token.split('.');
  if (!p || !sig) return null;
  const expected = sign(p);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  let payload;
  try { payload = JSON.parse(unb64url(p)); } catch { return null; }
  if (!payload || !payload.exp || Date.now() > payload.exp) return null;
  if (!isAllowedEmail(payload.email)) return null; // saiu da allowlist -> inválido
  return payload;
}

function getTokenFromReq(req) {
  // Apenas o header "Authorization: Bearer <token>". Não aceitamos token via
  // query string nem header x-token, pois vazariam em logs/histórico/Referer.
  const h = req.headers['authorization'] || '';
  if (h.startsWith('Bearer ')) return h.slice(7).trim();
  return '';
}

module.exports = {
  ALLOWED_EMAILS,
  normEmail,
  isAllowedEmail,
  hashPassword,
  verifyPassword,
  makeToken,
  verifyToken,
  getTokenFromReq,
};
