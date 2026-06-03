/**
 * ============================================================================
 *  Importa a DIRETORIA e os EVENTOS reais do site institucional (landing
 *  ca_esw) para o banco do ERP, via API.
 *
 *  Lê o HTML da landing, extrai os cards da diretoria (nome, cargo, descrição
 *  e foto em base64) e os cards de eventos, e envia para o ERP com:
 *     PUT /api/membros   e   PUT /api/eventos   (substituem a coleção inteira).
 *
 *  Uso:
 *     node server/scripts/import-site-data.js [caminho-do-html] [url-da-api] [token]
 *
 *  Padrões:
 *     html  = C:/MeusProjetos/FRONT-END-CYBER/ca_esw (3).html
 *     api   = http://localhost:3000
 *     token = (vazio no local; em produção a escrita exige login — passe o token
 *             via env TOKEN ou como 3º argumento)
 * ============================================================================
 */
'use strict';

const fs = require('fs');

const HTML_PATH = process.argv[2] || 'C:/MeusProjetos/FRONT-END-CYBER/ca_esw (3).html';
const API = (process.argv[3] || process.env.API_URL || 'http://localhost:3000').replace(/\/$/, '');
const TOKEN = process.env.TOKEN || process.argv[4] || '';

const MESES = { jan: '01', fev: '02', mar: '03', abr: '04', mai: '05', jun: '06',
  jul: '07', ago: '08', set: '09', out: '10', nov: '11', dez: '12' };

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 11);
}

function pick(re, str) {
  const m = re.exec(str);
  return m ? m[1].trim() : '';
}

function section(html, id) {
  const start = html.indexOf(`<section id="${id}"`);
  if (start === -1) return '';
  const end = html.indexOf('</section>', start);
  return html.slice(start, end === -1 ? undefined : end);
}

function parseDiretoria(html) {
  const sec = section(html, 'diretoria');
  const blocks = sec.split('<div class="dir-card').slice(1); // 1º pedaço = cabeçalho
  return blocks.map((b) => {
    const foto = pick(/<img src="(data:image\/[^"]+)"/, b);
    const cargo = pick(/<div class="(?:pres-badge|dir-role-badge[^"]*|dir-role[^"]*)">\s*([^<]+?)\s*<\/div>/, b);
    const nome = pick(/<div class="dir-name">\s*([^<]+?)\s*<\/div>/, b);
    const desc = pick(/<div class="dir-desc">\s*([^<]+?)\s*<\/div>/, b);
    if (!nome) return null;
    return {
      id: genId(),
      nome,
      cargo,
      email: '',
      periodo: '',
      telefone: '',
      ativo: true,
      dataEntrada: null,
      observacao: desc,
      foto: foto || null,
    };
  }).filter(Boolean);
}

function parseEventos(html) {
  const sec = section(html, 'eventos');
  const blocks = sec.split('<div class="ev-card').slice(1);
  return blocks.map((b) => {
    const titulo = pick(/<div class="ev-title">\s*([^<]+?)\s*<\/div>/, b);
    const dia = pick(/<div class="ev-day">\s*([^<]+?)\s*<\/div>/, b);
    const mon = pick(/<div class="ev-mon">\s*([^<]+?)\s*<\/div>/, b).toLowerCase().slice(0, 3);
    const desc = pick(/<div class="ev-desc">\s*([^<]+?)\s*<\/div>/, b);
    // texto de cada ev-meta = o que vem depois do </svg>
    const metas = [...b.matchAll(/<div class="ev-meta">[\s\S]*?<\/svg>\s*([^<]+?)\s*<\/div>/g)].map((m) => m[1].trim());
    if (!titulo) return null;
    const mm = MESES[mon] || '01';
    const dd = String(dia || '01').padStart(2, '0');
    return {
      id: genId(),
      titulo,
      data: `2026-${mm}-${dd}`,
      horaInicio: '',
      horaFim: '',
      local: metas[0] || '',
      descricao: desc,
      status: 'planejado',
      responsavel: '',
      publico: metas.length > 1 ? metas[metas.length - 1] : '',
      observacao: metas.length > 2 ? metas.slice(1, -1).join(' · ') : '',
    };
  }).filter(Boolean);
}

async function put(resource, data) {
  const headers = { 'Content-Type': 'application/json' };
  if (TOKEN) headers['Authorization'] = 'Bearer ' + TOKEN;
  const res = await fetch(`${API}/api/${resource}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`PUT /api/${resource} -> HTTP ${res.status}: ${await res.text()}`);
  return res.json();
}

(async () => {
  console.log(`Lendo HTML: ${HTML_PATH}`);
  const html = fs.readFileSync(HTML_PATH, 'utf8');

  const membros = parseDiretoria(html);
  const eventos = parseEventos(html);

  console.log(`\nDiretoria encontrada (${membros.length}):`);
  membros.forEach((m) => console.log(`  - ${m.cargo.padEnd(22)} ${m.nome}  ${m.foto ? '[foto]' : '[sem foto]'}`));
  console.log(`\nEventos encontrados (${eventos.length}):`);
  eventos.forEach((e) => console.log(`  - ${e.data}  ${e.titulo}`));

  console.log(`\nEnviando para o ERP em ${API} ...`);
  await put('membros', membros);
  await put('eventos', eventos);
  console.log('OK — diretoria e eventos importados para o banco do ERP.');
})().catch((err) => {
  console.error('\nFALHOU:', err.message);
  process.exit(1);
});
