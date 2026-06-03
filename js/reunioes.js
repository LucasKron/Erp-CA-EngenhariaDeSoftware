var TIPO_CONF = {
  ordinaria:      { label: 'Ordinária',      badge: 'badge-blue' },
  extraordinaria: { label: 'Extraordinária', badge: 'badge-purple' },
  planejamento:   { label: 'Planejamento',   badge: 'badge-yellow' },
  outros:         { label: 'Outros',         badge: 'badge-gray' }
};

var STATUS_REU = {
  agendada:  { label: 'Agendada',  badge: 'badge-yellow', icon: '[agenda]' },
  realizada: { label: 'Realizada', badge: 'badge-green',  icon: '[ok]' },
  cancelada: { label: 'Cancelada', badge: 'badge-red',    icon: '[x]' }
};

function renderReunioes() {
  var search = document.getElementById('search-reu').value.toLowerCase();
  var tipoFilter = document.getElementById('filter-tipo-reu').value;
  var statusFilter = document.getElementById('filter-status-reu').value;

  var reunioes = storage.get('reunioes').sort(function(a, b) {
    return b.data.localeCompare(a.data);
  });

  if (search) {
    reunioes = reunioes.filter(function(r) {
      return r.titulo.toLowerCase().includes(search) || (r.ata || '').toLowerCase().includes(search);
    });
  }
  if (tipoFilter) reunioes = reunioes.filter(function(r) { return r.tipo === tipoFilter; });
  if (statusFilter) reunioes = reunioes.filter(function(r) { return r.status === statusFilter; });

  var container = document.getElementById('reunioes-container');
  if (!container) return;

  if (!reunioes.length) {
    container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📝</div><h3>Nenhuma reunião encontrada</h3><p>Registre as reuniões do CA para manter o histórico de decisões.</p><button type="button" class="btn btn-primary" onclick="abrirModalReuniao()">+ Nova Reunião</button></div>';
    return;
  }

  var html = '';
  for (var i = 0; i < reunioes.length; i++) {
    var r = reunioes[i];
    var tipo = TIPO_CONF[r.tipo] || TIPO_CONF.outros;
    var status = STATUS_REU[r.status] || STATUS_REU.agendada;
    var d = new Date(r.data + 'T12:00:00');
    var dataFmt = d.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'long', year: 'numeric' });

    var metaHtml = '<span>📅 ' + dataFmt + (r.hora ? ' às ' + r.hora : '') + '</span>';
    if (r.local) metaHtml += ' <span>📍 ' + r.local + '</span>';
    if (r.participantes) metaHtml += ' <span>👥 ' + r.participantes.split(',').length + ' participante(s)</span>';

    var pautaHtml = '';
    if (r.pauta) {
      var pt = r.pauta.length > 200 ? r.pauta.slice(0, 200) + '…' : r.pauta;
      pautaHtml = '<div style="margin-bottom:8px"><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:#A0AEC0;margin-bottom:4px">PAUTA</div><div style="font-size:13px;color:#4A5568;white-space:pre-wrap;line-height:1.5">' + pt + '</div></div>';
    }

    var ataHtml = '';
    if (r.ata) {
      var at = r.ata.length > 300 ? r.ata.slice(0, 300) + '…' : r.ata;
      ataHtml = '<div><div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:#A0AEC0;margin-bottom:4px">ATA</div><div class="meeting-ata">' + at + '</div></div>';
    } else if (r.status === 'realizada') {
      ataHtml = '<div style="font-size:13px;color:#A0AEC0;font-style:italic">Ata não registrada.</div>';
    }

    html += '<div class="meeting-card" onclick="verReuniao(\'' + r.id + '\')" style="cursor:pointer">';
    html += '<div class="meeting-card-header">';
    html += '<div><div class="meeting-title">' + r.titulo + '</div>';
    html += '<div class="meeting-meta" style="margin-top:4px">' + metaHtml + '</div></div>';
    html += '<div style="display:flex;gap:6px;align-items:center;flex-shrink:0">';
    html += '<span class="badge ' + tipo.badge + '">' + tipo.label + '</span>';
    html += '<span class="badge ' + status.badge + '">' + status.label + '</span>';
    html += '<button type="button" class="btn btn-outline btn-sm btn-icon" onclick="event.stopPropagation();abrirModalReuniao(\'' + r.id + '\')">✏</button>';
    html += '<button type="button" class="btn btn-danger btn-sm btn-icon" onclick="event.stopPropagation();excluirReuniao(\'' + r.id + '\')">🗑</button>';
    html += '</div></div>';
    html += pautaHtml + ataHtml;
    html += '</div>';
  }
  container.innerHTML = html;
}

