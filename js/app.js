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

// ===== CAMADA DE DADOS (API REST + cache em memória) =====
// Os dados ficam no PostgreSQL, acessados pela API (pasta server/).
// Base da API:
//   - window.CA_API_BASE definido            -> usa esse host
//   - rodando local (file://, localhost,      -> backend local em :3000
//     127.0.0.1, qualquer porta tipo Live Server)
//   - servido por um domínio real (produção)  -> mesma origem
const _LOCAL_HOSTS = ['localhost', '127.0.0.1', ''];
const API_ORIGIN = (window.CA_API_BASE != null)
  ? window.CA_API_BASE
  : ((location.protocol === 'file:' || _LOCAL_HOSTS.includes(location.hostname))
      ? 'http://localhost:3000'
      : '');
const API_BASE = API_ORIGIN + '/api';

const TOKEN_KEY = 'ca_erp_token';
function authToken() { return localStorage.getItem(TOKEN_KEY) || ''; }
function setToken(t) { localStorage.setItem(TOKEN_KEY, t); }
function clearToken() { localStorage.removeItem(TOKEN_KEY); }

function isLoginPage() { return /(^|\/)login\.html$/.test(location.pathname); }

// Monta os cabeçalhos com o token de sessão (se houver).
function authHeaders(extra) {
  const h = Object.assign({}, extra || {});
  const t = authToken();
  if (t) h['Authorization'] = 'Bearer ' + t;
  return h;
}

// Sessão expirada/ausente: limpa e manda pro login.
function handleUnauthorized() {
  clearToken();
  if (!isLoginPage()) location.href = 'login.html';
}

function logout() {
  clearToken();
  location.href = 'login.html';
}

// Cache em memória, preenchido por bootstrapData() no início de cada página.
// Mantém a interface síncrona que o resto do código já usava (storage.get/set).
const _cache = {};

const storage = {
  // Leitura síncrona do cache (precisa ter rodado bootstrapData antes).
  get(key, defaultValue = []) {
    return key in _cache ? _cache[key] : defaultValue;
  },
  // Atualiza o cache na hora (UI responde rápido) e persiste a coleção
  // inteira na API em segundo plano.
  set(key, value) {
    _cache[key] = value;
    fetch(`${API_BASE}/${key}`, {
      method: 'PUT',
      headers: authHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(value),
    })
      .then((res) => {
        if (res.status === 401) { handleUnauthorized(); throw new Error('sessão expirada'); }
        if (!res.ok) throw new Error('HTTP ' + res.status);
      })
      .catch((err) => {
        console.error('Falha ao salvar no servidor:', err);
        showToast('Erro ao salvar no servidor. Verifique sua conexão/login.', 'error');
      });
  },
  remove(key) {
    delete _cache[key];
  },
};

// Carrega do servidor as coleções necessárias para a página atual.
// Resolve mesmo em caso de erro (a página renderiza vazia com aviso),
// para nunca travar a interface.
async function bootstrapData(keys) {
  try {
    await Promise.all(
      keys.map(async (key) => {
        const res = await fetch(`${API_BASE}/${key}`, { headers: authHeaders() });
        if (res.status === 401) { handleUnauthorized(); throw new Error('sessão expirada'); }
        if (!res.ok) throw new Error('HTTP ' + res.status);
        _cache[key] = await res.json();
      }),
    );
  } catch (err) {
    keys.forEach((k) => { if (!(k in _cache)) _cache[k] = []; });
    console.error('Falha ao carregar dados do servidor:', err);
    if (!/sessão expirada/.test(err.message)) {
      showToast('Não foi possível conectar ao servidor. Verifique se o backend está rodando.', 'error');
    }
  }
}

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
    <div class="sidebar-footer">
      <a href="#" onclick="logout();return false" style="display:inline-flex;align-items:center;gap:6px;color:var(--text-3);text-decoration:none;font-size:12px;margin-bottom:10px">${svgIcon('close', 14)}Sair</a>
      <div>PUC · TOLEDO — ERP v${APP_VERSION}</div>
    </div>
  `;
}

// ===== DADOS-SEMENTE =====
// Os dados iniciais agora vivem no banco (db/init/02_seed.sql), carregados
// automaticamente na primeira criação do PostgreSQL. Não há mais seed no
// front-end.

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

// Gate de autenticação do painel: sem token de sessão, vai para o login
// (exceto na própria página de login). Evita carregar a página sem estar logado.
if (!authToken() && !isLoginPage()) {
  location.href = 'login.html';
}

hydrateIcons(); // injeta SVG nos botões/ícones declarativos do HTML estático
