// ===== CA ERP - Shared Utilities =====
// TODO: Replace storage.get/set calls with API fetch calls when connecting to backend

const APP_VERSION = '1.0.0';

// ===== ÍCONES (traço, herdam currentColor — substituem os emojis) =====
const ICONS = {
  dashboard: '<rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>',
  documents: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><path d="M9 13h6M9 17h5"/>',
  file: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/>',
  finance: '<rect x="2.5" y="6" width="19" height="12" rx="2"/><circle cx="12" cy="12" r="2.4"/><path d="M6 12h.01M18 12h.01"/>',
  members: '<path d="M16 19v-1.5a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4V19"/><circle cx="9.5" cy="7.5" r="3.2"/><path d="M21 19v-1.5a4 4 0 0 0-3-3.85"/><path d="M15.5 4.15a4 4 0 0 1 0 7.2"/>',
  events: '<rect x="3" y="4.5" width="18" height="16" rx="2"/><path d="M3 9.5h18M8 2.5v4M16 2.5v4"/>',
  meetings: '<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V3.2a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1V4"/><path d="M9 11h6M9 15h4"/>',
  tasks: '<rect x="3.5" y="3.5" width="17" height="17" rx="2.5"/><path d="M8.5 12l2.5 2.5L16 9"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7"/>',
  upload: '<path d="M12 15V4"/><path d="M7.5 8.5L12 4l4.5 4.5"/><path d="M4 16v2.5A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V16"/>',
  download: '<path d="M12 4v11"/><path d="M7.5 10.5L12 15l4.5-4.5"/><path d="M4 17v1.5A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V17"/>',
  edit: '<path d="M4 20h4L18.5 9.5a2.12 2.12 0 0 0-3-3L5 17z"/><path d="M13.5 6.5l3 3"/>',
  trash: '<path d="M4 7h16"/><path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/><path d="M6.5 7l.8 12a1 1 0 0 0 1 .95h7.4a1 1 0 0 0 1-.95L17.5 7"/><path d="M10 11v6M14 11v6"/>',
  print: '<path d="M6.5 9V4h11v5"/><path d="M6.5 18H5a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-1.5"/><rect x="7" y="14" width="10" height="6" rx="1"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  income: '<path d="M7 17L17 7"/><path d="M9 7h8v8"/>',
  expense: '<path d="M7 7l10 10"/><path d="M17 9v8H9"/>',
  balance: '<path d="M3 21h18"/><path d="M12 3L4 7.5h16z"/><path d="M6 10v8M10 10v8M14 10v8M18 10v8"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  activity: '<path d="M3 12h3.6l2.2 6 3.8-13 2.4 9 1.6-2H21"/>',
  location: '<path d="M12 21s7-5.5 7-11a7 7 0 0 0-14 0c0 5.5 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 7.5h.01"/>',
  pause: '<path d="M9 5v14M15 5v14"/>',
  warn: '<path d="M12 3l9 16H3z"/><path d="M12 10v4M12 17h.01"/>',
  _default: '<circle cx="12" cy="12" r="3"/>'
};

function svgIcon(name, size = 18) {
  const p = ICONS[name] || ICONS._default;
  return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
    'stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" style="display:block;flex-shrink:0">' + p + '</svg>';
}

