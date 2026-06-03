import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DataService } from '../core/data.service';
import { Lancamento, TipoLancamento } from '../core/models';
import { ModalComponent } from '../shared/modal.component';
import { PageHeaderComponent } from '../shared/page-header.component';
import { IconComponent } from '../shared/icon.component';
import { ToastService } from '../core/toast.service';
import { formatCurrency, formatDate, generateId, todayISO } from '../core/utils';

const CATS_RECEITA = ['Mensalidade', 'Venda', 'Apoio Institucional', 'Doação', 'Outros'];
const CATS_DESPESA = ['Material', 'Alimentação', 'Transporte', 'Infraestrutura', 'Divulgação', 'Serviço', 'Outros'];
const CATS_FILTRO = [
  'Mensalidade', 'Venda', 'Apoio Institucional', 'Doação', 'Material',
  'Alimentação', 'Transporte', 'Infraestrutura', 'Divulgação', 'Outros',
];

interface FinForm {
  id: string;
  tipo: TipoLancamento;
  data: string;
  valor: number | null;
  descricao: string;
  categoria: string;
  observacao: string;
  criadoEm?: string;
}

@Component({
  selector: 'app-financeiro',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, PageHeaderComponent, ModalComponent, IconComponent],
  template: `
    <app-page-header kicker="Caixa" title="Financeiro" subtitle="Controle de receitas, despesas e saldo do CA">
      <button class="btn btn-success" (click)="abrir('receita')"><app-icon name="plus" /> Receita</button>
      <button class="btn btn-danger" (click)="abrir('despesa')"><app-icon name="minus" /> Despesa</button>
    </app-page-header>

    <div class="content">
      <!-- Resumo -->
      <div class="finance-summary">
        <div class="finance-card">
          <div class="finance-card-icon" style="color:var(--green)"><app-icon name="income" [size]="20" /></div>
          <div class="finance-card-value value-income">{{ fmt(receitas()) }}</div>
          <div class="finance-card-label">Total de Receitas</div>
        </div>
        <div class="finance-card">
          <div class="finance-card-icon" style="color:var(--red)"><app-icon name="expense" [size]="20" /></div>
          <div class="finance-card-value value-expense">{{ fmt(despesas()) }}</div>
          <div class="finance-card-label">Total de Despesas</div>
        </div>
        <div class="finance-card">
          <div class="finance-card-icon" style="color:var(--gold)"><app-icon name="balance" [size]="20" /></div>
          <div class="finance-card-value" [class.value-balance-positive]="saldo() >= 0" [class.value-balance-negative]="saldo() < 0">
            {{ fmt(saldo()) }}
          </div>
          <div class="finance-card-label">Saldo Atual</div>
        </div>
      </div>

      <!-- Filtros -->
      <div class="table-card" style="margin-bottom:20px">
        <div style="padding:14px 20px">
          <div class="filters-row">
            <div class="search-input-wrap" style="flex:1;min-width:180px">
              <input type="text" class="form-control" placeholder="Buscar lançamento..." [ngModel]="search()" (ngModelChange)="search.set($event)" />
            </div>
            <select class="form-control" style="width:auto" [ngModel]="tipoFilter()" (ngModelChange)="tipoFilter.set($event)">
              <option value="">Todos os tipos</option>
              <option value="receita">Receitas</option>
              <option value="despesa">Despesas</option>
            </select>
            <select class="form-control" style="width:auto" [ngModel]="catFilter()" (ngModelChange)="catFilter.set($event)">
              <option value="">Todas as categorias</option>
              @for (c of catsFiltro; track c) {
                <option [value]="c">{{ c }}</option>
              }
            </select>
            <input type="month" class="form-control" style="width:auto" [ngModel]="mesFilter()" (ngModelChange)="mesFilter.set($event)" />
          </div>
        </div>
      </div>

      <!-- Tabela -->
      <div class="table-card">
        <div class="table-card-header">
          <h2>Lançamentos</h2>
          <span style="font-size:13px;color:var(--text-dim)">{{ filtrados().length }} lançamento(s)</span>
        </div>
        @if (filtrados().length) {
          <div class="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Descrição</th>
                  <th>Categoria</th>
                  <th>Tipo</th>
                  <th style="text-align:right">Valor</th>
                  <th style="text-align:center">Ações</th>
                </tr>
              </thead>
              <tbody>
                @for (f of filtrados(); track f.id) {
                  <tr style="cursor:pointer" (click)="ver(f)">
                    <td style="white-space:nowrap">{{ fmtDate(f.data) }}</td>
                    <td style="max-width:280px">
                      <div style="font-weight:600;color:#fff">{{ f.descricao }}</div>
                      @if (f.observacao) {
                        <div style="font-size:12px;color:var(--text-dim)">{{ f.observacao }}</div>
                      }
                    </td>
                    <td><span class="badge badge-gray">{{ f.categoria }}</span></td>
                    <td>
                      <span class="badge {{ f.tipo === 'receita' ? 'badge-green' : 'badge-red' }}">
                        {{ f.tipo === 'receita' ? 'Receita' : 'Despesa' }}
                      </span>
                    </td>
                    <td
                      style="text-align:right;font-weight:600;font-size:14.5px;white-space:nowrap;font-family:var(--font-display)"
                      [style.color]="f.tipo === 'receita' ? 'var(--green)' : 'var(--red)'"
                    >
                      {{ f.tipo === 'receita' ? '+' : '−' }} {{ fmt(f.valor) }}
                    </td>
                    <td style="text-align:center;white-space:nowrap">
                      <button type="button" class="btn btn-outline btn-sm btn-icon" (click)="$event.stopPropagation(); editar(f)" aria-label="Editar"><app-icon name="edit" /></button>
                      <button type="button" class="btn btn-danger btn-sm btn-icon" (click)="$event.stopPropagation(); excluir(f.id)" aria-label="Excluir"><app-icon name="trash" /></button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        } @else {
          <div class="empty-state">
            <div class="empty-state-icon"><app-icon name="finance" [size]="40" /></div>
            <h3>Nenhum lançamento encontrado</h3>
            <p>Registre receitas e despesas para controlar o financeiro do CA.</p>
          </div>
        }
      </div>
    </div>

    <!-- Modal Lançamento -->
    <app-modal [open]="modalOpen()" [title]="tituloModal()" (closed)="modalOpen.set(false)">
      <div class="form-row form-row-2">
        <div class="form-group">
          <label class="form-label">Data <span>*</span></label>
          <input type="date" class="form-control" [(ngModel)]="form.data" />
        </div>
        <div class="form-group">
          <label class="form-label">Valor (R$) <span>*</span></label>
          <input type="number" class="form-control" placeholder="0,00" min="0" step="0.01" [(ngModel)]="form.valor" />
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Descrição <span>*</span></label>
        <input type="text" class="form-control" placeholder="Descreva o lançamento..." [(ngModel)]="form.descricao" />
      </div>
      <div class="form-row form-row-2">
        <div class="form-group">
          <label class="form-label">Categoria <span>*</span></label>
          <select class="form-control" [(ngModel)]="form.categoria">
            <option value="">Selecionar...</option>
            @for (c of cats(); track c) {
              <option [value]="c">{{ c }}</option>
            }
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Comprovante (opcional)</label>
          <input type="file" class="form-control" accept=".pdf,.jpg,.jpeg,.png" style="padding:6px" (change)="onComprovante($event)" />
          <div class="form-hint">PDF ou imagem</div>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Observação</label>
        <textarea class="form-control" rows="2" placeholder="Informações adicionais..." [(ngModel)]="form.observacao"></textarea>
      </div>

      <ng-container modal-footer>
        <button class="btn btn-outline" (click)="modalOpen.set(false)">Cancelar</button>
        <button class="btn btn-primary" (click)="salvar()">{{ form.id ? 'Salvar Alterações' : 'Salvar' }}</button>
      </ng-container>
    </app-modal>

    <!-- Modal Detalhe -->
    <app-modal [open]="!!viewing()" title="Detalhe do Lançamento" (closed)="viewing.set(null)">
      @if (viewing(); as f) {
        <div
          style="display:flex;align-items:center;gap:14px;margin-bottom:18px;padding:16px;border-radius:var(--r-sm);border:1px solid var(--hair)"
          [style.color]="f.tipo === 'receita' ? 'var(--green)' : 'var(--red)'"
        >
          <app-icon [name]="f.tipo === 'receita' ? 'income' : 'expense'" [size]="26" />
          <div>
            <div style="font-family:var(--font-display);font-size:24px;font-weight:600">
              {{ f.tipo === 'receita' ? '+' : '−' }} {{ fmt(f.valor) }}
            </div>
            <div style="font-family:var(--font-mono);font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--text-3)">{{ f.tipo === 'receita' ? 'Receita' : 'Despesa' }}</div>
          </div>
        </div>
        <div class="detail-row"><span class="detail-label">Descrição</span><span class="detail-value">{{ f.descricao }}</span></div>
        <div class="detail-row"><span class="detail-label">Categoria</span><span class="detail-value">{{ f.categoria }}</span></div>
        <div class="detail-row"><span class="detail-label">Data</span><span class="detail-value">{{ fmtDate(f.data) }}</span></div>
        @if (f.observacao) {
          <div class="detail-row"><span class="detail-label">Observação</span><span class="detail-value">{{ f.observacao }}</span></div>
        }
        @if (f.comprovante) {
          <hr class="divider" />
          <button type="button" class="btn btn-secondary btn-sm" (click)="baixarComprovante(f)"><app-icon name="download" /> Baixar Comprovante</button>
        }
      }

      <ng-container modal-footer>
        <button class="btn btn-danger btn-sm" (click)="excluir(viewing()!.id); viewing.set(null)"><app-icon name="trash" /> Excluir</button>
        <button class="btn btn-secondary btn-sm" (click)="editar(viewing()!)"><app-icon name="edit" /> Editar</button>
        <button class="btn btn-outline" (click)="viewing.set(null)">Fechar</button>
      </ng-container>
    </app-modal>
  `,
})
export class FinanceiroComponent {
  private readonly data = inject(DataService);
  private readonly toast = inject(ToastService);

