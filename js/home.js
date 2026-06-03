function renderStats() {
  const membros = storage.get('membros').filter(m => m.ativo).length;
  const docs = storage.get('documentos').length;
  const eventos = storage.get('eventos').filter(e => e.status === 'planejado').length;
  const tarefas = storage.get('tarefas').filter(t => t.status === 'pendente').length;
  const financeiro = storage.get('financeiro');
  const receitas = financeiro.filter(f => f.tipo === 'receita').reduce((s, f) => s + Number(f.valor), 0);
  const despesas = financeiro.filter(f => f.tipo === 'despesa').reduce((s, f) => s + Number(f.valor), 0);
  const saldo = receitas - despesas;

  const stats = [
    { label: 'Membros Ativos',    value: membros,               icon: '👥', color: 'icon-blue'   },
    { label: 'Documentos',        value: docs,                  icon: '📁', color: 'icon-purple' },
    { label: 'Eventos Planejados',value: eventos,               icon: '📅', color: 'icon-yellow' },
    { label: 'Tarefas Pendentes', value: tarefas,               icon: '✅', color: 'icon-teal'   },
    { label: 'Saldo Atual',       value: formatCurrency(saldo), icon: '💰', color: saldo >= 0 ? 'icon-green' : 'icon-red' },
  ];

  document.getElementById('stats-grid').innerHTML = stats.map(s =>
    '<div class="stat-card">' +
      '<div class="stat-card-top"><div class="stat-card-icon ' + s.color + '">' + s.icon + '</div></div>' +
      '<div class="stat-card-value">' + s.value + '</div>' +
      '<div class="stat-card-label">' + s.label + '</div>' +
    '</div>'
  ).join('');
}

function renderUpcomingEvents() {
  const eventos = storage.get('eventos')
    .filter(e => e.status === 'planejado')
    .sort((a, b) => a.data.localeCompare(b.data))
    .slice(0, 4);

  const el = document.getElementById('upcoming-events');
  if (!eventos.length) {
    el.innerHTML = '<div class="empty-state" style="padding:32px 20px"><div class="empty-state-icon">📅</div><p>Nenhum evento planejado</p></div>';
    return;
  }
  el.innerHTML = eventos.map(e => {
    const d = new Date(e.data + 'T12:00:00');
    return '<div class="activity-item" style="padding:12px 22px">' +
      '<div style="background:#EEF2FF;border-radius:8px;padding:6px 10px;text-align:center;min-width:44px;flex-shrink:0">' +
        '<div style="font-size:16px;font-weight:800;color:#1A202C;line-height:1">' + d.getDate() + '</div>' +
        '<div style="font-size:10px;font-weight:700;color:#718096;text-transform:uppercase">' + d.toLocaleDateString('pt-BR',{month:'short'}).replace('.','') + '</div>' +
      '</div>' +
      '<div>' +
        '<div style="font-size:13.5px;font-weight:600;color:#1A202C">' + e.titulo + '</div>' +
        '<div style="font-size:12px;color:#A0AEC0;margin-top:2px">📍 ' + (e.local || '—') + ' · ' + (e.horaInicio || '') + '</div>' +
      '</div></div>';
  }).join('');
}

function renderPendingTasks() {
  const tarefas = storage.get('tarefas')
    .filter(t => t.status === 'pendente')
    .sort((a, b) => (a.prazo || '').localeCompare(b.prazo || ''))
    .slice(0, 5);

  const colors = { alta: 'badge-red', media: 'badge-yellow', baixa: 'badge-green' };
  const el = document.getElementById('pending-tasks');
  if (!tarefas.length) {
    el.innerHTML = '<div class="empty-state" style="padding:32px 20px"><div class="empty-state-icon">✅</div><p>Nenhuma tarefa pendente</p></div>';
    return;
  }
  el.innerHTML = tarefas.map(t =>
    '<div class="activity-item" style="padding:10px 22px;gap:10px">' +
      '<div style="flex:1">' +
        '<div style="font-size:13.5px;font-weight:600;color:#1A202C">' + t.titulo + '</div>' +
        '<div style="font-size:12px;color:#A0AEC0;margin-top:2px">' +
          (t.responsavel ? '👤 ' + t.responsavel : '') +
          (t.prazo ? ' · 📅 ' + formatDate(t.prazo) : '') +
        '</div>' +
      '</div>' +
      '<span class="badge ' + (colors[t.prioridade] || 'badge-gray') + '">' + (t.prioridade || '-') + '</span>' +
    '</div>'
  ).join('');
}