function logoSVG(size = 44) {
  return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 100 100" role="img" ' +
    'aria-label="CA Engenharia de Software" style="display:block;flex-shrink:0">' +
    '<defs><linearGradient id="caGold" x1="0" y1="0" x2="1" y2="1">' +
    '<stop offset="0" stop-color="#e7cd86"/><stop offset="0.5" stop-color="#c8a24c"/><stop offset="1" stop-color="#8a6a28"/>' +
    '</linearGradient></defs>' +
    '<circle cx="50" cy="50" r="47" fill="#0a0f1e" stroke="url(#caGold)" stroke-width="2.5"/>' +
    '<circle cx="50" cy="50" r="40" fill="none" stroke="#c8a24c" stroke-opacity="0.3" stroke-width="1"/>' +
    '<g fill="#c8a24c"><circle cx="50" cy="7" r="1.5"/><circle cx="93" cy="50" r="1.5"/>' +
    '<circle cx="50" cy="93" r="1.5"/><circle cx="7" cy="50" r="1.5"/></g>' +
    '<text x="50" y="43" text-anchor="middle" font-family="\'IBM Plex Mono\',monospace" font-size="15" font-weight="600" fill="#3b6fe0">&lt;/&gt;</text>' +
    '<text x="50" y="73" text-anchor="middle" font-family="\'Fraunces\',Georgia,serif" font-size="30" font-weight="600" letter-spacing="0.5" fill="url(#caGold)">CA</text>' +
    '</svg>';
}

// Hidrata ícones declarativos: qualquer elemento com [data-icon] recebe o SVG no início
function hydrateIcons(root) {
  (root || document).querySelectorAll('[data-icon]').forEach(el => {
    if (el.dataset.iconDone) return;
    const size = el.getAttribute('data-icon-size') || 15;
    el.insertAdjacentHTML('afterbegin', svgIcon(el.getAttribute('data-icon'), size));
    el.dataset.iconDone = '1';
  });
}

// ===== STORAGE LAYER =====
// All localStorage keys are prefixed with 'ca_erp_'
// When connecting to backend: replace these functions with fetch() calls to your API
const storage = {
  get(key, defaultValue = []) {
    try {
      const val = localStorage.getItem(`ca_erp_${key}`);
      return val ? JSON.parse(val) : defaultValue;
    } catch {
      return defaultValue;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(`ca_erp_${key}`, JSON.stringify(value));
    } catch (e) {
      if (e.name === 'QuotaExceededError') {
        showToast('Armazenamento local cheio. Alguns dados podem não ter sido salvos.', 'error');
      }
    }
  },
  remove(key) {
    localStorage.removeItem(`ca_erp_${key}`);
  }
};

// ===== ID GENERATOR =====
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

// ===== DATE UTILITIES =====
function formatDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr + (dateStr.length === 10 ? 'T12:00:00' : ''));
  return d.toLocaleDateString('pt-BR');
}

function formatDateTime(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('pt-BR') + ' às ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function formatCurrency(value) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value) || 0);
}

function timeAgo(dateStr) {
  const now = new Date();
  const d = new Date(dateStr);
  const diffMs = now - d;
  const diffMin = Math.floor(diffMs / 60000);
  const diffH = Math.floor(diffMs / 3600000);
  const diffD = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'agora mesmo';
  if (diffMin < 60) return `há ${diffMin} min`;
  if (diffH < 24) return `há ${diffH}h`;
  if (diffD < 7) return `há ${diffD} dias`;
  return formatDate(dateStr);
}

function todayISO() {
  return new Date().toISOString().split('T')[0];
}

