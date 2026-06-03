const PRIO_CONF = {
  alta:  { badge: 'badge-red',    label: 'Alta'  },
  media: { badge: 'badge-yellow', label: 'Média' },
  baixa: { badge: 'badge-green',  label: 'Baixa' }
};
const STATUS_TAR = {
  pendente:  { badge: 'badge-yellow', label: 'Pendente'      },
  andamento: { badge: 'badge-blue',   label: 'Em andamento'  },
  concluida: { badge: 'badge-green',  label: 'Concluída'     },
  cancelada: { badge: 'badge-red',    label: 'Cancelada'     }
};

function renderStats() {
  const tarefas = storage.get('tarefas');
  const stats = [
    { label: 'Total',        value: tarefas.length,                                        icon: 'tasks',    color: 'icon-blue'   },
    { label: 'Pendentes',    value: tarefas.filter(t => t.status === 'pendente').length,   icon: 'clock',    color: 'icon-yellow' },
    { label: 'Em andamento', value: tarefas.filter(t => t.status === 'andamento').length,  icon: 'activity', color: 'icon-purple' },
    { label: 'Concluídas',   value: tarefas.filter(t => t.status === 'concluida').length,  icon: 'check',    color: 'icon-green'  }
  ];
  document.getElementById('task-stats').innerHTML = stats.map(s =>
    '<div class="stat-card"><div class="stat-card-top"><div class="stat-card-icon ' + s.color + '">' + svgIcon(s.icon, 19) + '</div></div>' +
    '<div class="stat-card-value">' + s.value + '</div><div class="stat-card-label">' + s.label + '</div></div>'
  ).join('');
}

function renderTarefas() {
  const search = document.getElementById('search-tar').value.toLowerCase();
  const statusFilter = document.getElementById('filter-status-tar').value;
  const prioFilter = document.getElementById('filter-prio').value;
  const prioOrder = { alta: 0, media: 1, baixa: 2 };

  let tarefas = storage.get('tarefas').sort((a, b) => {
    const pa = prioOrder[a.prioridade] != null ? prioOrder[a.prioridade] : 3;
    const pb = prioOrder[b.prioridade] != null ? prioOrder[b.prioridade] : 3;
    return pa !== pb ? pa - pb : (a.prazo || '').localeCompare(b.prazo || '');
  });
  if (search) tarefas = tarefas.filter(t => t.titulo.toLowerCase().includes(search) || (t.responsavel || '').toLowerCase().includes(search));
  if (statusFilter) tarefas = tarefas.filter(t => t.status === statusFilter);
  if (prioFilter) tarefas = tarefas.filter(t => t.prioridade === prioFilter);

  document.getElementById('total-tarefas').textContent = tarefas.length + ' tarefa(s)';
  const tbody = document.getElementById('tabela-tarefas');
  const emptyEl = document.getElementById('empty-tarefas');
  if (!tarefas.length) { tbody.innerHTML = ''; emptyEl.classList.remove('hidden'); return; }
  emptyEl.classList.add('hidden');

  const hoje = todayISO();
  tbody.innerHTML = tarefas.map(t => {
    const prio = PRIO_CONF[t.prioridade] || PRIO_CONF.baixa;
    const status = STATUS_TAR[t.status] || STATUS_TAR.pendente;
    const atrasada = t.prazo && t.prazo < hoje && t.status === 'pendente';
    const strikeStyle = t.status === 'concluida' ? 'text-decoration:line-through;color:var(--text-3)' : 'color:var(--text)';
    const prazoHtml = t.prazo ? '<span style="display:inline-flex;align-items:center;gap:5px;font-size:13px' + (atrasada ? ';color:var(--red);font-weight:600' : '') + '">' + (atrasada ? svgIcon('warn', 13) : '') + formatDate(t.prazo) + '</span>' : '—';
    return '<tr style="cursor:pointer' + (t.status === 'concluida' ? ';opacity:.6' : '') + '" onclick="abrirModalTarefa(\'' + t.id + '\')">' +
      '<td><input type="checkbox" ' + (t.status === 'concluida' ? 'checked' : '') + ' onclick="event.stopPropagation();toggleConcluida(\'' + t.id + '\',this.checked)" style="width:16px;height:16px;cursor:pointer;accent-color:var(--gold)"></td>' +
      '<td><div style="font-weight:600;' + strikeStyle + '">' + t.titulo + '</div>' + (t.descricao ? '<div style="font-size:12px;color:var(--text-3)">' + (t.descricao.length > 60 ? t.descricao.slice(0,60)+'…' : t.descricao) + '</div>' : '') + '</td>' +
      '<td style="font-size:13px">' + (t.responsavel || '—') + '</td>' +
      '<td style="white-space:nowrap">' + prazoHtml + '</td>' +
      '<td><span class="badge ' + prio.badge + '">' + prio.label + '</span></td>' +
      '<td><span class="badge ' + status.badge + '">' + status.label + '</span></td>' +
      '<td><div style="display:flex;gap:6px;justify-content:center">' +
        '<button type="button" class="btn btn-outline btn-sm btn-icon" title="Editar" onclick="event.stopPropagation();abrirModalTarefa(\'' + t.id + '\')">' + svgIcon('edit', 15) + '</button>' +
        '<button type="button" class="btn btn-danger btn-sm btn-icon" title="Excluir" onclick="event.stopPropagation();excluirTarefa(\'' + t.id + '\')">' + svgIcon('trash', 15) + '</button>' +
      '</div></td></tr>';
  }).join('');
}

