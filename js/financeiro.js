const CATS_RECEITA = ['Mensalidade', 'Venda', 'Apoio Institucional', 'Doação', 'Outros'];
const CATS_DESPESA = ['Material', 'Alimentação', 'Transporte', 'Infraestrutura', 'Divulgação', 'Serviço', 'Outros'];

function renderResumo() {
  const fin = storage.get('financeiro');
  const receitas = fin.filter(f => f.tipo === 'receita').reduce((s, f) => s + Number(f.valor), 0);
  const despesas = fin.filter(f => f.tipo === 'despesa').reduce((s, f) => s + Number(f.valor), 0);
  const saldo = receitas - despesas;
  const cls = saldo >= 0 ? 'value-balance-positive' : 'value-balance-negative';

  document.getElementById('finance-summary').innerHTML =
    '<div class="finance-card"><div class="finance-card-icon">💚</div>' +
    '<div class="finance-card-value value-income">' + formatCurrency(receitas) + '</div>' +
    '<div class="finance-card-label">Total de Receitas</div></div>' +
    '<div class="finance-card"><div class="finance-card-icon">🔴</div>' +
    '<div class="finance-card-value value-expense">' + formatCurrency(despesas) + '</div>' +
    '<div class="finance-card-label">Total de Despesas</div></div>' +
    '<div class="finance-card"><div class="finance-card-icon">🏦</div>' +
    '<div class="finance-card-value ' + cls + '">' + formatCurrency(saldo) + '</div>' +
    '<div class="finance-card-label">Saldo Atual</div></div>';
}

function renderTransacoes() {
  const search = document.getElementById('search-fin').value.toLowerCase();
  const tipoFilter = document.getElementById('filter-tipo').value;
  const catFilter = document.getElementById('filter-cat').value;
  const mesFilter = document.getElementById('filter-mes').value;

  let fin = storage.get('financeiro').sort((a, b) => b.data.localeCompare(a.data));
  if (search) fin = fin.filter(f => f.descricao.toLowerCase().includes(search) || f.categoria.toLowerCase().includes(search));
  if (tipoFilter) fin = fin.filter(f => f.tipo === tipoFilter);
  if (catFilter) fin = fin.filter(f => f.categoria === catFilter);
  if (mesFilter) fin = fin.filter(f => f.data.startsWith(mesFilter));

  document.getElementById('total-registros').textContent = fin.length + ' lançamento(s)';

  const tbody = document.getElementById('tabela-lancamentos');
  const emptyEl = document.getElementById('empty-fin');
  if (!fin.length) { tbody.innerHTML = ''; emptyEl.classList.remove('hidden'); return; }
  emptyEl.classList.add('hidden');

  tbody.innerHTML = fin.map(f => {
    const corVal = f.tipo === 'receita' ? '#38A169' : '#E53E3E';
    const badgeTipo = f.tipo === 'receita' ? 'badge-green' : 'badge-red';
    const labelTipo = f.tipo === 'receita' ? '▲ Receita' : '▼ Despesa';
    const sinal = f.tipo === 'receita' ? '+' : '−';
    return '<tr style="cursor:pointer" onclick="verDetalhe(\'' + f.id + '\')">' +
      '<td style="white-space:nowrap">' + formatDate(f.data) + '</td>' +
      '<td style="max-width:280px"><div style="font-weight:600">' + f.descricao + '</div>' +
      (f.observacao ? '<div style="font-size:12px;color:#A0AEC0">' + f.observacao + '</div>' : '') + '</td>' +
      '<td><span class="badge badge-gray">' + f.categoria + '</span></td>' +
      '<td><span class="badge ' + badgeTipo + '">' + labelTipo + '</span></td>' +
      '<td style="text-align:right;font-weight:700;font-size:14px;white-space:nowrap;color:' + corVal + '">' + sinal + ' ' + formatCurrency(f.valor) + '</td>' +
      '<td style="text-align:center">' +
        '<button type="button" class="btn btn-outline btn-sm btn-icon" onclick="event.stopPropagation();editarLancamento(\'' + f.id + '\')">✏</button>' +
        '<button type="button" class="btn btn-danger btn-sm btn-icon" onclick="event.stopPropagation();excluirLancamento(\'' + f.id + '\')">🗑</button>' +
      '</td></tr>';
  }).join('');
}

function abrirModal(tipo, lancamento) {
  lancamento = lancamento || null;
  const isEdit = !!lancamento;
  document.getElementById('modal-title').textContent = isEdit ? 'Editar Lançamento' : (tipo === 'receita' ? '+ Nova Receita' : '− Nova Despesa');
  document.getElementById('btn-salvar').textContent = isEdit ? 'Salvar Alterações' : 'Salvar';
  document.getElementById('edit-id').value = isEdit ? lancamento.id : '';
  document.getElementById('edit-tipo').value = tipo;

  const cats = tipo === 'receita' ? CATS_RECEITA : CATS_DESPESA;
  document.getElementById('lan-categoria').innerHTML = '<option value="">Selecionar...</option>' +
    cats.map(c => '<option' + (isEdit && lancamento.categoria === c ? ' selected' : '') + '>' + c + '</option>').join('');

  document.getElementById('lan-data').value = (isEdit && lancamento.data) ? lancamento.data : todayISO();
  document.getElementById('lan-valor').value = (isEdit && lancamento.valor) ? lancamento.valor : '';
  document.getElementById('lan-descricao').value = (isEdit && lancamento.descricao) ? lancamento.descricao : '';
  document.getElementById('lan-obs').value = (isEdit && lancamento.observacao) ? lancamento.observacao : '';
  document.getElementById('lan-categoria').value = (isEdit && lancamento.categoria) ? lancamento.categoria : '';
  openModal('modal-lancamento');
}