function abrirModalReuniao(id) {
  var r = id ? storage.get('reunioes').find(function(re) { return re.id === id; }) : null;
  document.getElementById('modal-reu-title').textContent = r ? 'Editar Reunião' : 'Nova Reunião';
  document.getElementById('edit-reu-id').value    = r ? r.id : '';
  document.getElementById('reu-titulo').value     = r ? r.titulo : '';
  document.getElementById('reu-data').value       = r ? r.data : todayISO();
  document.getElementById('reu-hora').value       = r ? (r.hora || '') : '';
  document.getElementById('reu-tipo').value       = r ? (r.tipo || 'ordinaria') : 'ordinaria';
  document.getElementById('reu-local').value      = r ? (r.local || '') : '';
  document.getElementById('reu-status').value     = r ? (r.status || 'agendada') : 'agendada';
  document.getElementById('reu-participantes').value = r ? (r.participantes || '') : '';
  document.getElementById('reu-pauta').value      = r ? (r.pauta || '') : '';
  document.getElementById('reu-ata').value        = r ? (r.ata || '') : '';
  openModal('modal-reuniao');
}

function salvarReuniao() {
  var titulo = document.getElementById('reu-titulo').value.trim();
  var data   = document.getElementById('reu-data').value;
  if (!titulo) { showToast('Informe o título da reunião.', 'error'); return; }
  if (!data)   { showToast('Informe a data da reunião.', 'error'); return; }

  var editId  = document.getElementById('edit-reu-id').value;
  var reunioes = storage.get('reunioes');

  var criado = editId
    ? (function(){ var f=reunioes.find(function(r){return r.id===editId;}); return f?f.criadoEm:new Date().toISOString(); })()
    : new Date().toISOString();

  var obj = {
    id:            editId || generateId(),
    titulo:        titulo,
    data:          data,
    hora:          document.getElementById('reu-hora').value,
    tipo:          document.getElementById('reu-tipo').value,
    local:         document.getElementById('reu-local').value.trim(),
    status:        document.getElementById('reu-status').value,
    participantes: document.getElementById('reu-participantes').value.trim(),
    pauta:         document.getElementById('reu-pauta').value.trim(),
    ata:           document.getElementById('reu-ata').value.trim(),
    criadoEm:      criado
  };

  if (editId) {
    reunioes = reunioes.map(function(r) { return r.id === editId ? obj : r; });
  } else {
    reunioes.unshift(obj);
  }

  storage.set('reunioes', reunioes);
  showToast(editId ? 'Reunião atualizada!' : 'Reunião registrada!');
  closeModal('modal-reuniao');
  renderReunioes();
}

