import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DataService } from '../core/data.service';
import { Prioridade, StatusTarefa, Tarefa } from '../core/models';
import { ModalComponent } from '../shared/modal.component';
import { PageHeaderComponent } from '../shared/page-header.component';
import { IconComponent } from '../shared/icon.component';
import { ToastService } from '../core/toast.service';
import { formatDate, generateId, todayISO } from '../core/utils';

const PRIO_CONF: Record<Prioridade, { badge: string; label: string }> = {
  alta: { badge: 'badge-red', label: 'Alta' },
  media: { badge: 'badge-yellow', label: 'Média' },
  baixa: { badge: 'badge-green', label: 'Baixa' },
};
const STATUS_TAR: Record<StatusTarefa, { badge: string; label: string }> = {
  pendente: { badge: 'badge-yellow', label: 'Pendente' },
  andamento: { badge: 'badge-blue', label: 'Em andamento' },
  concluida: { badge: 'badge-green', label: 'Concluída' },
  cancelada: { badge: 'badge-red', label: 'Cancelada' },
};
const PRIO_ORDER: Record<string, number> = { alta: 0, media: 1, baixa: 2 };

interface TarefaForm {
  id: string;
  titulo: string;
  descricao: string;
  responsavel: string;
  prazo: string;
  prioridade: Prioridade;
  status: StatusTarefa;
  criadoEm?: string;
}