function editarLancamento(id) {
  const lan = storage.get('financeiro').find(f => f.id === id);
  if (lan) abrirModal(lan.tipo, lan);
}

function salvarLancamento() {
  const data = document.getElementById('lan-data').value;
  const valor = parseFloat(document.getElementById('lan-valor').value);
  const descricao = document.getElementById('lan-descricao').value.trim();
  const categoria = document.getElementById('lan-categoria').value;
  const tipo = document.getElementById('edit-tipo').value;
  const editId = document.getElementById('edit-id').value;

  if (!data) { showToast('Informe a data.', 'error'); return; }
  if (!valor || valor <= 0) { showToast('Informe um valor válido.', 'error'); return; }
  if (!descricao) { showToast('Informe a descrição.', 'error'); return; }
  if (!categoria) { showToast('Selecione uma categoria.', 'error'); return; }

  let fin = storage.get('financeiro');
  const salvar = (comprovante) => {
    const criadoEm = editId ? ((fin.find(f => f.id === editId) || {}).criadoEm || new Date().toISOString()) : new Date().toISOString();
    const obj = { id: editId || generateId(), tipo, descricao, valor, categoria, data,
      observacao: document.getElementById('lan-obs').value.trim(), comprovante: comprovante || null, criadoEm };
    if (editId) fin = fin.map(f => f.id === editId ? obj : f);
    else fin.unshift(obj);
    storage.set('financeiro', fin);
    showToast(editId ? 'Lançamento atualizado!' : 'Lançamento registrado!');
    closeModal('modal-lancamento');
    renderResumo();
    renderTransacoes();
  };

  const compFile = document.getElementById('lan-comprovante').files[0];
  if (compFile) { const r = new FileReader(); r.onload = e => salvar(e.target.result); r.readAsDataURL(compFile); }
  else salvar(null);
}

function verDetalhe(id) {
  const f = storage.get('financeiro').find(l => l.id === id);
  if (!f) return;
  const bg = f.tipo === 'receita' ? '#F0FFF4' : '#FFF5F5';
  const cor = f.tipo === 'receita' ? '#38A169' : '#E53E3E';
  const sinal = f.tipo === 'receita' ? '+' : '−';
  const emoji = f.tipo === 'receita' ? '💚' : '🔴';
  const label = f.tipo === 'receita' ? 'Receita' : 'Despesa';

  let body = '<div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;padding:14px;background:' + bg + ';border-radius:10px">';
  body += '<span style="font-size:28px">' + emoji + '</span>';
  body += '<div><div style="font-size:22px;font-weight:800;color:' + cor + '">' + sinal + ' ' + formatCurrency(f.valor) + '</div>';
  body += '<div style="font-size:12px;color:#718096">' + label + '</div></div></div>';
  body += '<div class="detail-row"><span class="detail-label">Descrição</span><span class="detail-value">' + f.descricao + '</span></div>';
  body += '<div class="detail-row"><span class="detail-label">Categoria</span><span class="detail-value">' + f.categoria + '</span></div>';
  body += '<div class="detail-row"><span class="detail-label">Data</span><span class="detail-value">' + formatDate(f.data) + '</span></div>';
  if (f.observacao) body += '<div class="detail-row"><span class="detail-label">Observação</span><span class="detail-value">' + f.observacao + '</span></div>';
  if (f.comprovante) body += '<hr class="divider"><button type="button" class="btn btn-secondary btn-sm" onclick="downloadComprovante(\'' + id + '\')">⬇ Baixar Comprovante</button>';

  document.getElementById('detalhe-body').innerHTML = body;
  document.getElementById('btn-delete-lan').onclick = () => { excluirLancamento(id); closeModal('modal-detalhe'); };
  document.getElementById('btn-edit-lan').onclick = () => { closeModal('modal-detalhe'); editarLancamento(id); };
  openModal('modal-detalhe');
}

function downloadComprovante(id) {
  // TODO: API_CALL — fetch('/api/financeiro/' + id + '/comprovante')
  const f = storage.get('financeiro').find(l => l.id === id);
  if (!f || !f.comprovante) return;
  const a = document.createElement('a'); a.href = f.comprovante; a.download = 'comprovante_' + id; a.click();
}

function excluirLancamento(id) {
  if (!confirm('Excluir este lançamento?')) return;
  storage.set('financeiro', storage.get('financeiro').filter(f => f.id !== id));
  showToast('Lançamento excluído.');
  renderResumo();
  renderTransacoes();
}

// ===== INIT =====
initSidebar('financeiro');
renderResumo();
renderTransacoes();
