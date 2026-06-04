/**
 * ============================================================================
 *  Extrai DIRETORIA, EVENTOS e NOTÍCIAS do site público
 *  (site-publico/index.html) e gera os "seeds" que o painel importa com 1
 *  clique (botão "Importar do site"):
 *
 *      assets/diretoria-seed.json
 *      assets/eventos-seed.json
 *      assets/noticias-seed.json
 *
 *  Uso: node server/scripts/build-seeds.js [html] [pasta-de-saida]
 *  Padrões: html = site-publico/index.html   saida = assets/
 * ============================================================================
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const HTML_PATH = process.argv[2] || path.join(ROOT, 'site-publico', 'index.html');
const OUT_DIR = process.argv[3] || path.join(ROOT, 'assets');

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
  const blocks = section(html, 'diretoria').split('<div class="dir-card').slice(1);
  return blocks.map((b) => {
    const foto = pick(/<img src="(data:image\/[^"]+)"/, b);
    const cargo = pick(/<div class="(?:pres-badge|dir-role-badge[^"]*|dir-role[^"]*)">\s*([^<]+?)\s*<\/div>/, b);
    const nome = pick(/<div class="dir-name">\s*([^<]+?)\s*<\/div>/, b);
    const desc = pick(/<div class="dir-desc">\s*([^<]+?)\s*<\/div>/, b);
    if (!nome) return null;
    return { id: genId(), nome, cargo, email: '', periodo: '', telefone: '',
      ativo: true, dataEntrada: null, observacao: desc, foto: foto || null };
  }).filter(Boolean);
}

function parseEventos(html) {
  const blocks = section(html, 'eventos').split('<div class="ev-card').slice(1);
  return blocks.map((b) => {
    const titulo = pick(/<div class="ev-title">\s*([^<]+?)\s*<\/div>/, b);
    const dia = pick(/<div class="ev-day">\s*([^<]+?)\s*<\/div>/, b);
    const mon = pick(/<div class="ev-mon">\s*([^<]+?)\s*<\/div>/, b).toLowerCase().slice(0, 3);
    const desc = pick(/<div class="ev-desc">\s*([^<]+?)\s*<\/div>/, b);
    const metas = [...b.matchAll(/<div class="ev-meta">[\s\S]*?<\/svg>\s*([^<]+?)\s*<\/div>/g)].map((m) => m[1].trim());
    if (!titulo) return null;
    const dd = String(dia || '01').padStart(2, '0');
    return {
      id: genId(), titulo, data: `2026-${MESES[mon] || '01'}-${dd}`,
      horaInicio: '', horaFim: '',
      local: metas[0] || '',
      descricao: desc, status: 'planejado', responsavel: '',
      publico: metas.length > 1 ? metas[metas.length - 1] : '',
      observacao: metas.length > 2 ? metas.slice(1, -1).join(' · ') : '',
    };
  }).filter(Boolean);
}

function parseNoticias(html) {
  const blocks = section(html, 'noticias').split('<div class="news-card').slice(1);
  return blocks.map((b) => {
    const titulo = pick(/<div class="ntitle">\s*([^<]+?)\s*<\/div>/, b);
    const categoria = pick(/<span class="ntag[^"]*">\s*([^<]+?)\s*<\/span>/, b);
    const ndate = pick(/<span class="ndate">\s*([^<]+?)\s*<\/span>/, b); // "Jun 2026"
    const desc = pick(/<div class="ndesc">\s*([^<]+?)\s*<\/div>/, b);
    const chamada = pick(/<div class="nfoot">\s*([^<]+?)\s*<span/, b);
    if (!titulo) return null;
    const dm = /([A-Za-zçÇ]{3})[a-zç]*\s+(\d{4})/.exec(ndate || '');
    const data = dm ? `${dm[2]}-${MESES[dm[1].toLowerCase()] || '01'}-01` : null;
    return { id: genId(), titulo, categoria, data, descricao: desc, chamada, link: '' };
  }).filter(Boolean);
}

const html = fs.readFileSync(HTML_PATH, 'utf8');
const seeds = {
  'diretoria-seed.json': parseDiretoria(html),
  'eventos-seed.json': parseEventos(html),
  'noticias-seed.json': parseNoticias(html),
};

fs.mkdirSync(OUT_DIR, { recursive: true });
for (const [file, data] of Object.entries(seeds)) {
  const out = path.join(OUT_DIR, file);
  fs.writeFileSync(out, JSON.stringify(data, null, 0), 'utf8');
  const kb = (fs.statSync(out).size / 1024).toFixed(0);
  console.log(`${file.padEnd(22)} ${String(data.length).padStart(2)} itens  (${kb} KB)`);
}
console.log('OK -> ' + OUT_DIR);
