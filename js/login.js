// ===== Login do painel =====
// Usa API_BASE, setToken, showToast, logoSVG (definidos em app.js).

// Já logado? vai direto pro painel.
if (authToken()) location.href = 'home.html';

document.getElementById('login-logo').innerHTML = logoSVG(56);

const emailEl = document.getElementById('login-email');
const passEl = document.getElementById('login-password');
const btn = document.getElementById('login-btn');
const hint = document.getElementById('login-hint');

async function fetchStatus(email) {
  const res = await fetch(`${API_BASE}/auth/status?email=` + encodeURIComponent(email));
  return res.json();
}

// Ao sair do campo de e-mail, dá uma dica (autorizado? primeiro acesso?).
async function checkStatus() {
  const email = emailEl.value.trim().toLowerCase();
  hint.textContent = '';
  if (!email) return;
  try {
    const data = await fetchStatus(email);
    if (!data.allowed) { hint.textContent = 'E-mail não autorizado a acessar o painel.'; btn.textContent = 'Entrar'; }
    else if (data.registered) { hint.textContent = ''; btn.textContent = 'Entrar'; }
    else { hint.textContent = 'Primeiro acesso: a senha digitada será cadastrada para este e-mail.'; btn.textContent = 'Criar senha e entrar'; }
  } catch { /* servidor offline — ignora a dica */ }
}
emailEl.addEventListener('blur', checkStatus);

async function doLogin() {
  const email = emailEl.value.trim().toLowerCase();
  const password = passEl.value;
  if (!email) { showToast('Informe o e-mail.', 'error'); return; }
  if (!password) { showToast('Informe a senha.', 'error'); return; }

  btn.disabled = true;
  try {
    const st = await fetchStatus(email);
    if (!st.allowed) { showToast('E-mail não autorizado a acessar o painel.', 'error'); btn.disabled = false; return; }
    const rota = st.registered ? 'login' : 'register';
    const res = await fetch(`${API_BASE}/auth/` + rota, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok || !data.ok) { showToast(data.error || 'Falha ao entrar.', 'error'); btn.disabled = false; return; }
    setToken(data.token);
    showToast(st.registered ? 'Bem-vindo(a)!' : 'Senha criada! Bem-vindo(a)!');
    setTimeout(() => { location.href = 'home.html'; }, 400);
  } catch (e) {
    console.error(e);
    showToast('Não foi possível conectar ao servidor.', 'error');
    btn.disabled = false;
  }
}

passEl.addEventListener('keydown', (e) => { if (e.key === 'Enter') doLogin(); });
