// Categoria -> cor do badge no painel (no site vira a cor da .ntag).
const CAT_CONF = {
  'Evento':        'badge-blue',
  'Oportunidade':  'badge-green',
  'Aviso':         'badge-yellow',
  'Representação': 'badge-purple',
  'Produto':       'badge-teal',
  'Institucional': 'badge-gray',
};

function renderStats() {
  const noticias = storage.get('noticias');
  const cont = (cat) => noticias.filter(n => n.categoria === cat).length;
  const stats = [
    { label: 'Total',          value: noticias.length,        icon: 'news',     color: 'icon-blue'   },
    { label: 'Eventos',        value: cont('Evento'),         icon: 'events',   color: 'icon-purple' },
    { label: 'Avisos',         value: cont('Aviso'),          icon: 'warn',     color: 'icon-yellow' },
    { label: 'Oportunidades',  value: cont('Oportunidade'),   icon: 'check',    color: 'icon-green'  },
  ];
  document.getElementById('news-stats').innerHTML = stats.map(s =>
    '<div class="stat-card"><div class="stat-card-top"><div class="stat-card-icon ' + s.color + '">' + svgIcon(s.icon, 19) + '</div></div>' +
    '<div class="stat-card-value">' + s.value + '</div><div class="stat-card-label">' + s.label + '</div></div>'
  ).join('');
}

function renderNoticias() {
  const search = document.getElementById('search-news').value.toLowerCase();
  const catFilter = document.getElementById('filter-cat-news').value;
  let noticias = storage.get('noticias').slice().sort((a, b) => String(b.data || '').localeCompare(String(a.data || '')));
  if (search) noticias = noticias.filter(n => n.titulo.toLowerCase().includes(search) || (n.descricao || '').toLowerCase().includes(search));
  if (catFilter) noticias = noticias.filter(n => n.categoria === catFilter);

  const container = document.getElementById('noticias-container');
  if (!noticias.length) {
    container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">' + svgIcon('news', 40) + '</div><h3>Nenhuma notícia encontrada</h3><p>Clique em <strong>"Importar do site"</strong> para puxar as notícias do site público, ou em <strong>"Nova Notícia"</strong>.</p></div>';
    return;
  }

  let html = '<div class="events-list">';
  noticias.forEach(n => {
    const badge = CAT_CONF[n.categoria] || 'badge-gray';
    let dia = '—', mes = '';
    if (n.data) {
      const d = new Date(n.data + 'T12:00:00');
      dia = d.getDate().toString().padStart(2, '0');
      mes = d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
    }
    html += '<div class="event-card" onclick="verNoticia(\'' + n.id + '\')" style="cursor:pointer">';
    html += '<div class="event-date-box"><div class="event-date-day">' + dia + '</div><div class="event-date-month">' + mes + '</div></div>';
    html += '<div class="event-content">';
    html += '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px">';
    html += '<div class="event-title">' + n.titulo + '</div>';
    html += '<span class="badge ' + badge + '">' + (n.categoria || '—') + '</span></div>';
    if (n.descricao) html += '<div style="font-size:13px;color:var(--text-3);line-height:1.5;margin-top:2px">' + (n.descricao.length > 130 ? n.descricao.slice(0, 130) + '…' : n.descricao) + '</div>';
    html += '</div>';
    html += '<div style="display:flex;flex-direction:column;gap:6px;flex-shrink:0">';
    html += '<button type="button" class="btn btn-outline btn-sm btn-icon" title="Editar" onclick="event.stopPropagation();abrirModalNoticia(\'' + n.id + '\')">' + svgIcon('edit', 15) + '</button>';
    html += '<button type="button" class="btn btn-danger btn-sm btn-icon" title="Excluir" onclick="event.stopPropagation();excluirNoticia(\'' + n.id + '\')">' + svgIcon('trash', 15) + '</button>';
    html += '</div></div>';
  });
  html += '</div>';
  container.innerHTML = html;
}

function abrirModalNoticia(id) {
  const n = id ? storage.get('noticias').find(x => x.id === id) : null;
  document.getElementById('modal-news-title').textContent = n ? 'Editar Notícia' : 'Nova Notícia';
  document.getElementById('edit-news-id').value = n ? n.id : '';
  document.getElementById('news-titulo').value = n ? n.titulo : '';
  document.getElementById('news-categoria').value = n ? (n.categoria || 'Evento') : 'Evento';
  document.getElementById('news-data').value = n ? (n.data || todayISO()) : todayISO();
  document.getElementById('news-descricao').value = n ? (n.descricao || '') : '';
  document.getElementById('news-chamada').value = n ? (n.chamada || '') : '';
  document.getElementById('news-link').value = n ? (n.link || '') : '';
  openModal('modal-noticia');
}

