let selectedFile = null;

function setupDragDrop() {
  const zone = document.getElementById('upload-zone');
  zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('dragover'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('dragover'));
  zone.addEventListener('drop', e => {
    e.preventDefault();
    zone.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  });
}

function onFileSelected(input) {
  if (input.files[0]) processFile(input.files[0]);
}

function processFile(file) {
  if (file.size > 10 * 1024 * 1024) {
    showToast('Arquivo muito grande. Limite: 10 MB.', 'error');
    return;
  }
  selectedFile = file;
  const nameWithoutExt = file.name.replace(/\.[^.]+$/, '');
  document.getElementById('doc-nome').value = nameWithoutExt;
  document.getElementById('file-selected').textContent = '✓ ' + file.name + ' (' + formatFileSize(file.size) + ')';
  document.getElementById('file-selected').style.display = 'block';
}

function salvarDocumento() {
  const nome = document.getElementById('doc-nome').value.trim();
  const categoria = document.getElementById('doc-categoria').value;
  if (!nome) { showToast('Informe o nome do documento.', 'error'); return; }
  if (!categoria) { showToast('Selecione uma categoria.', 'error'); return; }

  const tipo = selectedFile ? getFileType(selectedFile.name) : 'arquivo';
  const tamanho = selectedFile ? formatFileSize(selectedFile.size) : 'desconhecido';

  const salvar = (fileData) => {
    const doc = {
      id: generateId(),
      nome: nome + (selectedFile && !nome.includes('.') ? '.' + tipo : ''),
      categoria,
      descricao: document.getElementById('doc-descricao').value.trim(),
      data: document.getElementById('doc-data').value,
      tipo, tamanho,
      uploadEm: new Date().toISOString(),
      fileData
    };
    const docs = storage.get('documentos');
    docs.unshift(doc);
    storage.set('documentos', docs);
    showToast('Documento salvo com sucesso!');
    closeModal('modal-upload');
    resetUploadForm();
    renderDocs();
  };

  if (selectedFile) {
    // TODO: API_CALL — enviar para /api/documentos
    const reader = new FileReader();
    reader.onload = e => salvar(e.target.result);
    reader.readAsDataURL(selectedFile);
  } else {
    salvar(null);
  }
}

function resetUploadForm() {
  selectedFile = null;
  document.getElementById('file-input').value = '';
  document.getElementById('file-selected').style.display = 'none';
  document.getElementById('doc-nome').value = '';
  document.getElementById('doc-categoria').value = '';
  document.getElementById('doc-descricao').value = '';
  document.getElementById('doc-data').value = todayISO();
}

function renderDocs() {
  const search = document.getElementById('search-docs').value.toLowerCase();
  const catFilter = document.getElementById('filter-categoria').value;
  const tipoFilter = document.getElementById('filter-tipo').value;

  let docs = storage.get('documentos');
  if (search) docs = docs.filter(d => d.nome.toLowerCase().includes(search) || (d.descricao || '').toLowerCase().includes(search));
  if (catFilter) docs = docs.filter(d => d.categoria === catFilter);
  if (tipoFilter) {
    const typeMap = { imagem: ['png', 'jpg', 'jpeg', 'gif', 'webp'] };
    const tipos = typeMap[tipoFilter] || [tipoFilter];
    docs = docs.filter(d => tipos.includes((d.tipo || '').toLowerCase()));
  }

  const container = document.getElementById('docs-container');
  if (!docs.length) {
    container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📁</div><h3>Nenhum documento encontrado</h3><p>Envie o primeiro documento clicando em "Enviar Documento".</p><button type="button" class="btn btn-primary" onclick="openModal(\'modal-upload\')">⬆ Enviar Documento</button></div>';
    return;
  }

  const catColors = { 'Ata':'badge-blue','Regulamento':'badge-purple','Edital':'badge-yellow','Financeiro':'badge-green','Evento':'badge-orange','Outros':'badge-gray' };

  let html = '<div class="docs-grid">';
  docs.forEach(doc => {
    html += '<div class="doc-card" onclick="viewDoc(\'' + doc.id + '\')">';
    html += '<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px">';
    html += '<div class="doc-card-icon">' + getFileIcon(doc.tipo) + '</div>';
    html += '<span class="badge ' + (catColors[doc.categoria] || 'badge-gray') + '">' + (doc.categoria || 'Sem categoria') + '</span>';
    html += '</div>';
    html += '<div class="doc-card-name">' + doc.nome + '</div>';
    if (doc.descricao) html += '<div style="font-size:12px;color:#718096;line-height:1.4">' + doc.descricao + '</div>';
    html += '<div class="doc-card-meta">📅 ' + (doc.data ? formatDate(doc.data) : formatDateTime(doc.uploadEm)) + (doc.tamanho ? ' · ' + doc.tamanho : '') + '</div>';
    html += '</div>';
  });
  html += '</div>';
  container.innerHTML = html;
}

function viewDoc(id) {
  const doc = storage.get('documentos').find(d => d.id === id);
  if (!doc) return;
  document.getElementById('view-title').textContent = doc.nome;

  let body = '<div class="detail-row"><span class="detail-label">Nome</span><span class="detail-value">' + doc.nome + '</span></div>';
  body += '<div class="detail-row"><span class="detail-label">Categoria</span><span class="detail-value"><span class="badge badge-blue">' + (doc.categoria || '—') + '</span></span></div>';
  body += '<div class="detail-row"><span class="detail-label">Tipo</span><span class="detail-value">' + ((doc.tipo || '').toUpperCase() || '—') + '</span></div>';
  body += '<div class="detail-row"><span class="detail-label">Tamanho</span><span class="detail-value">' + (doc.tamanho || '—') + '</span></div>';
  body += '<div class="detail-row"><span class="detail-label">Data</span><span class="detail-value">' + (doc.data ? formatDate(doc.data) : '—') + '</span></div>';
  body += '<div class="detail-row"><span class="detail-label">Enviado em</span><span class="detail-value">' + formatDateTime(doc.uploadEm) + '</span></div>';
  if (doc.descricao) body += '<hr class="divider"><div style="font-size:13.5px;color:#4A5568;line-height:1.6">' + doc.descricao + '</div>';
  body += '<hr class="divider"><div style="font-size:12px;color:#A0AEC0;background:#F7FAFC;border-radius:8px;padding:10px;text-align:center">' + (doc.fileData ? 'Arquivo disponível para download' : 'Arquivo sem dados (adicionado manualmente)') + '</div>';

  document.getElementById('view-body').innerHTML = body;
  document.getElementById('view-delete-btn').onclick = () => deleteDoc(id);
  document.getElementById('view-download-btn').onclick = () => downloadDoc(id);
  document.getElementById('view-download-btn').disabled = !doc.fileData;
  openModal('modal-view');
}

function downloadDoc(id) {
  // TODO: API_CALL — fetch('/api/documentos/' + id + '/download')
  const doc = storage.get('documentos').find(d => d.id === id);
  if (!doc || !doc.fileData) { showToast('Arquivo não disponível para download.', 'error'); return; }
  const a = document.createElement('a');
  a.href = doc.fileData;
  a.download = doc.nome;
  a.click();
}

function deleteDoc(id) {
  if (!confirm('Excluir este documento permanentemente?')) return;
  storage.set('documentos', storage.get('documentos').filter(d => d.id !== id));
  showToast('Documento excluído.');
  closeModal('modal-view');
  renderDocs();
}

// ===== INIT =====
initSidebar('documentos');
document.getElementById('doc-data').value = todayISO();
renderDocs();
setupDragDrop();