function verReuniao(id) {
  var r = storage.get('reunioes').find(function(re) { return re.id === id; });
  if (!r) return;

  var tipo   = TIPO_CONF[r.tipo]   || TIPO_CONF.outros;
  var status = STATUS_REU[r.status] || STATUS_REU.agendada;
  var d      = new Date(r.data + 'T12:00:00');
  var dataFmt = d.toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  document.getElementById('reu-detalhe-title').textContent = r.titulo;

  var body = '<div style="display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap">';
  body += '<span class="badge ' + tipo.badge + '">' + tipo.label + '</span>';
  body += '<span class="badge ' + status.badge + '">' + status.label + '</span></div>';
  body += '<div class="detail-row"><span class="detail-label">Data</span><span class="detail-value">' + dataFmt + (r.hora ? ' às ' + r.hora : '') + '</span></div>';
  if (r.local)         body += '<div class="detail-row"><span class="detail-label">Local</span><span class="detail-value">' + r.local + '</span></div>';
  if (r.participantes) body += '<div class="detail-row"><span class="detail-label">Participantes</span><span class="detail-value">' + r.participantes + '</span></div>';
  if (r.pauta) {
    body += '<hr class="divider"><div style="margin-bottom:4px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:#A0AEC0">PAUTA</div>';
    body += '<div style="font-size:13.5px;color:#4A5568;white-space:pre-wrap;line-height:1.7;background:#F7FAFC;border-radius:8px;padding:12px">' + r.pauta + '</div>';
  }
  if (r.ata) {
    body += '<hr class="divider"><div style="margin-bottom:4px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:#A0AEC0">ATA COMPLETA</div>';
    body += '<div style="font-size:13.5px;color:#2D3748;white-space:pre-wrap;line-height:1.8;background:#FAFCFF;border-radius:8px;padding:14px;border:1.5px solid #EDF2F7">' + r.ata + '</div>';
  }

  document.getElementById('reu-detalhe-body').innerHTML = body;
  document.getElementById('btn-del-reu').onclick  = function() { excluirReuniao(id); closeModal('modal-reu-detalhe'); };
  document.getElementById('btn-edit-reu').onclick = function() { closeModal('modal-reu-detalhe'); abrirModalReuniao(id); };
  document.getElementById('btn-print-reu').onclick = function() { imprimirAta(id); };
  openModal('modal-reu-detalhe');
}

function imprimirAta(id) {
  var r = storage.get('reunioes').find(function(re) { return re.id === id; });
  if (!r) return;
  var win = window.open('', '_blank');
  if (!win) { showToast('Permita pop-ups para imprimir a ata.', 'error'); return; }

  var d = new Date(r.data + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  var css = [
    'body{font-family:"Times New Roman",serif;max-width:700px;margin:40px auto;padding:20px;line-height:1.8;color:#111}',
    'h1{font-size:18px;text-align:center;margin-bottom:4px}',
    'h2{font-size:14px;text-align:center;margin-bottom:24px;color:#555}',
    'table{margin-bottom:24px;font-size:13px}td{padding:4px 8px 4px 0}',
    '.st{font-size:13px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;margin-top:20px;margin-bottom:8px}',
    '.ct{font-size:13.5px;white-space:pre-wrap}',
    '.sig{margin-top:60px;display:flex;justify-content:space-around}',
    '.sig div{text-align:center;border-top:1px solid #333;padding-top:8px;min-width:180px;font-size:12px}',
    '@media print{body{margin:20px}}'
  ].join('');

  var rows = '<tr><td><b>Título:</b></td><td>' + r.titulo + '</td></tr>';
  rows += '<tr><td><b>Data:</b></td><td>' + d + (r.hora ? ' às ' + r.hora : '') + '</td></tr>';
  if (r.local)         rows += '<tr><td><b>Local:</b></td><td>' + r.local + '</td></tr>';
  if (r.participantes) rows += '<tr><td><b>Participantes:</b></td><td>' + r.participantes + '</td></tr>';

  var p1 = r.pauta ? '<div class="st">Pauta</div><div class="ct">' + r.pauta + '</div>' : '';
  var p2 = r.ata   ? '<div class="st">Ata</div><div class="ct">'   + r.ata   + '</div>' : '';

  win.document.open();
  win.document.write('<!DOCTYPE html><html lang="pt-BR">');
  win.document.write('<head><meta charset="UTF-8"><title>Ata - ' + r.titulo + '</title>');
  win.document.write('<style>' + css + '</style></head>');
  win.document.write('<body>');
  win.document.write('<h1>Centro Academico de Engenharia de Software</h1>');
  win.document.write('<h2>PUC Toledo - Ata de Reuniao</h2>');
  win.document.write('<table>' + rows + '</table>');
  win.document.write(p1 + p2);
  win.document.write('<div class="sig"><div>Presidente do CA</div><div>Secretario(a)</div></div>');
  win.document.write('</body></html>');
  win.document.close();
  win.print();
}

function excluirReuniao(id) {
  if (!confirm('Excluir esta reunião e sua ata?')) return;
  var lista = storage.get('reunioes').filter(function(r) { return r.id !== id; });
  storage.set('reunioes', lista);
  showToast('Reunião excluída.');
  renderReunioes();
}

// ===== INIT =====
initSidebar('reunioes');
document.getElementById('reu-data').value = todayISO();
renderReunioes();