@Component({
  selector: 'app-tarefas',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, PageHeaderComponent, ModalComponent, IconComponent],
  template: `
    <app-page-header kicker="Pendências" title="Tarefas" subtitle="Gestão de tarefas e responsabilidades do CA">
      <button class="btn btn-primary" (click)="abrir()"><app-icon name="plus" /> Nova Tarefa</button>
    </app-page-header>

    <div class="content">
      <!-- Stats -->
      <div class="cards-grid">
        @for (s of stats(); track s.label) {
          <div class="stat-card">
            <div class="stat-card-top"><div class="stat-card-icon {{ s.color }}"><app-icon [name]="s.icon" [size]="19" /></div></div>
            <div class="stat-card-value">{{ s.value }}</div>
            <div class="stat-card-label">{{ s.label }}</div>
          </div>
        }
      </div>

      <!-- Filtros -->
      <div class="table-card" style="margin-bottom:20px">
        <div style="padding:14px 20px">
          <div class="filters-row">
            <div class="search-input-wrap" style="flex:1;min-width:180px">
              <input type="text" class="form-control" placeholder="Buscar tarefa..." [ngModel]="search()" (ngModelChange)="search.set($event)" />
            </div>
            <select class="form-control" style="width:auto" [ngModel]="statusFilter()" (ngModelChange)="statusFilter.set($event)">
              <option value="">Todos os status</option>
              <option value="pendente">Pendente</option>
              <option value="andamento">Em andamento</option>
              <option value="concluida">Concluída</option>
              <option value="cancelada">Cancelada</option>
            </select>
            <select class="form-control" style="width:auto" [ngModel]="prioFilter()" (ngModelChange)="prioFilter.set($event)">
              <option value="">Todas as prioridades</option>
              <option value="alta">Alta</option>
              <option value="media">Média</option>
              <option value="baixa">Baixa</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Tabela -->
      <div class="table-card">
        <div class="table-card-header">
          <h2>Lista de Tarefas</h2>
          <span style="font-size:13px;color:var(--text-dim)">{{ filtrados().length }} tarefa(s)</span>
        </div>
        @if (filtrados().length) {
          <div class="table-scroll">
            <table>
              <thead>
                <tr>
                  <th style="width:32px"></th><th>Tarefa</th><th>Responsável</th>
                  <th>Prazo</th><th>Prioridade</th><th>Status</th><th style="text-align:center">Ações</th>
                </tr>
              </thead>
              <tbody>
                @for (t of filtrados(); track t.id) {
                  <tr style="cursor:pointer" [style.opacity]="t.status === 'concluida' ? 0.6 : 1" (click)="editar(t)">
                    <td>
                      <input
                        type="checkbox"
                        [checked]="t.status === 'concluida'"
                        (click)="$event.stopPropagation()"
                        (change)="toggle(t, $any($event.target).checked)"
                        style="width:16px;height:16px;cursor:pointer;accent-color:var(--gold)"
                      />
                    </td>
                    <td>
                      <div style="font-weight:600;color:#fff" [style.text-decoration]="t.status === 'concluida' ? 'line-through' : 'none'">{{ t.titulo }}</div>
                      @if (t.descricao) {
                        <div style="font-size:12px;color:var(--text-dim)">{{ t.descricao.length > 60 ? t.descricao.slice(0, 60) + '…' : t.descricao }}</div>
                      }
                    </td>
                    <td style="font-size:13px">{{ t.responsavel || '—' }}</td>
                    <td style="white-space:nowrap">
                      @if (t.prazo) {
                        <span [style.color]="atrasada(t) ? 'var(--red)' : 'inherit'" [style.font-weight]="atrasada(t) ? 600 : 400">
                          {{ fmtDate(t.prazo) }}{{ atrasada(t) ? ' · atrasada' : '' }}
                        </span>
                      } @else {
                        —
                      }
                    </td>
                    <td><span class="badge {{ prioConf(t.prioridade).badge }}">{{ prioConf(t.prioridade).label }}</span></td>
                    <td><span class="badge {{ statusConf(t.status).badge }}">{{ statusConf(t.status).label }}</span></td>
                    <td style="text-align:center;white-space:nowrap">
                      <button type="button" class="btn btn-outline btn-sm btn-icon" (click)="$event.stopPropagation(); editar(t)" aria-label="Editar"><app-icon name="edit" /></button>
                      <button type="button" class="btn btn-danger btn-sm btn-icon" (click)="$event.stopPropagation(); excluir(t.id)" aria-label="Excluir"><app-icon name="trash" /></button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        } @else {
          <div class="empty-state">
            <div class="empty-state-icon"><app-icon name="tasks" [size]="40" /></div>
            <h3>Nenhuma tarefa encontrada</h3>
            <p>Crie tarefas para delegar e acompanhar as responsabilidades do CA.</p>
          </div>
        }
      </div>
    </div>

    <!-- Modal Tarefa -->
    <app-modal [open]="modalOpen()" [title]="form.id ? 'Editar Tarefa' : 'Nova Tarefa'" (closed)="modalOpen.set(false)">
      <div class="form-group">
        <label class="form-label">Título da tarefa <span>*</span></label>
        <input type="text" class="form-control" placeholder="O que precisa ser feito?" [(ngModel)]="form.titulo" />
      </div>
      <div class="form-group">
        <label class="form-label">Descrição</label>
        <textarea class="form-control" rows="2" placeholder="Detalhes da tarefa..." [(ngModel)]="form.descricao"></textarea>
      </div>
      <div class="form-row form-row-2">
        <div class="form-group">
          <label class="form-label">Responsável</label>
          <input type="text" class="form-control" placeholder="Nome do responsável" [(ngModel)]="form.responsavel" />
        </div>
        <div class="form-group">
          <label class="form-label">Prazo</label>
          <input type="date" class="form-control" [(ngModel)]="form.prazo" />
        </div>
      </div>
      <div class="form-row form-row-2">
        <div class="form-group">
          <label class="form-label">Prioridade</label>
          <select class="form-control" [(ngModel)]="form.prioridade">
            <option value="baixa">Baixa</option>
            <option value="media">Média</option>
            <option value="alta">Alta</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Status</label>
          <select class="form-control" [(ngModel)]="form.status">
            <option value="pendente">Pendente</option>
            <option value="andamento">Em andamento</option>
            <option value="concluida">Concluída</option>
            <option value="cancelada">Cancelada</option>
          </select>
        </div>
      </div>

      <ng-container modal-footer>
        <button class="btn btn-outline" (click)="modalOpen.set(false)">Cancelar</button>
        <button class="btn btn-primary" (click)="salvar()">Salvar</button>
      </ng-container>
    </app-modal>
  `,
})
export class TarefasComponent {
  private readonly data = inject(DataService);
  private readonly toast = inject(ToastService);