  readonly catsFiltro = CATS_FILTRO;

  readonly search = signal('');
  readonly tipoFilter = signal('');
  readonly catFilter = signal('');
  readonly mesFilter = signal('');

  readonly modalOpen = signal(false);
  readonly viewing = signal<Lancamento | null>(null);

  form: FinForm = this.emptyForm('receita');
  private comprovanteFile: File | null = null;

  readonly receitas = computed(() =>
    this.data.financeiro.items().filter((f) => f.tipo === 'receita').reduce((s, f) => s + Number(f.valor), 0),
  );
  readonly despesas = computed(() =>
    this.data.financeiro.items().filter((f) => f.tipo === 'despesa').reduce((s, f) => s + Number(f.valor), 0),
  );
  readonly saldo = computed(() => this.receitas() - this.despesas());

  readonly filtrados = computed<Lancamento[]>(() => {
    const s = this.search().toLowerCase();
    let fin = [...this.data.financeiro.items()].sort((a, b) => b.data.localeCompare(a.data));
    if (s) fin = fin.filter((f) => f.descricao.toLowerCase().includes(s) || f.categoria.toLowerCase().includes(s));
    if (this.tipoFilter()) fin = fin.filter((f) => f.tipo === this.tipoFilter());
    if (this.catFilter()) fin = fin.filter((f) => f.categoria === this.catFilter());
    if (this.mesFilter()) fin = fin.filter((f) => f.data.startsWith(this.mesFilter()));
    return fin;
  });

