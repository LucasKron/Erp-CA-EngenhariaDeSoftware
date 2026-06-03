import { Injectable, Signal, WritableSignal, signal } from '@angular/core';
import { Documento, Evento, Lancamento, Membro, Reuniao, Tarefa } from './models';
import { generateId } from './utils';

const PREFIX = 'ca_erp_';

function readLS<T>(key: string): T | null {
  try {
    const v = localStorage.getItem(PREFIX + key);
    return v ? (JSON.parse(v) as T) : null;
  } catch {
    return null;
  }
}

function writeLS<T>(key: string, value: T): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    /* QuotaExceeded — ignorado silenciosamente */
  }
}

/** Coleção reativa persistida em localStorage. */
class Collection<T extends { id: string }> {
  private readonly _items: WritableSignal<T[]>;
  readonly items: Signal<T[]>;

  constructor(
    private readonly key: string,
    seed: T[],
  ) {
    const stored = readLS<T[]>(key);
    this._items = signal<T[]>(stored ?? seed);
    this.items = this._items.asReadonly();
    if (!stored) writeLS(key, seed);
  }

  private commit(list: T[]): void {
    this._items.set(list);
    writeLS(this.key, list);
  }

  set(list: T[]): void {
    this.commit(list);
  }

  add(item: T, prepend = false): void {
    const cur = this._items();
    this.commit(prepend ? [item, ...cur] : [...cur, item]);
  }

  update(item: T): void {
    this.commit(this._items().map((i) => (i.id === item.id ? item : i)));
  }

  remove(id: string): void {
    this.commit(this._items().filter((i) => i.id !== id));
  }

  find(id: string): T | undefined {
    return this._items().find((i) => i.id === id);
  }
}

@Injectable({ providedIn: 'root' })
export class DataService {
  readonly membros: Collection<Membro>;
  readonly financeiro: Collection<Lancamento>;
  readonly eventos: Collection<Evento>;
  readonly reunioes: Collection<Reuniao>;
  readonly tarefas: Collection<Tarefa>;
  readonly documentos: Collection<Documento>;

  constructor() {
    this.membros = new Collection<Membro>('membros', SEED_MEMBROS());
    this.financeiro = new Collection<Lancamento>('financeiro', SEED_FINANCEIRO());
    this.eventos = new Collection<Evento>('eventos', SEED_EVENTOS());
    this.reunioes = new Collection<Reuniao>('reunioes', SEED_REUNIOES());
    this.tarefas = new Collection<Tarefa>('tarefas', SEED_TAREFAS());
    this.documentos = new Collection<Documento>('documentos', SEED_DOCUMENTOS());
  }
}

// ===== SEED DATA (primeira execução) =====
function SEED_MEMBROS(): Membro[] {
  return [
    { id: generateId(), nome: 'Maria Silva', cargo: 'Presidente', email: 'maria@pucpr.edu.br', periodo: '5° período', telefone: '(45) 99901-0001', ativo: true, dataEntrada: '2024-03-01', observacao: '' },
    { id: generateId(), nome: 'João Santos', cargo: 'Vice-Presidente', email: 'joao@pucpr.edu.br', periodo: '4° período', telefone: '(45) 99901-0002', ativo: true, dataEntrada: '2024-03-01', observacao: '' },
    { id: generateId(), nome: 'Ana Costa', cargo: 'Tesoureiro(a)', email: 'ana@pucpr.edu.br', periodo: '5° período', telefone: '(45) 99901-0003', ativo: true, dataEntrada: '2024-03-01', observacao: '' },
    { id: generateId(), nome: 'Lucas Mendes', cargo: 'Secretário(a)', email: 'lucas@pucpr.edu.br', periodo: '3° período', telefone: '(45) 99901-0004', ativo: true, dataEntrada: '2024-03-01', observacao: '' },
    { id: generateId(), nome: 'Beatriz Lima', cargo: 'Diretor(a) de Eventos', email: 'beatriz@pucpr.edu.br', periodo: '4° período', telefone: '(45) 99901-0005', ativo: true, dataEntrada: '2024-03-01', observacao: '' },
  ];
}

