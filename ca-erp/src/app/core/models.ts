// ===== CA ERP - Modelos de domínio =====

export interface Membro {
  id: string;
  nome: string;
  cargo: string;
  email: string;
  periodo: string;
  telefone: string;
  ativo: boolean;
  dataEntrada: string;
  observacao: string;
}

export type TipoLancamento = 'receita' | 'despesa';

export interface Lancamento {
  id: string;
  tipo: TipoLancamento;
  descricao: string;
  valor: number;
  categoria: string;
  data: string;
  observacao: string;
  comprovante?: string | null;
  criadoEm?: string;
}

export type StatusEvento = 'planejado' | 'andamento' | 'concluido' | 'cancelado';

export interface Evento {
  id: string;
  titulo: string;
  data: string;
  horaInicio: string;
  horaFim?: string;
  local: string;
  descricao: string;
  status: StatusEvento;
  responsavel: string;
  publico?: string;
  observacao: string;
  criadoEm?: string;
}

export type TipoReuniao = 'ordinaria' | 'extraordinaria' | 'planejamento' | 'outros';
export type StatusReuniao = 'agendada' | 'realizada' | 'cancelada';

export interface Reuniao {
  id: string;
  titulo: string;
  data: string;
  hora: string;
  local: string;
  tipo: TipoReuniao;
  participantes: string;
  pauta: string;
  ata: string;
  status: StatusReuniao;
  criadoEm?: string;
}

export type Prioridade = 'alta' | 'media' | 'baixa';
export type StatusTarefa = 'pendente' | 'andamento' | 'concluida' | 'cancelada';

export interface Tarefa {
  id: string;
  titulo: string;
  descricao: string;
  responsavel: string;
  prazo: string;
  prioridade: Prioridade;
  status: StatusTarefa;
  criadoEm: string;
}

export interface Documento {
  id: string;
  nome: string;
  categoria: string;
  descricao: string;
  data?: string;
  tamanho: string;
  tipo: string;
  uploadEm: string;
  fileData?: string | null;
}