  readonly search = signal('');
  readonly statusFilter = signal('');
  readonly prioFilter = signal('');

  readonly modalOpen = signal(false);

  form: TarefaForm = this.emptyForm();
  private readonly hoje = todayISO();

  readonly stats = computed(() => {
    const t = this.data.tarefas.items();
    return [
      { label: 'Total', value: t.length, icon: 'tasks', color: 'icon-blue' },
      { label: 'Pendentes', value: t.filter((x) => x.status === 'pendente').length, icon: 'clock', color: 'icon-yellow' },
      { label: 'Em andamento', value: t.filter((x) => x.status === 'andamento').length, icon: 'activity', color: 'icon-purple' },
      { label: 'Concluídas', value: t.filter((x) => x.status === 'concluida').length, icon: 'check', color: 'icon-green' },
    ];
  });

  readonly filtrados = computed<Tarefa[]>(() => {
    const s = this.search().toLowerCase();
    let lista = [...this.data.tarefas.items()].sort((a, b) => {
      const pa = PRIO_ORDER[a.prioridade] ?? 3;
      const pb = PRIO_ORDER[b.prioridade] ?? 3;
      return pa !== pb ? pa - pb : (a.prazo || '').localeCompare(b.prazo || '');
    });
    if (s) lista = lista.filter((t) => t.titulo.toLowerCase().includes(s) || (t.responsavel || '').toLowerCase().includes(s));
    if (this.statusFilter()) lista = lista.filter((t) => t.status === this.statusFilter());
    if (this.prioFilter()) lista = lista.filter((t) => t.prioridade === this.prioFilter());
    return lista;
  });

  fmtDate = formatDate;
  prioConf(p: Prioridade) {
    return PRIO_CONF[p] || PRIO_CONF.baixa;
  }
  statusConf(s: StatusTarefa) {
    return STATUS_TAR[s] || STATUS_TAR.pendente;
  }
  atrasada(t: Tarefa): boolean {
    return !!t.prazo && t.prazo < this.hoje && t.status === 'pendente';
  }

  toggle(t: Tarefa, checked: boolean): void {
    this.data.tarefas.update({ ...t, status: checked ? 'concluida' : 'pendente' });
    this.toast.show(checked ? 'Tarefa concluída!' : 'Tarefa reaberta.');
  }

  abrir(): void {
    this.form = this.emptyForm();
    this.modalOpen.set(true);
  }

  editar(t: Tarefa): void {
    this.form = {
      id: t.id,
      titulo: t.titulo,
      descricao: t.descricao || '',
      responsavel: t.responsavel || '',
      prazo: t.prazo || '',
      prioridade: t.prioridade || 'media',
      status: t.status || 'pendente',
      criadoEm: t.criadoEm,
    };
    this.modalOpen.set(true);
  }

  salvar(): void {
    if (!this.form.titulo.trim()) return this.toast.show('Informe o título da tarefa.', 'error');

    const obj: Tarefa = {
      id: this.form.id || generateId(),
      titulo: this.form.titulo.trim(),
      descricao: this.form.descricao.trim(),
      responsavel: this.form.responsavel.trim(),
      prazo: this.form.prazo,
      prioridade: this.form.prioridade,
      status: this.form.status,
      criadoEm: this.form.criadoEm || new Date().toISOString(),
    };
    if (this.form.id) this.data.tarefas.update(obj);
    else this.data.tarefas.add(obj, true);
    this.toast.show(this.form.id ? 'Tarefa atualizada!' : 'Tarefa criada!');
    this.modalOpen.set(false);
  }

  excluir(id: string): void {
    if (!confirm('Excluir esta tarefa?')) return;
    this.data.tarefas.remove(id);
    this.toast.show('Tarefa excluída.');
  }

  private emptyForm(): TarefaForm {
    return { id: '', titulo: '', descricao: '', responsavel: '', prazo: '', prioridade: 'media', status: 'pendente' };
  }
}