// ===== TOAST NOTIFICATIONS =====
function showToast(message, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const icons = { success: svgIcon('check', 15), error: svgIcon('close', 15), info: svgIcon('info', 15) };
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span>${icons[type] || svgIcon('info', 15)}</span><span>${message}</span>`;
  container.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add('show'));

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 350);
  }, 3200);
}

// ===== MODAL HELPERS =====
function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('hidden');
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('hidden');
}

// Close modal on backdrop click
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-backdrop')) {
    e.target.classList.add('hidden');
  }
});

// Close modal on Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-backdrop:not(.hidden)').forEach(m => m.classList.add('hidden'));
  }
});

// ===== SIDEBAR =====
function initSidebar(activePage) {
  const el = document.getElementById('sidebar');
  if (!el) return;

  const navItems = [
    { id: 'home', href: 'home.html', icon: 'dashboard', label: 'Painel' },
    { id: 'documentos', href: 'documentos.html', icon: 'documents', label: 'Documentos' },
    { id: 'financeiro', href: 'financeiro.html', icon: 'finance', label: 'Financeiro' },
    { id: 'membros', href: 'membros.html', icon: 'members', label: 'Membros' },
    { id: 'eventos', href: 'eventos.html', icon: 'events', label: 'Eventos' },
    { id: 'reunioes', href: 'reunioes.html', icon: 'meetings', label: 'Reuniões' },
    { id: 'tarefas', href: 'tarefas.html', icon: 'tasks', label: 'Tarefas' },
  ];
  const pad = n => String(n).padStart(2, '0');

  el.innerHTML = `
    <div class="sidebar-logo">
      ${logoSVG(46)}
      <div class="sidebar-logo-text">
        <div class="sidebar-logo-title">Eng. de Software</div>
        <div class="sidebar-logo-sub">Centro Acadêmico</div>
      </div>
    </div>
    <nav class="sidebar-nav">
      <div class="nav-group-title">Navegação</div>
      ${navItems.map((item, i) => `
        <a href="${item.href}" class="nav-item ${activePage === item.id ? 'active' : ''}">
          <span class="nav-index">${pad(i + 1)}</span>
          <span class="nav-icon">${svgIcon(item.icon, 17)}</span>
          <span>${item.label}</span>
        </a>
      `).join('')}
    </nav>
    <div class="sidebar-footer">PUC · TOLEDO — ERP v${APP_VERSION}</div>
  `;
}

// ===== SEED DATA (first run) =====
function seedInitialData() {
  if (storage.get('seeded', false)) return;

  storage.set('membros', [
    { id: generateId(), nome: 'Maria Silva', cargo: 'Presidente', email: 'maria@pucpr.edu.br', periodo: '5° período', telefone: '(45) 99901-0001', ativo: true, dataEntrada: '2024-03-01', observacao: '' },
    { id: generateId(), nome: 'João Santos', cargo: 'Vice-Presidente', email: 'joao@pucpr.edu.br', periodo: '4° período', telefone: '(45) 99901-0002', ativo: true, dataEntrada: '2024-03-01', observacao: '' },
    { id: generateId(), nome: 'Ana Costa', cargo: 'Tesoureira', email: 'ana@pucpr.edu.br', periodo: '5° período', telefone: '(45) 99901-0003', ativo: true, dataEntrada: '2024-03-01', observacao: '' },
    { id: generateId(), nome: 'Lucas Mendes', cargo: 'Secretário', email: 'lucas@pucpr.edu.br', periodo: '3° período', telefone: '(45) 99901-0004', ativo: true, dataEntrada: '2024-03-01', observacao: '' },
    { id: generateId(), nome: 'Beatriz Lima', cargo: 'Diretora de Eventos', email: 'beatriz@pucpr.edu.br', periodo: '4° período', telefone: '(45) 99901-0005', ativo: true, dataEntrada: '2024-03-01', observacao: '' },
  ]);

  storage.set('financeiro', [
    { id: generateId(), tipo: 'receita', descricao: 'Mensalidade membros - Março/2024', valor: 250, categoria: 'Mensalidade', data: '2024-03-05', observacao: '' },
    { id: generateId(), tipo: 'receita', descricao: 'Venda de canecas CA', valor: 180, categoria: 'Venda', data: '2024-03-12', observacao: '18 unidades x R$10' },
    { id: generateId(), tipo: 'despesa', descricao: 'Impressão material para boas-vindas', valor: 94.50, categoria: 'Material', data: '2024-03-10', observacao: 'Gráfica Central' },
    { id: generateId(), tipo: 'despesa', descricao: 'Lanche para reunião geral', valor: 67, categoria: 'Alimentação', data: '2024-03-18', observacao: '' },
    { id: generateId(), tipo: 'receita', descricao: 'Apoio institucional PUC - Semestre 1', valor: 500, categoria: 'Apoio Institucional', data: '2024-03-20', observacao: '' },
  ]);

  storage.set('eventos', [
    { id: generateId(), titulo: 'Semana de Boas-Vindas', data: '2024-03-25', horaInicio: '14:00', local: 'Hall Principal - Bloco A', descricao: 'Recepção aos calouros do curso de Engenharia de Software.', status: 'concluido', responsavel: 'Beatriz Lima', observacao: '' },
    { id: generateId(), titulo: 'Hackathon CA 2024', data: '2024-04-20', horaInicio: '08:00', local: 'Lab de Informática 1 e 2', descricao: '24h de desenvolvimento de projetos sociais com tecnologia.', status: 'planejado', responsavel: 'João Santos', observacao: '' },
    { id: generateId(), titulo: 'Workshop: Git e GitHub para Iniciantes', data: '2024-04-05', horaInicio: '19:00', local: 'Sala 204 - Bloco B', descricao: 'Workshop prático para alunos do 1° e 2° período.', status: 'planejado', responsavel: 'Lucas Mendes', observacao: '' },
  ]);

  storage.set('reunioes', [
    {
      id: generateId(),
      titulo: 'Reunião Ordinária - Março 2024',
      data: '2024-03-18',
      hora: '19:30',
      local: 'Sala do CA',
      tipo: 'ordinaria',
      participantes: 'Maria Silva, João Santos, Ana Costa, Lucas Mendes, Beatriz Lima',
      pauta: '1. Aprovação da ata anterior\n2. Planejamento do Hackathon\n3. Prestação de contas\n4. Assuntos gerais',
      ata: 'Reunião iniciada às 19h35 com quórum de 5 membros.\n\n1. Ata anterior aprovada por unanimidade.\n\n2. Hackathon: definida a data para 20/04. Beatriz ficou responsável pela divulgação.\n\n3. Saldo atual: R$ 768,50. Ana apresentou planilha de gastos.\n\n4. Proposta de criar grupo no WhatsApp para comunicação com alunos aprovada.',
      status: 'realizada'
    },
  ]);

  storage.set('tarefas', [
    { id: generateId(), titulo: 'Divulgar Hackathon nas redes sociais', descricao: '', responsavel: 'Beatriz Lima', prazo: '2024-04-10', prioridade: 'alta', status: 'pendente', criadoEm: new Date().toISOString() },
    { id: generateId(), titulo: 'Confirmar local para o Workshop de Git', descricao: 'Verificar disponibilidade da Sala 204', responsavel: 'Lucas Mendes', prazo: '2024-03-30', prioridade: 'media', status: 'pendente', criadoEm: new Date().toISOString() },
    { id: generateId(), titulo: 'Atualizar lista de membros 2024', descricao: '', responsavel: 'Ana Costa', prazo: '2024-03-28', prioridade: 'baixa', status: 'concluida', criadoEm: new Date().toISOString() },
  ]);

  storage.set('documentos', [
    { id: generateId(), nome: 'Estatuto do CA - 2024.pdf', categoria: 'Regulamento', descricao: 'Estatuto atualizado do Centro Acadêmico', tamanho: '245 KB', tipo: 'pdf', uploadEm: new Date().toISOString(), fileData: null },
    { id: generateId(), nome: 'Ata Reunião Março 2024.docx', categoria: 'Ata', descricao: 'Ata da reunião ordinária de março', tamanho: '38 KB', tipo: 'docx', uploadEm: new Date().toISOString(), fileData: null },
  ]);

  storage.set('seeded', true);
}

// ===== FILE HELPERS =====
function getFileIcon(tipo) {
  return svgIcon('documents', 26);
}

function getFileType(filename) {
  return filename?.split('.').pop()?.toLowerCase() || 'arquivo';
}

function formatFileSize(bytes) {
  if (!bytes || bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

// ===== INIT =====
// Scripts are at the bottom of <body> — DOM is ready, no DOMContentLoaded needed
seedInitialData();
hydrateIcons(); // injeta SVG nos botões/ícones declarativos do HTML estático