function salvarNoticia() {
  const titulo = document.getElementById('news-titulo').value.trim();
  const descricao = document.getElementById('news-descricao').value.trim();
  if (!titulo) { showToast('Informe o título da notícia.', 'error'); return; }
  if (!descricao) { showToast('Informe a descrição da notícia.', 'error'); return; }

  const editId = document.getElementById('edit-news-id').value;
  let noticias = storage.get('noticias');
  const criadoEm = editId ? ((noticias.find(n => n.id === editId) || {}).criadoEm || new Date().toISOString()) : new Date().toISOString();

  const obj = {
    id: editId || generateId(),
    titulo,
    categoria: document.getElementById('news-categoria').value,
    data: document.getElementById('news-data').value,
    descricao,
    chamada: document.getElementById('news-chamada').value.trim(),
    link: document.getElementById('news-link').value.trim(),
    criadoEm,
  };
  if (editId) noticias = noticias.map(n => n.id === editId ? obj : n);
  else noticias.unshift(obj);
  storage.set('noticias', noticias);
  showToast(editId ? 'Notícia atualizada!' : 'Notícia criada!');
  closeModal('modal-noticia');
  renderStats();
  renderNoticias();
}

function verNoticia(id) {
  const n = storage.get('noticias').find(x => x.id === id);
  if (!n) return;
  const badge = CAT_CONF[n.categoria] || 'badge-gray';
  const dataFmt = n.data ? new Date(n.data + 'T12:00:00').toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' }) : '—';

  document.getElementById('news-detalhe-title').textContent = n.titulo;
  let body = '<div style="display:flex;gap:12px;align-items:center;margin-bottom:16px;flex-wrap:wrap">';
  body += '<span class="badge ' + badge + '">' + (n.categoria || '—') + '</span>';
  body += '<span style="font-family:var(--font-mono);font-size:12px;color:var(--text-2);text-transform:capitalize">' + dataFmt + '</span></div>';
  body += '<hr class="divider">';
  if (n.descricao) body += '<div style="font-size:13.5px;color:var(--text-2);line-height:1.7;white-space:pre-wrap">' + n.descricao + '</div>';
  if (n.link) body += '<hr class="divider"><div class="detail-row"><span class="detail-label">Link</span><span class="detail-value"><a href="' + n.link + '" target="_blank" rel="noopener" style="color:var(--blue)">' + (n.chamada || 'Abrir') + ' →</a></span></div>';

  document.getElementById('news-detalhe-body').innerHTML = body;
  document.getElementById('btn-del-news').onclick = () => { excluirNoticia(id); closeModal('modal-news-detalhe'); };
  document.getElementById('btn-edit-news').onclick = () => { closeModal('modal-news-detalhe'); abrirModalNoticia(id); };
  openModal('modal-news-detalhe');
}

function excluirNoticia(id) {
  if (!confirm('Excluir esta notícia?')) return;
  storage.set('noticias', storage.get('noticias').filter(n => n.id !== id));
  showToast('Notícia excluída.');
  renderStats();
  renderNoticias();
}

// ===== IMPORTAR NOTÍCIAS DO SITE PÚBLICO =====
async function importarDoSite() {
  const atuais = storage.get('noticias');
  if (atuais.length && !confirm(
    'Isto vai SUBSTITUIR as ' + atuais.length + ' notícia(s) atuais pelas do site público. Continuar?'
  )) return;
  try {
    const res = await fetch('assets/noticias-seed.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const seed = await res.json();
    if (!Array.isArray(seed) || !seed.length) throw new Error('arquivo vazio');
    const noticias = seed.map(n => ({ ...n, id: generateId() }));
    storage.set('noticias', noticias);
    showToast(noticias.length + ' notícia(s) importada(s) do site!');
    renderStats();
    renderNoticias();
  } catch (err) {
    console.error('Falha ao importar notícias do site:', err);
    showToast('Não foi possível importar do site. Tente novamente.', 'error');
  }
}

// ===== INIT =====
initSidebar('noticias');
document.getElementById('news-data').value = todayISO();
bootstrapData(['noticias']).then(() => {
  renderStats();
  renderNoticias();
});
