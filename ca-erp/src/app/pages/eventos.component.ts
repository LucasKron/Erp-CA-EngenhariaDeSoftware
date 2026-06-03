import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DataService } from '../core/data.service';
import { Evento, StatusEvento } from '../core/models';
import { ModalComponent } from '../shared/modal.component';
import { PageHeaderComponent } from '../shared/page-header.component';
import { IconComponent } from '../shared/icon.component';
import { ToastService } from '../core/toast.service';
import { generateId, todayISO } from '../core/utils';

interface StatusInfo {
  label: string;
  badge: string;
}
const STATUS_CONF: Record<StatusEvento, StatusInfo> = {
  planejado: { label: 'Planejado', badge: 'badge-blue' },
  andamento: { label: 'Em andamento', badge: 'badge-yellow' },
  concluido: { label: 'Concluído', badge: 'badge-green' },
  cancelado: { label: 'Cancelado', badge: 'badge-red' },
};

interface EventoForm {
  id: string;
  titulo: string;
  data: string;
  horaInicio: string;
  horaFim: string;
  local: string;
  responsavel: string;
  status: StatusEvento;
  publico: string;
  descricao: string;
  observacao: string;
  criadoEm?: string;
}

@Component({
  selector: 'app-eventos',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, PageHeaderComponent, ModalComponent, IconComponent],
  template: `
    <app-page-header kicker="Agenda" title="Eventos" subtitle="Planejamento e controle de eventos do CA">
      <button class="btn btn-primary" (click)="abrir()"><app-icon name="plus" /> Novo Evento</button>
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
              <input type="text" class="form-control" placeholder="Buscar evento..." [ngModel]="search()" (ngModelChange)="search.set($event)" />
            </div>
            <select class="form-control" style="width:auto" [ngModel]="statusFilter()" (ngModelChange)="statusFilter.set($event)">
              <option value="">Todos os status</option>
              <option value="planejado">Planejado</option>
              <option value="andamento">Em andamento</option>
              <option value="concluido">Concluído</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Lista -->
      @if (filtrados().length) {
        <div class="events-list">
          @for (e of filtrados(); track e.id) {
            <div class="event-card status-{{ e.status }}" (click)="ver(e)">
              <div class="event-date-box">
                <div class="event-date-day">{{ dia(e.data) }}</div>
                <div class="event-date-month">{{ mes(e.data) }}</div>
              </div>
              <div class="event-content">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px">
                  <div class="event-title">{{ e.titulo }}</div>
                  <span class="badge {{ conf(e.status).badge }}">{{ conf(e.status).label }}</span>
                </div>
                <div class="event-details">
                  @if (e.horaInicio) {
                    <span>{{ e.horaInicio }}{{ e.horaFim ? '–' + e.horaFim : '' }}</span>
                  }
                  @if (e.local) {
                    <span>{{ e.local }}</span>
                  }
                  @if (e.responsavel) {
                    <span>{{ e.responsavel }}</span>
                  }
                  @if (e.publico) {
                    <span>~{{ e.publico }} pessoas</span>
                  }
                </div>
                @if (e.descricao) {
                  <div style="font-size:13px;color:var(--text-muted);line-height:1.5;margin-top:2px">
                    {{ e.descricao.length > 120 ? e.descricao.slice(0, 120) + '…' : e.descricao }}
                  </div>
                }
              </div>
              <div style="display:flex;flex-direction:column;gap:6px;flex-shrink:0">
                <button type="button" class="btn btn-outline btn-sm btn-icon" (click)="$event.stopPropagation(); editar(e)" aria-label="Editar"><app-icon name="edit" /></button>
                <button type="button" class="btn btn-danger btn-sm btn-icon" (click)="$event.stopPropagation(); excluir(e.id)" aria-label="Excluir"><app-icon name="trash" /></button>
              </div>
            </div>
          }
        </div>
      } @else {
        <div class="empty-state">
          <div class="empty-state-icon"><app-icon name="events" [size]="40" /></div>
          <h3>Nenhum evento encontrado</h3>
          <p>Adicione eventos para acompanhar a agenda do CA.</p>
          <button type="button" class="btn btn-primary" (click)="abrir()"><app-icon name="plus" /> Novo Evento</button>
        </div>
      }
    </div>

    <!-- Modal Evento -->
    <app-modal [open]="modalOpen()" [lg]="true" [title]="form.id ? 'Editar Evento' : 'Novo Evento'" (closed)="modalOpen.set(false)">
      <div class="form-group">
        <label class="form-label">Título do evento <span>*</span></label>
        <input type="text" class="form-control" placeholder="Ex: Hackathon CA 2024" [(ngModel)]="form.titulo" />
      </div>
      <div class="form-row form-row-3">
        <div class="form-group">
          <label class="form-label">Data <span>*</span></label>
          <input type="date" class="form-control" [(ngModel)]="form.data" />
        </div>
        <div class="form-group">
          <label class="form-label">Horário de início</label>
          <input type="time" class="form-control" [(ngModel)]="form.horaInicio" />
        </div>
        <div class="form-group">
          <label class="form-label">Horário de término</label>
          <input type="time" class="form-control" [(ngModel)]="form.horaFim" />
        </div>
      </div>
      <div class="form-row form-row-2">
        <div class="form-group">
          <label class="form-label">Local</label>
          <input type="text" class="form-control" placeholder="Ex: Sala 204, Bloco B" [(ngModel)]="form.local" />
        </div>
        <div class="form-group">
          <label class="form-label">Responsável</label>
          <input type="text" class="form-control" placeholder="Nome do responsável" [(ngModel)]="form.responsavel" />
        </div>
      </div>
      <div class="form-row form-row-2">
        <div class="form-group">
          <label class="form-label">Status</label>
          <select class="form-control" [(ngModel)]="form.status">
            <option value="planejado">Planejado</option>
            <option value="andamento">Em andamento</option>
            <option value="concluido">Concluído</option>
            <option value="cancelado">Cancelado</option>
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Público esperado</label>
          <input type="number" class="form-control" placeholder="Nº de participantes" min="0" [(ngModel)]="form.publico" />
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Descrição</label>
        <textarea class="form-control" rows="3" placeholder="Descreva o evento, objetivos, programação..." [(ngModel)]="form.descricao"></textarea>
      </div>
      <div class="form-group">
        <label class="form-label">Observação / Anotações internas</label>
        <textarea class="form-control" rows="2" placeholder="Notas internas da organização..." [(ngModel)]="form.observacao"></textarea>
      </div>

      <ng-container modal-footer>
        <button class="btn btn-outline" (click)="modalOpen.set(false)">Cancelar</button>
        <button class="btn btn-primary" (click)="salvar()">Salvar Evento</button>
      </ng-container>
    </app-modal>

    <!-- Modal Detalhe -->
    <app-modal [open]="!!viewing()" [lg]="true" [title]="viewing()?.titulo || 'Evento'" (closed)="viewing.set(null)">
      @if (viewing(); as e) {
        <div style="display:flex;gap:12px;align-items:center;margin-bottom:16px;flex-wrap:wrap">
          <span class="badge {{ conf(e.status).badge }}">{{ conf(e.status).label }}</span>
          <span style="font-family:var(--font-display);font-size:16px;font-weight:600;color:var(--text)">{{ dataLonga(e.data) }}</span>
        </div>
        <hr class="divider" />
        @if (e.horaInicio) {
          <div class="detail-row"><span class="detail-label">Horário</span><span class="detail-value">{{ e.horaInicio }}{{ e.horaFim ? ' até ' + e.horaFim : '' }}</span></div>
        }
        @if (e.local) {
          <div class="detail-row"><span class="detail-label">Local</span><span class="detail-value">{{ e.local }}</span></div>
        }
        @if (e.responsavel) {
          <div class="detail-row"><span class="detail-label">Responsável</span><span class="detail-value">{{ e.responsavel }}</span></div>
        }
        @if (e.publico) {
          <div class="detail-row"><span class="detail-label">Público esperado</span><span class="detail-value">{{ e.publico }} pessoas</span></div>
        }
        @if (e.descricao) {
          <hr class="divider" />
          <div style="font-size:13.5px;color:var(--text-soft);line-height:1.7;white-space:pre-wrap">{{ e.descricao }}</div>
        }
        @if (e.observacao) {
          <hr class="divider" />
          <div style="font-size:12.5px;color:var(--text-muted);background:var(--bg-2);border-radius:8px;padding:12px;font-style:italic">{{ e.observacao }}</div>
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
export class EventosComponent {
  private readonly data = inject(DataService);
  private readonly toast = inject(ToastService);

  readonly search = signal('');
  readonly statusFilter = signal('');

  readonly modalOpen = signal(false);
  readonly viewing = signal<Evento | null>(null);

  form: EventoForm = this.emptyForm();

  readonly stats = computed(() => {
    const ev = this.data.eventos.items();
    return [
      { label: 'Total', value: ev.length, icon: 'events', color: 'icon-blue' },
      { label: 'Planejados', value: ev.filter((e) => e.status === 'planejado').length, icon: 'clock', color: 'icon-purple' },
      { label: 'Em andamento', value: ev.filter((e) => e.status === 'andamento').length, icon: 'activity', color: 'icon-yellow' },
      { label: 'Concluídos', value: ev.filter((e) => e.status === 'concluido').length, icon: 'check', color: 'icon-green' },
    ];
  });

  readonly filtrados = computed<Evento[]>(() => {
    const s = this.search().toLowerCase();
    let ev = [...this.data.eventos.items()].sort((a, b) => b.data.localeCompare(a.data));
    if (s) ev = ev.filter((e) => e.titulo.toLowerCase().includes(s) || (e.local || '').toLowerCase().includes(s));
    if (this.statusFilter()) ev = ev.filter((e) => e.status === this.statusFilter());
    return ev;
  });

  conf(s: StatusEvento): StatusInfo {
    return STATUS_CONF[s] || STATUS_CONF.planejado;
  }
  dia(d: string): string {
    return String(new Date(d + 'T12:00:00').getDate()).padStart(2, '0');
  }
  mes(d: string): string {
    return new Date(d + 'T12:00:00').toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
  }
  dataLonga(d: string): string {
    return new Date(d + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }

  abrir(): void {
    this.form = this.emptyForm();
    this.modalOpen.set(true);
  }

  editar(e: Evento): void {
    this.viewing.set(null);
    this.form = {
      id: e.id,
      titulo: e.titulo,
      data: e.data,
      horaInicio: e.horaInicio || '',
      horaFim: e.horaFim || '',
      local: e.local || '',
      responsavel: e.responsavel || '',
      status: e.status || 'planejado',
      publico: e.publico || '',
      descricao: e.descricao || '',
      observacao: e.observacao || '',
      criadoEm: e.criadoEm,
    };
    this.modalOpen.set(true);
  }

  salvar(): void {
    if (!this.form.titulo.trim()) return this.toast.show('Informe o título do evento.', 'error');
    if (!this.form.data) return this.toast.show('Informe a data do evento.', 'error');

    const obj: Evento = {
      id: this.form.id || generateId(),
      titulo: this.form.titulo.trim(),
      data: this.form.data,
      horaInicio: this.form.horaInicio,
      horaFim: this.form.horaFim,
      local: this.form.local.trim(),
      responsavel: this.form.responsavel.trim(),
      status: this.form.status,
      publico: this.form.publico,
      descricao: this.form.descricao.trim(),
      observacao: this.form.observacao.trim(),
      criadoEm: this.form.criadoEm || new Date().toISOString(),
    };
    if (this.form.id) this.data.eventos.update(obj);
    else this.data.eventos.add(obj, true);
    this.toast.show(this.form.id ? 'Evento atualizado!' : 'Evento criado!');
    this.modalOpen.set(false);
  }

  ver(e: Evento): void {
    this.viewing.set(e);
  }

  excluir(id: string): void {
    if (!confirm('Excluir este evento?')) return;
    this.data.eventos.remove(id);
    this.toast.show('Evento excluído.');
  }

  private emptyForm(): EventoForm {
    return {
      id: '', titulo: '', data: todayISO(), horaInicio: '', horaFim: '', local: '',
      responsavel: '', status: 'planejado', publico: '', descricao: '', observacao: '',
    };
  }
}
