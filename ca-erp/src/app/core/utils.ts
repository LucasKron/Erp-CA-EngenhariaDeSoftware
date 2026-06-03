// ===== CA ERP - Funções utilitárias =====

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 11);
}

export function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '-';
  const d = new Date(dateStr + (dateStr.length === 10 ? 'T12:00:00' : ''));
  return d.toLocaleDateString('pt-BR');
}

export function formatDateTime(dateStr?: string | null): string {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return (
    d.toLocaleDateString('pt-BR') +
    ' às ' +
    d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  );
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
    Number(value) || 0,
  );
}

export function timeAgo(dateStr: string): string {
  const now = new Date();
  const d = new Date(dateStr);
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffH = Math.floor(diffMs / 3600000);
  const diffD = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'agora mesmo';
  if (diffMin < 60) return `há ${diffMin} min`;
  if (diffH < 24) return `há ${diffH}h`;
  if (diffD < 7) return `há ${diffD} dias`;
  return formatDate(dateStr);
}

export function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

export function getInitials(nome: string): string {
  return nome
    .split(' ')
    .slice(0, 2)
    .map((n) => (n[0] || '').toUpperCase())
    .join('');
}

export function getFileIcon(tipo?: string): string {
  const icons: Record<string, string> = {
    pdf: '📄', docx: '📝', doc: '📝', xlsx: '📊', xls: '📊',
    pptx: '📑', ppt: '📑', png: '🖼️', jpg: '🖼️', jpeg: '🖼️',
    zip: '🗜️', txt: '📃', csv: '📊',
  };
  return icons[(tipo || '').toLowerCase()] || '📎';
}

export function getFileType(filename?: string): string {
  return filename?.split('.').pop()?.toLowerCase() || 'arquivo';
}

export function formatFileSize(bytes: number): string {
  if (!bytes || bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}
