const STATUS_CONF = {
  planejado: { label: 'Planejado',    badge: 'badge-blue'   },
  andamento: { label: 'Em andamento', badge: 'badge-yellow' },
  concluido: { label: 'Concluído',    badge: 'badge-green'  },
  cancelado: { label: 'Cancelado',    badge: 'badge-red'    }
};

function renderStats() {
  const ev = storage.get('eventos');
  const stats = [
    { label: 'Total',        value: ev.length,                                         icon: 'events',   color: 'icon-blue'   },
    { label: 'Planejados',   value: ev.filter(e => e.status === 'planejado').length,   icon: 'clock',    color: 'icon-purple' },
    { label: 'Em andamento', value: ev.filter(e => e.status === 'andamento').length,   icon: 'activity', color: 'icon-yellow' },
    { label: 'Concluídos',   value: ev.filter(e => e.status === 'concluido').length,   icon: 'check',    color: 'icon-green'  }
  ];
  document.getElementById('event-stats').innerHTML = stats.map(s =>
    '<div class="stat-card"><div class="stat-card-top"><div class="stat-card-icon ' + s.color + '">' + svgIcon(s.icon, 19) + '</div></div>' +
    '<div class="stat-card-value">' + s.value + '</div><div class="stat-card-label">' + s.label + '</div></div>'
  ).join('');
}

function renderEventos() {
  const search = document.getElementById('search-ev').value.toLowerCase();
  const statusFilter = document.getElementById('filter-status-ev').value;
  let eventos = storage.get('eventos').sort((a, b) => b.data.localeCompare(a.data));
  if (search) eventos = eventos.filter(e => e.titulo.toLowerCase().includes(search) || (e.local || '').toLowerCase().includes(search));
  if (statusFilter) eventos = eventos.filter(e => e.status === statusFilter);

  const container = document.getElementById('eventos-container');
  if (!eventos.length) {
    container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">' + svgIcon('events', 40) + '</div><h3>Nenhum evento encontrado</h3><p>Adicione eventos para acompanhar a agenda do CA.</p><button type="button" class="btn btn-primary" onclick="abrirModalEvento()">' + svgIcon('plus', 15) + 'Novo Evento</button></div>';
    return;
  }

  let html = '<div class="events-list">';
  eventos.forEach(e => {
    const d = new Date(e.data + 'T12:00:00');
    const status = STATUS_CONF[e.status] || STATUS_CONF.planejado;
    const dia = d.getDate().toString().padStart(2, '0');
    const mes = d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
    let details = '';
    if (e.horaInicio) details += '<span>' + e.horaInicio + (e.horaFim ? ' – ' + e.horaFim : '') + '</span>';
    if (e.local) details += '<span>' + e.local + '</span>';
    if (e.responsavel) details += '<span>' + e.responsavel + '</span>';
    if (e.publico) details += '<span>~' + e.publico + ' participantes</span>';

    html += '<div class="event-card status-' + e.status + '" onclick="verEvento(\'' + e.id + '\')" style="cursor:pointer">';
    html += '<div class="event-date-box"><div class="event-date-day">' + dia + '</div><div class="event-date-month">' + mes + '</div></div>';
    html += '<div class="event-content">';
    html += '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px">';
    html += '<div class="event-title">' + e.titulo + '</div>';
    html += '<span class="badge ' + status.badge + '">' + status.label + '</span></div>';
    html += '<div class="event-details">' + details + '</div>';
    if (e.descricao) html += '<div style="font-size:13px;color:var(--text-3);line-height:1.5;margin-top:2px">' + (e.descricao.length > 120 ? e.descricao.slice(0, 120) + '…' : e.descricao) + '</div>';
    html += '</div>';
    html += '<div style="display:flex;flex-direction:column;gap:6px;flex-shrink:0">';
    html += '<button type="button" class="btn btn-outline btn-sm btn-icon" title="Editar" onclick="event.stopPropagation();abrirModalEvento(\'' + e.id + '\')">' + svgIcon('edit', 15) + '</button>';
    html += '<button type="button" class="btn btn-danger btn-sm btn-icon" title="Excluir" onclick="event.stopPropagation();excluirEvento(\'' + e.id + '\')">' + svgIcon('trash', 15) + '</button>';
    html += '</div></div>';
  });
  html += '</div>';
  container.innerHTML = html;
}

