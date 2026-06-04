/* ============================================================================
 *  erp-sync.js — deixa a seção "Nossa Diretoria" do site DINÂMICA.
 *
 *  Busca os membros no painel/ERP (GET {ERP}/api/membros) e remonta os cards
 *  da diretoria com as MESMAS classes/estilos do site. Assim:
 *
 *     editou um membro no painel  ->  recarregou o site  ->  já aparece aqui.
 *
 *  Se o ERP não responder (ou ainda não tiver ninguém cadastrado), o site
 *  mantém os cards fixos que já estão no HTML — nunca quebra.
 *
 *  Configuração: window.APP_CONFIG.ERP_API_URL (em config.js). Sem isso, usa
 *  a URL pública padrão do painel.
 * ========================================================================== */
(function () {
  'use strict';

  var ERP =
    (window.APP_CONFIG && window.APP_CONFIG.ERP_API_URL) ||
    'https://erp-ca-engenharia-de-software.vercel.app';
  ERP = String(ERP).replace(/\/+$/, '');

  // Texto fixo da "localização" no card do presidente (igual ao HTML original).
  var PRES_LOC = 'CA Engenharia de Software · PUC PR Toledo · Gestão 2026';

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function initials(nome) {
    return String(nome || '')
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map(function (n) {
        return (n[0] || '').toUpperCase();
      })
      .join('');
  }

  // Classifica o cargo por palavra-chave (robusto a acentos/variações) e
  // devolve a ordem de exibição + como renderizar o "selo" do cargo.
  function cargoMeta(cargo) {
    var c = String(cargo || '').toLowerCase();
    if (/suplente/.test(c)) {
      var n = (c.match(/(\d+)/) || [])[1];
      return { kind: 'badge', cls: 'dr-sup', order: 70 + (n ? Number(n) : 9) };
    }
    if (/vice/.test(c)) return { kind: 'role', cls: 'dr-vp', order: 1 };
    if (/presidente/.test(c)) return { kind: 'pres', order: 0 };
    if (/tesoureir/.test(c)) return { kind: 'role', cls: 'dr-tess', order: 2 };
    if (/secret/.test(c)) return { kind: 'role', cls: 'dr-sec', order: /adjunt/.test(c) ? 4 : 3 };
    if (/event/.test(c)) return { kind: 'role', cls: 'dr-ev', order: 5 };
    if (/comunica/.test(c)) return { kind: 'role', cls: 'dr-com', order: 6 };
    return { kind: 'role', cls: 'dr-vp', order: 50 }; // genérico (ex.: "Membro")
  }

  function photoMarkup(m) {
    if (m.foto) {
      return '<img src="' + esc(m.foto) + '" alt="' + esc(m.nome) + '"/>';
    }
    // Sem foto: iniciais centralizadas dentro do círculo .dir-photo.
    return (
      '<span style="display:flex;width:100%;height:100%;align-items:center;' +
      'justify-content:center;font-weight:700;font-size:15px;color:rgba(255,255,255,.6)">' +
      esc(initials(m.nome)) +
      '</span>'
    );
  }

  function cardMarkup(m) {
    var meta = cargoMeta(m.cargo);
    var photo = '<div class="dir-photo">' + photoMarkup(m) + '</div>';
    var name = '<div class="dir-name">' + esc(m.nome) + '</div>';
    var desc = m.observacao ? '<div class="dir-desc">' + esc(m.observacao) + '</div>' : '';

    if (meta.kind === 'pres') {
      return (
        '<div class="dir-card pres fi vis">' +
        photo +
        '<div class="pres-badge">' + esc(m.cargo || 'Presidente') + '</div>' +
        name +
        '<div class="pres-loc">' + esc(PRES_LOC) + '</div>' +
        desc +
        '</div>'
      );
    }

    var selo =
      meta.kind === 'badge'
        ? '<div class="dir-role-badge ' + meta.cls + '">' + esc(m.cargo) + '</div>'
        : '<div class="dir-role ' + meta.cls + '">' + esc(m.cargo || '') + '</div>';

    return '<div class="dir-card fi vis">' + photo + selo + name + desc + '</div>';
  }

  function render(membros, grid) {
    var lista = membros
      .filter(function (m) {
        return m && m.nome && m.ativo !== false;
      })
      .map(function (m) {
        return { m: m, ord: cargoMeta(m.cargo).order };
      })
      .sort(function (a, b) {
        return a.ord - b.ord || String(a.m.nome).localeCompare(String(b.m.nome), 'pt-BR');
      });

    if (!lista.length) return; // mantém o fallback estático do HTML
    grid.innerHTML = lista
      .map(function (x) {
        return cardMarkup(x.m);
      })
      .join('');
  }

  function syncDiretoria() {
    var grid = document.getElementById('dir-grid');
    if (!grid) return;
    fetch(ERP + '/api/membros', { headers: { Accept: 'application/json' } })
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function (data) {
        if (Array.isArray(data) && data.length) render(data, grid);
      })
      .catch(function (err) {
        // Sem conexão / sem dados: mantém os cards fixos. Só registra no console.
        console.warn('[erp-sync] mantendo diretoria estática:', err && err.message);
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', syncDiretoria);
  } else {
    syncDiretoria();
  }
})();