function toggleConcluida(id, checked) {
  const tarefas = storage.get('tarefas').map(t => t.id === id ? Object.assign({}, t, { status: checked ? 'concluida' : 'pendente' }) : t);
  storage.set('tarefas', tarefas);
  renderStats();
  renderTarefas();
  showToast(checked ? 'Tarefa concluída!' : 'Tarefa reaberta.');
}

function abrirModalTarefa(id) {
  const t = id ? storage.get('tarefas').find(ta => ta.id === id) : null;
  document.getElementById('modal-tar-title').textContent = t ? 'Editar Tarefa' : 'Nova Tarefa';
  document.getElementById('edit-tar-id').value = t ? t.id : '';
  document.getElementById('tar-titulo').value = t ? t.titulo : '';
  document.getElementById('tar-descricao').value = t ? (t.descricao || '') : '';
  document.getElementById('tar-responsavel').value = t ? (t.responsavel || '') : '';
  document.getElementById('tar-prazo').value = t ? (t.prazo || '') : '';
  document.getElementById('tar-prioridade').value = t ? (t.prioridade || 'media') : 'media';
  document.getElementById('tar-status').value = t ? (t.status || 'pendente') : 'pendente';
  openModal('modal-tarefa');
}

function salvarTarefa() {
  const titulo = document.getElementById('tar-titulo').value.trim();
  if (!titulo) { showToast('Informe o título da tarefa.', 'error'); return; }
  const editId = document.getElementById('edit-tar-id').value;
  let tarefas = storage.get('tarefas');
  const criadoEm = editId ? ((tarefas.find(t => t.id === editId) || {}).criadoEm || new Date().toISOString()) : new Date().toISOString();
  const obj = {
    id: editId || generateId(), titulo,
    descricao: document.getElementById('tar-descricao').value.trim(),
    responsavel: document.getElementById('tar-responsavel').value.trim(),
    prazo: document.getElementById('tar-prazo').value,
    prioridade: document.getElementById('tar-prioridade').value,
    status: document.getElementById('tar-status').value,
    criadoEm
  };
  if (editId) tarefas = tarefas.map(t => t.id === editId ? obj : t);
  else tarefas.unshift(obj);
  storage.set('tarefas', tarefas);
  showToast(editId ? 'Tarefa atualizada!' : 'Tarefa criada!');
  closeModal('modal-tarefa');
  renderStats();
  renderTarefas();
}

function excluirTarefa(id) {
  if (!confirm('Excluir esta tarefa?')) return;
  storage.set('tarefas', storage.get('tarefas').filter(t => t.id !== id));
  showToast('Tarefa excluída.');
  renderStats();
  renderTarefas();
}

// ===== INIT =====
initSidebar('tarefas');
bootstrapData(['tarefas']).then(() => {
  renderStats();
  renderTarefas();
});
