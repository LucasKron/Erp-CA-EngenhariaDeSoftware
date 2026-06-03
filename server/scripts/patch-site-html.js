/**
 * Aplica no HTML da landing as marcações necessárias para a sincronização
 * com o ERP (idempotente — pode rodar várias vezes sem duplicar):
 *   1. id="ev-grid"  na grade de eventos
 *   2. id="dir-grid" na grade da diretoria
 *   3. <script src="erp-sync.js"></script> antes de </body>
 *
 * Uso: node server/scripts/patch-site-html.js [caminho-do-html]
 */
'use strict';
const fs = require('fs');

const HTML_PATH = process.argv[2] || 'C:/MeusProjetos/FRONT-END-CYBER/ca_esw (3).html';
let html = fs.readFileSync(HTML_PATH, 'utf8');
let changed = 0;

if (html.includes('class="ev-grid"') && !html.includes('id="ev-grid"')) {
  html = html.replace('class="ev-grid"', 'class="ev-grid" id="ev-grid"');
  changed++; console.log('+ id="ev-grid" adicionado');
} else console.log('= ev-grid já marcado (ou ausente)');

if (html.includes('class="dir-grid-members"') && !html.includes('id="dir-grid"')) {
  html = html.replace('class="dir-grid-members"', 'class="dir-grid-members" id="dir-grid"');
  changed++; console.log('+ id="dir-grid" adicionado');
} else console.log('= dir-grid já marcado (ou ausente)');

if (!html.includes('erp-sync.js')) {
  html = html.replace('</body>', '<script src="erp-sync.js"></script>\n</body>');
  changed++; console.log('+ <script src="erp-sync.js"> inserido antes de </body>');
} else console.log('= erp-sync.js já referenciado');

if (changed) {
  fs.writeFileSync(HTML_PATH, html, 'utf8');
  console.log(`\nOK — ${changed} alteração(ões) gravada(s) em ${HTML_PATH}`);
} else {
  console.log('\nNada a fazer (já estava aplicado).');
}