function abrirModalEvento(id) {
  const e = id ? storage.get('eventos').find(ev => ev.id === id) : null;
  document.getElementById('modal-ev-title').textContent = e ? 'Editar Evento' : 'Novo Evento';
  document.getElementById('edit-ev-id').value = e ? e.id : '';
  document.getElementById('ev-titulo').value = e ? e.titulo : '';
  document.getElementById('ev-data').value = e ? e.data : todayISO();
  document.getElementById('ev-hora-inicio').value = e ? (e.horaInicio || '') : '';
  document.getElementById('ev-hora-fim').value = e ? (e.horaFim || '') : '';
  document.getElementById('ev-local').value = e ? (e.local || '') : '';
  document.getElementById('ev-responsavel').value = e ? (e.responsavel || '') : '';
  document.getElementById('ev-status').value = e ? (e.status || 'planejado') : 'planejado';
  document.getElementById('ev-publico').value = e ? (e.publico || '') : '';
  document.getElementById('ev-descricao').value = e ? (e.descricao || '') : '';
  document.getElementById('ev-obs').value = e ? (e.observacao || '') : '';
  openModal('modal-evento');
}

function salvarEvento() {
  const titulo = document.getElementById('ev-titulo').value.trim();
  const data = document.getElementById('ev-data').value;
  if (!titulo) { showToast('Informe o título do evento.', 'error'); return; }
  if (!data) { showToast('Informe a data do evento.', 'error'); return; }

  const editId = document.getElementById('edit-ev-id').value;
  let eventos = storage.get('eventos');
  const criadoEm = editId ? ((eventos.find(e => e.id === editId) || {}).criadoEm || new Date().toISOString()) : new Date().toISOString();

  const obj = {
    id: editId || generateId(), titulo, data,
    horaInicio: document.getElementById('ev-hora-inicio').value,
    horaFim: document.getElementById('ev-hora-fim').value,
    local: document.getElementById('ev-local').value.trim(),
    responsavel: document.getElementById('ev-responsavel').value.trim(),
    status: document.getElementById('ev-status').value,
    publico: document.getElementById('ev-publico').value,
    descricao: document.getElementById('ev-descricao').value.trim(),
    observacao: document.getElementById('ev-obs').value.trim(),
    criadoEm
  };
  if (editId) eventos = eventos.map(e => e.id === editId ? obj : e);
  else eventos.unshift(obj);
  storage.set('eventos', eventos);
  showToast(editId ? 'Evento atualizado!' : 'Evento criado!');
  closeModal('modal-evento');
  renderStats();
  renderEventos();
}

function verEvento(id) {
  const e = storage.get('eventos').find(ev => ev.id === id);
  if (!e) return;
  const status = STATUS_CONF[e.status] || STATUS_CONF.planejado;
  const d = new Date(e.data + 'T12:00:00');
  const dataFmt = d.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  document.getElementById('ev-detalhe-title').textContent = e.titulo;
  let body = '<div style="display:flex;gap:12px;align-items:center;margin-bottom:16px;flex-wrap:wrap">';
  body += '<span class="badge ' + status.badge + '">' + status.label + '</span>';
  body += '<span style="font-family:var(--font-mono);font-size:12px;color:var(--text-2);text-transform:capitalize">' + dataFmt + '</span></div>';
  body += '<hr class="divider">';
  if (e.horaInicio) body += '<div class="detail-row"><span class="detail-label">Horário</span><span class="detail-value">' + e.horaInicio + (e.horaFim ? ' até ' + e.horaFim : '') + '</span></div>';
  if (e.local) body += '<div class="detail-row"><span class="detail-label">Local</span><span class="detail-value">' + e.local + '</span></div>';
  if (e.responsavel) body += '<div class="detail-row"><span class="detail-label">Responsável</span><span class="detail-value">' + e.responsavel + '</span></div>';
  if (e.publico) body += '<div class="detail-row"><span class="detail-label">Público esperado</span><span class="detail-value">' + e.publico + ' pessoas</span></div>';
  if (e.descricao) body += '<hr class="divider"><div style="font-size:13.5px;color:var(--text-2);line-height:1.7;white-space:pre-wrap">' + e.descricao + '</div>';
  if (e.observacao) body += '<hr class="divider"><div style="font-size:12.5px;color:var(--text-3);background:var(--panel-2);border:1px solid var(--hair);border-left:2px solid var(--gold);border-radius:var(--r-sm);padding:12px;font-style:italic">' + e.observacao + '</div>';

  document.getElementById('ev-detalhe-body').innerHTML = body;
  document.getElementById('btn-del-ev').onclick = () => { excluirEvento(id); closeModal('modal-ev-detalhe'); };
  document.getElementById('btn-edit-ev').onclick = () => { closeModal('modal-ev-detalhe'); abrirModalEvento(id); };
  openModal('modal-ev-detalhe');
}

function excluirEvento(id) {
  if (!confirm('Excluir este evento?')) return;
  storage.set('eventos', storage.get('eventos').filter(e => e.id !== id));
  showToast('Evento excluído.');
  renderStats();
  renderEventos();
}

// ===== INIT =====
initSidebar('eventos');
document.getElementById('ev-data').value = todayISO();
renderStats();
renderEventos();
