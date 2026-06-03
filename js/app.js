// ===== CA ERP - Shared Utilities =====
// TODO: Replace storage.get/set calls with API fetch calls when connecting to backend

const APP_VERSION = '1.0.0';

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

  const icons = { success: '✓', error: '✗', info: 'ℹ' };
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span>${icons[type] || '·'}</span><span>${message}</span>`;
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
    { id: 'home', href: 'home.html', icon: '🏠', label: 'Dashboard' },
    { id: 'documentos', href: 'documentos.html', icon: '📁', label: 'Documentos' },
    { id: 'financeiro', href: 'financeiro.html', icon: '💰', label: 'Financeiro' },
    { id: 'membros', href: 'membros.html', icon: '👥', label: 'Membros' },
    { id: 'eventos', href: 'eventos.html', icon: '📅', label: 'Eventos' },
    { id: 'reunioes', href: 'reunioes.html', icon: '📝', label: 'Reuniões' },
    { id: 'tarefas', href: 'tarefas.html', icon: '✅', label: 'Tarefas' },
  ];

  el.innerHTML = `
    <div class="sidebar-logo">
      <img src="assets/logo.png" alt="Logo CA" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
      <div class="logo-fallback" style="display:none">🎓</div>
      <div class="sidebar-logo-text">
        <div class="sidebar-logo-title">CA EngSoft</div>
        <div class="sidebar-logo-sub">PUC Toledo</div>
      </div>
    </div>
    <nav class="sidebar-nav">
      <div class="nav-group">
        <div class="nav-group-title">Principal</div>
        ${navItems.map(item => `
          <a href="${item.href}" class="nav-item ${activePage === item.id ? 'active' : ''}">
            <span class="nav-icon">${item.icon}</span>
            <span>${item.label}</span>
          </a>
        `).join('')}
      </div>
    </nav>
    <div class="sidebar-footer">ERP do CA · v${APP_VERSION}</div>
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
  const icons = {
    pdf: '📄', docx: '📝', doc: '📝', xlsx: '📊', xls: '📊',
    pptx: '📑', ppt: '📑', png: '🖼️', jpg: '🖼️', jpeg: '🖼️',
    zip: '🗜️', txt: '📃', csv: '📊'
  };
  return icons[tipo?.toLowerCase()] || '📎';
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
