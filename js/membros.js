const CARGO_CORES = {
  'Presidente': 'badge-purple', 'Vice-Presidente': 'badge-blue',
  'Tesoureiro(a)': 'badge-green', 'Secretário(a)': 'badge-teal',
  'Diretor(a) de Eventos': 'badge-yellow', 'Diretor(a) de Comunicação': 'badge-orange',
  'Membro': 'badge-gray'
};

function getInitials(nome) {
  return nome.split(' ').slice(0, 2).map(n => (n[0] || '').toUpperCase()).join('');
}

function renderStats() {
  const membros = storage.get('membros');
  const ativos = membros.filter(m => m.ativo).length;
  const inativos = membros.filter(m => !m.ativo).length;
  document.getElementById('member-stats').innerHTML =
    '<div class="stat-card"><div class="stat-card-top"><div class="stat-card-icon icon-blue">' + svgIcon('members', 19) + '</div></div><div class="stat-card-value">' + membros.length + '</div><div class="stat-card-label">Total de Membros</div></div>' +
    '<div class="stat-card"><div class="stat-card-top"><div class="stat-card-icon icon-green">' + svgIcon('check', 19) + '</div></div><div class="stat-card-value">' + ativos + '</div><div class="stat-card-label">Membros Ativos</div></div>' +
    '<div class="stat-card"><div class="stat-card-top"><div class="stat-card-icon icon-red">' + svgIcon('pause', 19) + '</div></div><div class="stat-card-value">' + inativos + '</div><div class="stat-card-label">Membros Inativos</div></div>';
}

function renderMembros() {
  const search = document.getElementById('search-mem').value.toLowerCase();
  const cargoFilter = document.getElementById('filter-cargo').value;
  const statusFilter = document.getElementById('filter-status').value;

  let membros = storage.get('membros');
  if (search) membros = membros.filter(m => m.nome.toLowerCase().includes(search) || (m.email || '').toLowerCase().includes(search) || (m.cargo || '').toLowerCase().includes(search));
  if (cargoFilter) membros = membros.filter(m => m.cargo === cargoFilter);
  if (statusFilter !== '') membros = membros.filter(m => String(m.ativo ? 1 : 0) === statusFilter);

  document.getElementById('total-membros').textContent = membros.length + ' membro(s)';
  const tbody = document.getElementById('tabela-membros');
  const emptyEl = document.getElementById('empty-membros');
  if (!membros.length) { tbody.innerHTML = ''; emptyEl.classList.remove('hidden'); return; }
  emptyEl.classList.add('hidden');

  tbody.innerHTML = membros.map(m => {
    const badge = CARGO_CORES[m.cargo] || 'badge-gray';
    const statusBadge = m.ativo ? 'badge-green' : 'badge-gray';
    return '<tr style="cursor:pointer" onclick="verMembro(\'' + m.id + '\')">' +
      '<td><div style="display:flex;align-items:center;gap:11px"><div class="member-avatar">' + getInitials(m.nome) + '</div>' +
      '<div><div style="font-weight:600;color:var(--text)">' + m.nome + '</div>' + (m.email ? '<div style="font-size:12px;color:var(--text-3)">' + m.email + '</div>' : '') + '</div></div></td>' +
      '<td><span class="badge ' + badge + '">' + (m.cargo || '—') + '</span></td>' +
      '<td>' + (m.periodo || '—') + '</td>' +
      '<td style="font-size:13px">' + (m.telefone || '—') + '</td>' +
      '<td><span class="badge ' + statusBadge + '">' + (m.ativo ? 'Ativo' : 'Inativo') + '</span></td>' +
      '<td style="white-space:nowrap">' + (m.dataEntrada ? formatDate(m.dataEntrada) : '—') + '</td>' +
      '<td><div style="display:flex;gap:6px;justify-content:center">' +
        '<button type="button" class="btn btn-outline btn-sm btn-icon" title="Editar" onclick="event.stopPropagation();abrirModalMembro(\'' + m.id + '\')">' + svgIcon('edit', 15) + '</button>' +
        '<button type="button" class="btn btn-danger btn-sm btn-icon" title="Excluir" onclick="event.stopPropagation();excluirMembro(\'' + m.id + '\')">' + svgIcon('trash', 15) + '</button>' +
      '</div></td></tr>';
  }).join('');
}

