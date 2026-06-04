/**
 * ============================================================================
 *  Extrai a DIRETORIA do site público (site-publico/index.html) e gera um
 *  arquivo de "semente" que o painel consegue importar com um clique:
 *
 *      assets/diretoria-seed.json
 *
 *  Para cada card da diretoria pega: nome, cargo, descrição (-> observacao)
 *  e a foto (base64). Esse JSON é servido como asset estático e lido pelo
 *  botão "Importar do site" em membros.html.
 *
 *  Uso:
 *      node server/scripts/build-diretoria-seed.js [html] [saida.json]
 *
 *  Padrões:
 *      html   = site-publico/index.html
 *      saida  = assets/diretoria-seed.json
 * ============================================================================
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..', '..');
const HTML_PATH = process.argv[2] || path.join(ROOT, 'site-publico', 'index.html');
const OUT_PATH = process.argv[3] || path.join(ROOT, 'assets', 'diretoria-seed.json');

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
  const blocks = sec.split('<div class="dir-card').slice(1); // 1º pedaço = cabeçalho da seção
  return blocks
    .map((b) => {
      const foto = pick(/<img src="(data:image\/[^"]+)"/, b);
      const cargo = pick(
        /<div class="(?:pres-badge|dir-role-badge[^"]*|dir-role[^"]*)">\s*([^<]+?)\s*<\/div>/,
        b,
      );
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
    })
    .filter(Boolean);
}

const html = fs.readFileSync(HTML_PATH, 'utf8');
const membros = parseDiretoria(html);

if (!membros.length) {
  console.error('Nenhum card de diretoria encontrado em', HTML_PATH);
  process.exit(1);
}

fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
fs.writeFileSync(OUT_PATH, JSON.stringify(membros, null, 0), 'utf8');

console.log(`Diretoria extraída (${membros.length}):`);
membros.forEach((m) =>
  console.log(`  - ${String(m.cargo).padEnd(22)} ${m.nome}  ${m.foto ? '[foto]' : '[sem foto]'}`),
);
const kb = (fs.statSync(OUT_PATH).size / 1024).toFixed(0);
console.log(`\nOK -> ${OUT_PATH}  (${kb} KB)`);
