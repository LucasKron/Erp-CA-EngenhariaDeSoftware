/* ============================================================================
 *  erp-sync.js — deixa as seções "Notícias", "Eventos" e "Diretoria" do site
 *  DINÂMICAS, lendo do painel/ERP. Editou no painel -> recarregou -> aparece.
 *
 *  Cada seção é independente: se o ERP não responder (ou não tiver dados), o
 *  site mantém os cards fixos que já estão no HTML — nunca quebra.
 *
 *  Config: window.APP_CONFIG.ERP_API_URL (config.js). Sem isso, usa o padrão.
 * ========================================================================== */
(function () {
  'use strict';

  var ERP =
    (window.APP_CONFIG && window.APP_CONFIG.ERP_API_URL) ||
    'https://erp-ca-engenharia-de-software.vercel.app';
  ERP = String(ERP).replace(/\/+$/, '');

  var PRES_LOC = 'CA Engenharia de Software · PUC PR Toledo · Gestão 2026';

  // ---- utils ----
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function initials(nome) {
    return String(nome || '').trim().split(/\s+/).slice(0, 2)
      .map(function (n) { return (n[0] || '').toUpperCase(); }).join('');
  }
  function parseDate(s) {
    if (!s) return null;
    var d = new Date(String(s).slice(0, 10) + 'T12:00:00');
    return isNaN(d.getTime()) ? null : d;
  }
  function mesAbrev(d) {
    var m = d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
    return m.charAt(0).toUpperCase() + m.slice(1);
  }
  // Busca um recurso e, se vier lista não-vazia, chama render(lista, grid).
  function sync(recurso, gridId, render) {
    var grid = document.getElementById(gridId);
    if (!grid) return;
    fetch(ERP + '/api/' + recurso, { headers: { Accept: 'application/json' } })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (data) { if (Array.isArray(data) && data.length) render(data, grid); })
      .catch(function (err) {
        console.warn('[erp-sync] mantendo ' + recurso + ' estático:', err && err.message);
      });
  }

  // ===== DIRETORIA =====
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
    return { kind: 'role', cls: 'dr-vp', order: 50 };
  }
  function fotoMarkup(m) {
    if (m.foto) return '<img src="' + esc(m.foto) + '" alt="' + esc(m.nome) + '"/>';
    return '<span style="display:flex;width:100%;height:100%;align-items:center;justify-content:center;' +
      'font-weight:700;font-size:15px;color:rgba(255,255,255,.6)">' + esc(initials(m.nome)) + '</span>';
  }
  function renderDiretoria(membros, grid) {
    var lista = membros
      .filter(function (m) { return m && m.nome && m.ativo !== false; })
      .map(function (m) { return { m: m, meta: cargoMeta(m.cargo) }; })
      .sort(function (a, b) { return a.meta.order - b.meta.order || String(a.m.nome).localeCompare(String(b.m.nome), 'pt-BR'); });
    if (!lista.length) return;
    grid.innerHTML = lista.map(function (x) {
      var m = x.m, meta = x.meta;
      var photo = '<div class="dir-photo">' + fotoMarkup(m) + '</div>';
      var name = '<div class="dir-name">' + esc(m.nome) + '</div>';
      var desc = m.observacao ? '<div class="dir-desc">' + esc(m.observacao) + '</div>' : '';
      if (meta.kind === 'pres') {
        return '<div class="dir-card pres fi vis">' + photo +
          '<div class="pres-badge">' + esc(m.cargo || 'Presidente') + '</div>' + name +
          '<div class="pres-loc">' + esc(PRES_LOC) + '</div>' + desc + '</div>';
      }
      var selo = meta.kind === 'badge'
        ? '<div class="dir-role-badge ' + meta.cls + '">' + esc(m.cargo) + '</div>'
        : '<div class="dir-role ' + meta.cls + '">' + esc(m.cargo || '') + '</div>';
      return '<div class="dir-card fi vis">' + photo + selo + name + desc + '</div>';
    }).join('');
  }

  // ===== EVENTOS =====
  var EVI = {
    local: '<svg class="evi" viewBox="0 0 24 24"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>',
    hora: '<svg class="evi" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    pub: '<svg class="evi" viewBox="0 0 24 24"><path d="M2 9a3 3 0 0 0 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 0 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/></svg>',
  };
  function renderEventos(eventos, grid) {
    var lista = eventos
      .filter(function (e) { return e && e.titulo && e.status !== 'cancelado'; })
      .sort(function (a, b) {
        var da = a.data || '9999', db = b.data || '9999';
        return da.localeCompare(db); // próximos primeiro
      });
    if (!lista.length) return;
    grid.innerHTML = lista.map(function (e) {
      var d = parseDate(e.data);
      var dia = d ? String(d.getDate()).padStart(2, '0') : '—';
      var mon = d ? mesAbrev(d) : '';
      var metas = '';
      if (e.local) metas += '<div class="ev-meta">' + EVI.local + esc(e.local) + '</div>';
      if (e.horaInicio) metas += '<div class="ev-meta">' + EVI.hora + esc(e.horaInicio) + (e.horaFim ? ' – ' + esc(e.horaFim) : '') + '</div>';
      if (e.publico) metas += '<div class="ev-meta">' + EVI.pub + esc(e.publico) + '</div>';
      return '<div class="ev-card fi vis">' +
        '<div class="ev-head">' +
          '<div class="ev-title">' + esc(e.titulo) + '</div>' +
          '<div class="ev-cal"><div class="ev-day">' + dia + '</div><div class="ev-mon">' + mon + '</div></div>' +
        '</div>' +
        '<div class="ev-body">' +
          (e.descricao ? '<div class="ev-desc">' + esc(e.descricao) + '</div>' : '') +
          metas +
        '</div>' +
      '</div>';
    }).join('');
  }

  // ===== NOTÍCIAS =====
  function ntagCls(cat) {
    var c = String(cat || '').toLowerCase();
    if (/oportunidade/.test(c)) return 'nt-op';
    if (/aviso/.test(c)) return 'nt-av';
    if (/represent|institucional/.test(c)) return 'nt-rep';
    return 'nt-ev';
  }
  function renderNoticias(noticias, grid) {
    var lista = noticias
      .filter(function (n) { return n && n.titulo; })
      .sort(function (a, b) { return String(b.data || '').localeCompare(String(a.data || '')); }); // recentes primeiro
    if (!lista.length) return;
    grid.innerHTML = lista.map(function (n) {
      var d = parseDate(n.data);
      var dataTxt = d ? (mesAbrev(d) + ' ' + d.getFullYear()) : '';
      var cta = esc(n.chamada || 'Saiba mais') + ' <span class="narrow">→</span>';
      var foot = n.link
        ? '<a href="' + esc(n.link) + '" target="_blank" rel="noopener" style="color:inherit;text-decoration:none">' + cta + '</a>'
        : cta;
      return '<div class="news-card fi vis">' +
        '<div class="news-top"><span class="ntag ' + ntagCls(n.categoria) + '">' + esc(n.categoria || 'Notícia') + '</span>' +
          '<span class="ndate">' + esc(dataTxt) + '</span></div>' +
        '<div class="ntitle">' + esc(n.titulo) + '</div>' +
        '<div class="ndesc">' + esc(n.descricao || '') + '</div>' +
        '<div class="nfoot">' + foot + '</div>' +
      '</div>';
    }).join('');
  }

  // ===== boot =====
  function run() {
    sync('membros', 'dir-grid', renderDiretoria);
    sync('eventos', 'ev-grid', renderEventos);
    sync('noticias', 'news-grid', renderNoticias);
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();