  fmt = formatCurrency;
  fmtDate = formatDate;

  cats(): string[] {
    return this.form.tipo === 'receita' ? CATS_RECEITA : CATS_DESPESA;
  }

  tituloModal(): string {
    if (this.form.id) return 'Editar Lançamento';
    return this.form.tipo === 'receita' ? '+ Nova Receita' : '− Nova Despesa';
  }

  abrir(tipo: TipoLancamento): void {
    this.form = this.emptyForm(tipo);
    this.comprovanteFile = null;
    this.modalOpen.set(true);
  }

  editar(lan: Lancamento): void {
    this.viewing.set(null);
    this.form = {
      id: lan.id,
      tipo: lan.tipo,
      data: lan.data,
      valor: lan.valor,
      descricao: lan.descricao,
      categoria: lan.categoria,
      observacao: lan.observacao,
      criadoEm: lan.criadoEm,
    };
    this.comprovanteFile = null;
    this.modalOpen.set(true);
  }

  onComprovante(e: Event): void {
    this.comprovanteFile = (e.target as HTMLInputElement).files?.[0] ?? null;
  }

  salvar(): void {
    const valor = Number(this.form.valor);
    if (!this.form.data) return this.toast.show('Informe a data.', 'error');
    if (!valor || valor <= 0) return this.toast.show('Informe um valor válido.', 'error');
    if (!this.form.descricao.trim()) return this.toast.show('Informe a descrição.', 'error');
    if (!this.form.categoria) return this.toast.show('Selecione uma categoria.', 'error');

    const existing = this.form.id ? this.data.financeiro.find(this.form.id) : null;

    const persist = (comprovante: string | null) => {
      const obj: Lancamento = {
        id: this.form.id || generateId(),
        tipo: this.form.tipo,
        descricao: this.form.descricao.trim(),
        valor,
        categoria: this.form.categoria,
        data: this.form.data,
        observacao: this.form.observacao.trim(),
        comprovante: comprovante ?? existing?.comprovante ?? null,
        criadoEm: this.form.criadoEm || new Date().toISOString(),
      };
      if (this.form.id) this.data.financeiro.update(obj);
      else this.data.financeiro.add(obj, true);
      this.toast.show(this.form.id ? 'Lançamento atualizado!' : 'Lançamento registrado!');
      this.modalOpen.set(false);
    };

    if (this.comprovanteFile) {
      const reader = new FileReader();
      reader.onload = (ev) => persist(ev.target?.result as string);
      reader.readAsDataURL(this.comprovanteFile);
    } else {
      persist(null);
    }
  }

  ver(f: Lancamento): void {
    this.viewing.set(f);
  }

  baixarComprovante(f: Lancamento): void {
    if (!f.comprovante) return;
    const a = document.createElement('a');
    a.href = f.comprovante;
    a.download = 'comprovante_' + f.id;
    a.click();
  }

  excluir(id: string): void {
    if (!confirm('Excluir este lançamento?')) return;
    this.data.financeiro.remove(id);
    this.toast.show('Lançamento excluído.');
  }

  private emptyForm(tipo: TipoLancamento): FinForm {
    return { id: '', tipo, data: todayISO(), valor: null, descricao: '', categoria: '', observacao: '' };
  }
}