function renderFinanceSummary() {
  const financeiro = storage.get('financeiro');
  const receitas = financeiro.filter(f => f.tipo === 'receita').reduce((s, f) => s + Number(f.valor), 0);
  const despesas = financeiro.filter(f => f.tipo === 'despesa').reduce((s, f) => s + Number(f.valor), 0);
  const saldo = receitas - despesas;
  const cor = saldo >= 0 ? '#2C3E7A' : '#E53E3E';
  const bg  = saldo >= 0 ? '#EBF8FF' : '#FFF5F5';
  const bor = saldo >= 0 ? '#BEE3F8' : '#FED7D7';

  document.getElementById('finance-summary').innerHTML =
    '<div style="display:flex;flex-direction:column;gap:14px">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;padding:12px 16px;background:#F0FFF4;border-radius:10px">' +
        '<div style="display:flex;align-items:center;gap:8px"><span>💚</span><span style="font-size:13px;font-weight:600;color:#276749">Total de Receitas</span></div>' +
        '<span style="font-size:16px;font-weight:800;color:#38A169">' + formatCurrency(receitas) + '</span></div>' +
      '<div style="display:flex;justify-content:space-between;align-items:center;padding:12px 16px;background:#FFF5F5;border-radius:10px">' +
        '<div style="display:flex;align-items:center;gap:8px"><span>🔴</span><span style="font-size:13px;font-weight:600;color:#9B2C2C">Total de Despesas</span></div>' +
        '<span style="font-size:16px;font-weight:800;color:#E53E3E">' + formatCurrency(despesas) + '</span></div>' +
      '<div style="display:flex;justify-content:space-between;align-items:center;padding:12px 16px;background:' + bg + ';border-radius:10px;border:1.5px solid ' + bor + '">' +
        '<div style="display:flex;align-items:center;gap:8px"><span>🏦</span><span style="font-size:13px;font-weight:700;color:#2C3E7A">Saldo Atual</span></div>' +
        '<span style="font-size:18px;font-weight:800;color:' + cor + '">' + formatCurrency(saldo) + '</span></div>' +
      '<div style="font-size:12px;color:#A0AEC0;text-align:center">' + financeiro.length + ' lançamento(s) registrado(s)</div>' +
    '</div>';
}

function renderQuickActions() {
  const actions = [
    { label: 'Novo Documento',  icon: '📁', href: 'documentos.html', color: '#EEF2FF', tc: '#2C3E7A' },
    { label: 'Novo Lançamento', icon: '💰', href: 'financeiro.html', color: '#F0FFF4', tc: '#276749' },
    { label: 'Novo Evento',     icon: '📅', href: 'eventos.html',    color: '#FFFBEB', tc: '#92400E' },
    { label: 'Nova Reunião',    icon: '📝', href: 'reunioes.html',   color: '#FAF5FF', tc: '#6B21A8' },
    { label: 'Membros',         icon: '👥', href: 'membros.html',    color: '#EBF8FF', tc: '#2B6CB0' },
    { label: 'Tarefas',         icon: '✅', href: 'tarefas.html',    color: '#E6FFFA', tc: '#234E52' },
  ];
  document.getElementById('quick-actions').innerHTML = actions.map(a =>
    '<a href="' + a.href + '" style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;padding:16px 12px;background:' + a.color + ';border-radius:10px;font-size:12px;font-weight:700;color:' + a.tc + ';text-decoration:none;text-align:center;min-height:70px;transition:opacity .15s" onmouseover="this.style.opacity=\'.8\'" onmouseout="this.style.opacity=\'1\'">' +
      '<span style="font-size:24px">' + a.icon + '</span>' + a.label +
    '</a>'
  ).join('');
}

// ===== INIT =====
initSidebar('home');
var now = new Date();
var h = now.getHours();
var greeting = h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';
document.getElementById('topbar-date').textContent = now.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
document.getElementById('topbar-greeting').textContent = greeting + '! 👋';
renderStats();
renderUpcomingEvents();
renderPendingTasks();
renderFinanceSummary();
renderQuickActions();