function SEED_FINANCEIRO(): Lancamento[] {
  return [
    { id: generateId(), tipo: 'receita', descricao: 'Mensalidade membros - Março/2024', valor: 250, categoria: 'Mensalidade', data: '2024-03-05', observacao: '' },
    { id: generateId(), tipo: 'receita', descricao: 'Venda de canecas CA', valor: 180, categoria: 'Venda', data: '2024-03-12', observacao: '18 unidades x R$10' },
    { id: generateId(), tipo: 'despesa', descricao: 'Impressão material para boas-vindas', valor: 94.5, categoria: 'Material', data: '2024-03-10', observacao: 'Gráfica Central' },
    { id: generateId(), tipo: 'despesa', descricao: 'Lanche para reunião geral', valor: 67, categoria: 'Alimentação', data: '2024-03-18', observacao: '' },
    { id: generateId(), tipo: 'receita', descricao: 'Apoio institucional PUC - Semestre 1', valor: 500, categoria: 'Apoio Institucional', data: '2024-03-20', observacao: '' },
  ];
}

function SEED_EVENTOS(): Evento[] {
  return [
    { id: generateId(), titulo: 'Semana de Boas-Vindas', data: '2024-03-25', horaInicio: '14:00', local: 'Hall Principal - Bloco A', descricao: 'Recepção aos calouros do curso de Engenharia de Software.', status: 'concluido', responsavel: 'Beatriz Lima', observacao: '' },
    { id: generateId(), titulo: 'Hackathon CA 2024', data: '2024-04-20', horaInicio: '08:00', local: 'Lab de Informática 1 e 2', descricao: '24h de desenvolvimento de projetos sociais com tecnologia.', status: 'planejado', responsavel: 'João Santos', observacao: '' },
    { id: generateId(), titulo: 'Workshop: Git e GitHub para Iniciantes', data: '2024-04-05', horaInicio: '19:00', local: 'Sala 204 - Bloco B', descricao: 'Workshop prático para alunos do 1° e 2° período.', status: 'planejado', responsavel: 'Lucas Mendes', observacao: '' },
  ];
}

function SEED_REUNIOES(): Reuniao[] {
  return [
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
      status: 'realizada',
    },
  ];
}

function SEED_TAREFAS(): Tarefa[] {
  return [
    { id: generateId(), titulo: 'Divulgar Hackathon nas redes sociais', descricao: '', responsavel: 'Beatriz Lima', prazo: '2024-04-10', prioridade: 'alta', status: 'pendente', criadoEm: new Date().toISOString() },
    { id: generateId(), titulo: 'Confirmar local para o Workshop de Git', descricao: 'Verificar disponibilidade da Sala 204', responsavel: 'Lucas Mendes', prazo: '2024-03-30', prioridade: 'media', status: 'pendente', criadoEm: new Date().toISOString() },
    { id: generateId(), titulo: 'Atualizar lista de membros 2024', descricao: '', responsavel: 'Ana Costa', prazo: '2024-03-28', prioridade: 'baixa', status: 'concluida', criadoEm: new Date().toISOString() },
  ];
}

function SEED_DOCUMENTOS(): Documento[] {
  return [
    { id: generateId(), nome: 'Estatuto do CA - 2024.pdf', categoria: 'Regulamento', descricao: 'Estatuto atualizado do Centro Acadêmico', tamanho: '245 KB', tipo: 'pdf', uploadEm: new Date().toISOString(), fileData: null },
    { id: generateId(), nome: 'Ata Reunião Março 2024.docx', categoria: 'Ata', descricao: 'Ata da reunião ordinária de março', tamanho: '38 KB', tipo: 'docx', uploadEm: new Date().toISOString(), fileData: null },
  ];
}