function abrirModalMembro(id) {
  const m = id ? storage.get('membros').find(mb => mb.id === id) : null;
  document.getElementById('modal-mem-title').textContent = m ? 'Editar Membro' : 'Novo Membro';
  document.getElementById('edit-mem-id').value = m ? m.id : '';
  document.getElementById('mem-nome').value = m ? m.nome : '';
  document.getElementById('mem-cargo').value = m ? (m.cargo || '') : '';
  document.getElementById('mem-periodo').value = m ? (m.periodo || '') : '';
  document.getElementById('mem-email').value = m ? (m.email || '') : '';
  document.getElementById('mem-telefone').value = m ? (m.telefone || '') : '';
  document.getElementById('mem-data').value = m ? (m.dataEntrada || todayISO()) : todayISO();
  document.getElementById('mem-ativo').value = m ? (m.ativo ? '1' : '0') : '1';
  document.getElementById('mem-obs').value = m ? (m.observacao || '') : '';
  openModal('modal-membro');
}

function salvarMembro() {
  const nome = document.getElementById('mem-nome').value.trim();
  const cargo = document.getElementById('mem-cargo').value;
  if (!nome) { showToast('Informe o nome do membro.', 'error'); return; }
  if (!cargo) { showToast('Selecione o cargo.', 'error'); return; }

  const editId = document.getElementById('edit-mem-id').value;
  let membros = storage.get('membros');
  const obj = {
    id: editId || generateId(), nome, cargo,
    periodo: document.getElementById('mem-periodo').value,
    email: document.getElementById('mem-email').value.trim(),
    telefone: document.getElementById('mem-telefone').value.trim(),
    dataEntrada: document.getElementById('mem-data').value,
    ativo: document.getElementById('mem-ativo').value === '1',
    observacao: document.getElementById('mem-obs').value.trim()
  };
  if (editId) membros = membros.map(m => m.id === editId ? obj : m);
  else membros.push(obj);
  storage.set('membros', membros);
  showToast(editId ? 'Membro atualizado!' : 'Membro adicionado!');
  closeModal('modal-membro');
  renderStats();
  renderMembros();
}

function verMembro(id) {
  const m = storage.get('membros').find(mb => mb.id === id);
  if (!m) return;
  const badge = CARGO_CORES[m.cargo] || 'badge-gray';
  const statusBadge = m.ativo ? 'badge-green' : 'badge-gray';

  let body = '<div style="display:flex;align-items:center;gap:16px;margin-bottom:20px">';
  body += '<div class="member-avatar" style="width:56px;height:56px;font-size:20px">' + getInitials(m.nome) + '</div>';
  body += '<div><div style="font-family:var(--font-display);font-size:20px;font-weight:600;color:var(--text)">' + m.nome + '</div>';
  body += '<span class="badge ' + badge + '" style="margin-top:4px">' + (m.cargo || 'Sem cargo') + '</span>';
  body += '<span class="badge ' + statusBadge + '" style="margin-left:6px">' + (m.ativo ? 'Ativo' : 'Inativo') + '</span></div></div>';
  body += '<hr class="divider">';
  if (m.periodo)     body += '<div class="detail-row"><span class="detail-label">Período</span><span class="detail-value">' + m.periodo + '</span></div>';
  if (m.email)       body += '<div class="detail-row"><span class="detail-label">E-mail</span><span class="detail-value"><a href="mailto:' + m.email + '" style="color:var(--blue)">' + m.email + '</a></span></div>';
  if (m.telefone)    body += '<div class="detail-row"><span class="detail-label">Telefone</span><span class="detail-value">' + m.telefone + '</span></div>';
  if (m.dataEntrada) body += '<div class="detail-row"><span class="detail-label">Membro desde</span><span class="detail-value">' + formatDate(m.dataEntrada) + '</span></div>';
  if (m.observacao)  body += '<hr class="divider"><div style="font-size:13px;color:var(--text-2);background:var(--panel-2);border:1px solid var(--hair);border-radius:var(--r-sm);padding:12px">' + m.observacao + '</div>';

  document.getElementById('mem-detalhe-body').innerHTML = body;
  document.getElementById('btn-del-mem').onclick = () => { excluirMembro(id); closeModal('modal-mem-detalhe'); };
  document.getElementById('btn-edit-mem').onclick = () => { closeModal('modal-mem-detalhe'); abrirModalMembro(id); };
  openModal('modal-mem-detalhe');
}

function excluirMembro(id) {
  if (!confirm('Excluir este membro?')) return;
  storage.set('membros', storage.get('membros').filter(m => m.id !== id));
  showToast('Membro excluído.');
  renderStats();
  renderMembros();
}

// ===== INIT =====
initSidebar('membros');
document.getElementById('mem-data').value = todayISO();
renderStats();
renderMembros();
