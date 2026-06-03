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
    { label: 'Membros Ativos',     value: membros,               icon: 'members',   color: 'icon-blue'   },
    { label: 'Documentos',         value: docs,                  icon: 'documents', color: 'icon-purple' },
    { label: 'Eventos Planejados', value: eventos,               icon: 'events',    color: 'icon-yellow' },
    { label: 'Tarefas Pendentes',  value: tarefas,               icon: 'tasks',     color: 'icon-teal'   },
    { label: 'Saldo Atual',        value: formatCurrency(saldo), icon: 'finance',   color: saldo >= 0 ? 'icon-green' : 'icon-red' },
  ];

  document.getElementById('stats-grid').innerHTML = stats.map(s =>
    '<div class="stat-card">' +
      '<div class="stat-card-top"><div class="stat-card-icon ' + s.color + '">' + svgIcon(s.icon, 19) + '</div></div>' +
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
    el.innerHTML = '<div class="empty-state" style="padding:36px 20px"><div class="empty-state-icon">' + svgIcon('events', 36) + '</div><p>Nenhum evento planejado</p></div>';
    return;
  }
  el.innerHTML = eventos.map(e => {
    const d = new Date(e.data + 'T12:00:00');
    const mes = d.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
    return '<div class="mini-item">' +
      '<div class="mini-date"><div class="mini-date-day">' + d.getDate() + '</div><div class="mini-date-month">' + mes + '</div></div>' +
      '<div class="mini-main">' +
        '<div class="mini-title">' + e.titulo + '</div>' +
        '<div class="mini-sub">' + (e.local || '—') + (e.horaInicio ? ' · ' + e.horaInicio : '') + '</div>' +
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
    el.innerHTML = '<div class="empty-state" style="padding:36px 20px"><div class="empty-state-icon">' + svgIcon('tasks', 36) + '</div><p>Nenhuma tarefa pendente</p></div>';
    return;
  }
  el.innerHTML = tarefas.map(t =>
    '<div class="mini-item">' +
      '<div class="mini-main">' +
        '<div class="mini-title">' + t.titulo + '</div>' +
        '<div class="mini-sub">' +
          (t.responsavel ? t.responsavel : '') +
          (t.prazo ? (t.responsavel ? ' · ' : '') + formatDate(t.prazo) : '') +
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
  const saldoCls = saldo >= 0 ? 'value-balance-positive' : 'value-balance-negative';

  document.getElementById('finance-summary').innerHTML =
    '<div class="kpi-list">' +
      '<div class="kpi-row"><span class="kpi-label" style="color:var(--green)">' + svgIcon('income', 16) + 'Receitas</span>' +
        '<span class="kpi-value value-income">' + formatCurrency(receitas) + '</span></div>' +
      '<div class="kpi-row"><span class="kpi-label" style="color:var(--red)">' + svgIcon('expense', 16) + 'Despesas</span>' +
        '<span class="kpi-value value-expense">' + formatCurrency(despesas) + '</span></div>' +
      '<div class="kpi-row is-total"><span class="kpi-label" style="color:var(--gold)">' + svgIcon('balance', 16) + 'Saldo Atual</span>' +
        '<span class="kpi-value ' + saldoCls + '">' + formatCurrency(saldo) + '</span></div>' +
    '</div>';
}

function renderQuickActions() {
  const actions = [
    { label: 'Novo Documento',  icon: 'documents', href: 'documentos.html' },
    { label: 'Novo Lançamento', icon: 'finance',   href: 'financeiro.html' },
    { label: 'Novo Evento',     icon: 'events',    href: 'eventos.html'    },
    { label: 'Nova Reunião',    icon: 'meetings',  href: 'reunioes.html'   },
    { label: 'Membros',         icon: 'members',   href: 'membros.html'    },
    { label: 'Tarefas',         icon: 'tasks',     href: 'tarefas.html'    },
  ];
  document.getElementById('quick-actions').innerHTML =
    '<div class="quick-grid">' + actions.map(a =>
      '<a href="' + a.href + '" class="quick-tile">' + svgIcon(a.icon, 17) + '<span>' + a.label + '</span></a>'
    ).join('') + '</div>';
}

// ===== INIT =====
initSidebar('home');
var now = new Date();
var h = now.getHours();
var greeting = h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';
document.getElementById('topbar-date').textContent = now.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
document.getElementById('topbar-greeting').textContent = greeting;
renderQuickActions(); // não depende de dados
bootstrapData(['membros', 'documentos', 'eventos', 'tarefas', 'financeiro']).then(() => {
  renderStats();
  renderUpcomingEvents();
  renderPendingTasks();
  renderFinanceSummary();
});
