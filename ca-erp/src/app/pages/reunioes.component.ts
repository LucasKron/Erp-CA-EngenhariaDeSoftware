import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DataService } from '../core/data.service';
import { Reuniao, StatusReuniao, TipoReuniao } from '../core/models';
import { ModalComponent } from '../shared/modal.component';
import { PageHeaderComponent } from '../shared/page-header.component';
import { IconComponent } from '../shared/icon.component';
import { ToastService } from '../core/toast.service';
import { generateId, todayISO } from '../core/utils';

const TIPO_CONF: Record<TipoReuniao, { label: string; badge: string }> = {
  ordinaria: { label: 'Ordinária', badge: 'badge-blue' },
  extraordinaria: { label: 'Extraordinária', badge: 'badge-purple' },
  planejamento: { label: 'Planejamento', badge: 'badge-yellow' },
  outros: { label: 'Outros', badge: 'badge-gray' },
};
const STATUS_REU: Record<StatusReuniao, { label: string; badge: string }> = {
  agendada: { label: 'Agendada', badge: 'badge-yellow' },
  realizada: { label: 'Realizada', badge: 'badge-green' },
  cancelada: { label: 'Cancelada', badge: 'badge-red' },
};

interface ReuniaoForm {
  id: string;
  titulo: string;
  data: string;
  hora: string;
  tipo: TipoReuniao;
  local: string;
  status: StatusReuniao;
  participantes: string;
  pauta: string;
  ata: string;
  criadoEm?: string;
}

@Component({
  selector: 'app-reunioes',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, PageHeaderComponent, ModalComponent, IconComponent],
  template: `
    <app-page-header kicker="Atas" title="Reuniões" subtitle="Atas e registros das reuniões do CA">
      <button class="btn btn-primary" (click)="abrir()"><app-icon name="plus" /> Nova Reunião</button>
    </app-page-header>

    <div class="content">
      <!-- Filtros -->
      <div class="table-card" style="margin-bottom:20px">
        <div style="padding:14px 20px">
          <div class="filters-row">
            <div class="search-input-wrap" style="flex:1;min-width:180px">
              <input type="text" class="form-control" placeholder="Buscar reunião..." [ngModel]="search()" (ngModelChange)="search.set($event)" />
            </div>
            <select class="form-control" style="width:auto" [ngModel]="tipoFilter()" (ngModelChange)="tipoFilter.set($event)">
              <option value="">Todos os tipos</option>
              <option value="ordinaria">Ordinária</option>
              <option value="extraordinaria">Extraordinária</option>
              <option value="planejamento">Planejamento</option>
              <option value="outros">Outros</option>
            </select>
            <select class="form-control" style="width:auto" [ngModel]="statusFilter()" (ngModelChange)="statusFilter.set($event)">
              <option value="">Todos os status</option>
              <option value="agendada">Agendada</option>
              <option value="realizada">Realizada</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Lista -->
      @if (filtrados().length) {
        @for (r of filtrados(); track r.id) {
          <div class="meeting-card" (click)="ver(r)">
            <div class="meeting-card-header">
              <div>
                <div class="meeting-title">{{ r.titulo }}</div>
                <div class="meeting-meta" style="margin-top:6px">
                  <span>{{ dataCurta(r.data) }}{{ r.hora ? ' · ' + r.hora : '' }}</span>
                  @if (r.local) {
                    <span>{{ r.local }}</span>
                  }
                  @if (r.participantes) {
                    <span>{{ qtdParticipantes(r.participantes) }} participante(s)</span>
                  }
                </div>
              </div>
              <div style="display:flex;gap:6px;align-items:center;flex-shrink:0;flex-wrap:wrap">
                <span class="badge {{ tipoConf(r.tipo).badge }}">{{ tipoConf(r.tipo).label }}</span>
                <span class="badge {{ statusConf(r.status).badge }}">{{ statusConf(r.status).label }}</span>
                <button type="button" class="btn btn-outline btn-sm btn-icon" (click)="$event.stopPropagation(); editar(r)" aria-label="Editar"><app-icon name="edit" /></button>
                <button type="button" class="btn btn-danger btn-sm btn-icon" (click)="$event.stopPropagation(); excluir(r.id)" aria-label="Excluir"><app-icon name="trash" /></button>
              </div>
            </div>
            @if (r.pauta) {
              <div style="margin-bottom:8px">
                <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:var(--text-dim);margin-bottom:4px">PAUTA</div>
                <div style="font-size:13px;color:var(--text-soft);white-space:pre-wrap;line-height:1.5">{{ trunca(r.pauta, 200) }}</div>
              </div>
            }
            @if (r.ata) {
              <div>
                <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:var(--text-dim);margin-bottom:4px">ATA</div>
                <div class="meeting-ata">{{ trunca(r.ata, 300) }}</div>
              </div>
            } @else if (r.status === 'realizada') {
              <div style="font-size:13px;color:var(--text-dim);font-style:italic">Ata não registrada.</div>
            }
          </div>
        }
      } @else {
        <div class="empty-state">
          <div class="empty-state-icon"><app-icon name="meetings" [size]="40" /></div>
          <h3>Nenhuma reunião encontrada</h3>
          <p>Registre as reuniões do CA para manter o histórico de decisões.</p>
          <button type="button" class="btn btn-primary" (click)="abrir()"><app-icon name="plus" /> Nova Reunião</button>
        </div>
      }
    </div>

    <!-- Modal Cadastro -->
    <app-modal [open]="modalOpen()" [lg]="true" [title]="form.id ? 'Editar Reunião' : 'Nova Reunião'" (closed)="modalOpen.set(false)">
      <div class="form-group">
        <label class="form-label">Título / Pauta principal <span>*</span></label>
        <input type="text" class="form-control" placeholder="Ex: Reunião Ordinária - Abril 2024" [(ngModel)]="form.titulo" />
      </div>
      <div class="form-row form-row-3">
        <div class="form-group">
          <label class="form-label">Data <span>*</span></label>
          <input type="date" class="form-control" [(ngModel)]="form.data" />
        </div>
        <div class="form-group">
          <label class="form-label">Horário</label>
          <input type="time" class="form-control" [(ngModel)]="form.hora" />
        </div>
        <div class="form-group">
          <label class="form-label">Tipo</label>
          <select class="form-control" [(ngModel)]="form.tipo">
            <option value="ordinaria">Ordinária</option>
            <option value="extraordinaria">Extraordinária</option>
            <option value="planejamento">Planejamento</option>
            <option value="outros">Outros</option>
          </select>
        </div>
      </div>
      <div class="form-row form-row-2">
        <div class="form-group">
          <label class="form-label">Local</label>
          <input type="text" class="form-control" placeholder="Ex: Sala do CA" [(ngModel)]="form.local" />
        </div>
        <div class="form-group">
          <label class="form-label">Status</label>
          <select class="form-control" [(ngModel)]="form.status">
            <option value="agendada">Agendada</option>
            <option value="realizada">Realizada</option>
            <option value="cancelada">Cancelada</option>
          </select>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Participantes</label>
        <input type="text" class="form-control" placeholder="Ex: Maria Silva, João Santos, Ana Costa" [(ngModel)]="form.participantes" />
        <div class="form-hint">Separe os nomes por vírgula</div>
      </div>
      <div class="form-group">
        <label class="form-label">Pauta</label>
        <textarea class="form-control" rows="3" placeholder="1. Aprovação da ata anterior&#10;2. Prestação de contas&#10;3. Assuntos gerais" [(ngModel)]="form.pauta"></textarea>
      </div>
      <div class="form-group">
        <label class="form-label">Ata / Registro da reunião</label>
        <textarea class="form-control" rows="6" placeholder="Registre o que foi discutido e decidido na reunião..." [(ngModel)]="form.ata"></textarea>
      </div>

      <ng-container modal-footer>
        <button class="btn btn-outline" (click)="modalOpen.set(false)">Cancelar</button>
        <button class="btn btn-primary" (click)="salvar()">Salvar Reunião</button>
      </ng-container>
    </app-modal>

    <!-- Modal Detalhe -->
    <app-modal [open]="!!viewing()" [lg]="true" [title]="viewing()?.titulo || 'Reunião'" (closed)="viewing.set(null)">
      @if (viewing(); as r) {
        <div style="display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap">
          <span class="badge {{ tipoConf(r.tipo).badge }}">{{ tipoConf(r.tipo).label }}</span>
          <span class="badge {{ statusConf(r.status).badge }}">{{ statusConf(r.status).label }}</span>
        </div>
        <div class="detail-row"><span class="detail-label">Data</span><span class="detail-value">{{ dataLonga(r.data) }}{{ r.hora ? ' às ' + r.hora : '' }}</span></div>
        @if (r.local) {
          <div class="detail-row"><span class="detail-label">Local</span><span class="detail-value">{{ r.local }}</span></div>
        }
        @if (r.participantes) {
          <div class="detail-row"><span class="detail-label">Participantes</span><span class="detail-value">{{ r.participantes }}</span></div>
        }
        @if (r.pauta) {
          <hr class="divider" />
          <div style="margin-bottom:4px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:var(--text-dim)">PAUTA</div>
          <div style="font-size:13.5px;color:var(--text-soft);white-space:pre-wrap;line-height:1.7;background:var(--bg-2);border-radius:8px;padding:12px">{{ r.pauta }}</div>
        }
        @if (r.ata) {
          <hr class="divider" />
          <div style="margin-bottom:4px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:var(--text-dim)">ATA COMPLETA</div>
          <div style="font-size:13.5px;color:var(--text);white-space:pre-wrap;line-height:1.8;background:var(--bg-2);border-radius:8px;padding:14px;border:1px solid var(--border)">{{ r.ata }}</div>
        }
      }

      <ng-container modal-footer>
        <button class="btn btn-danger btn-sm" (click)="excluir(viewing()!.id); viewing.set(null)"><app-icon name="trash" /> Excluir</button>
        <button class="btn btn-secondary btn-sm" (click)="editar(viewing()!)"><app-icon name="edit" /> Editar</button>
        <button class="btn btn-outline btn-sm" (click)="imprimir(viewing()!)"><app-icon name="print" /> Imprimir Ata</button>
        <button class="btn btn-outline" (click)="viewing.set(null)">Fechar</button>
      </ng-container>
    </app-modal>
  `,
})
export class ReunioesComponent {
  private readonly data = inject(DataService);
  private readonly toast = inject(ToastService);

  readonly search = signal('');
  readonly tipoFilter = signal('');
  readonly statusFilter = signal('');

  readonly modalOpen = signal(false);
  readonly viewing = signal<Reuniao | null>(null);

  form: ReuniaoForm = this.emptyForm();

  readonly filtrados = computed<Reuniao[]>(() => {
    const s = this.search().toLowerCase();
    let lista = [...this.data.reunioes.items()].sort((a, b) => b.data.localeCompare(a.data));
    if (s) lista = lista.filter((r) => r.titulo.toLowerCase().includes(s) || (r.ata || '').toLowerCase().includes(s));
    if (this.tipoFilter()) lista = lista.filter((r) => r.tipo === this.tipoFilter());
    if (this.statusFilter()) lista = lista.filter((r) => r.status === this.statusFilter());
    return lista;
  });

  tipoConf(t: TipoReuniao) {
    return TIPO_CONF[t] || TIPO_CONF.outros;
  }
  statusConf(s: StatusReuniao) {
    return STATUS_REU[s] || STATUS_REU.agendada;
  }
  trunca(txt: string, n: number): string {
    return txt.length > n ? txt.slice(0, n) + '…' : txt;
  }
  qtdParticipantes(p: string): number {
    return p.split(',').length;
  }
  dataCurta(d: string): string {
    return new Date(d + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'long', year: 'numeric' });
  }
  dataLonga(d: string): string {
    return new Date(d + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }

  abrir(): void {
    this.form = this.emptyForm();
    this.modalOpen.set(true);
  }

  editar(r: Reuniao): void {
    this.viewing.set(null);
    this.form = {
      id: r.id,
      titulo: r.titulo,
      data: r.data,
      hora: r.hora || '',
      tipo: r.tipo || 'ordinaria',
      local: r.local || '',
      status: r.status || 'agendada',
      participantes: r.participantes || '',
      pauta: r.pauta || '',
      ata: r.ata || '',
      criadoEm: r.criadoEm,
    };
    this.modalOpen.set(true);
  }

  salvar(): void {
    if (!this.form.titulo.trim()) return this.toast.show('Informe o título da reunião.', 'error');
    if (!this.form.data) return this.toast.show('Informe a data da reunião.', 'error');

    const obj: Reuniao = {
      id: this.form.id || generateId(),
      titulo: this.form.titulo.trim(),
      data: this.form.data,
      hora: this.form.hora,
      tipo: this.form.tipo,
      local: this.form.local.trim(),
      status: this.form.status,
      participantes: this.form.participantes.trim(),
      pauta: this.form.pauta.trim(),
      ata: this.form.ata.trim(),
      criadoEm: this.form.criadoEm || new Date().toISOString(),
    };
    if (this.form.id) this.data.reunioes.update(obj);
    else this.data.reunioes.add(obj, true);
    this.toast.show(this.form.id ? 'Reunião atualizada!' : 'Reunião registrada!');
    this.modalOpen.set(false);
  }

  ver(r: Reuniao): void {
    this.viewing.set(r);
  }

  excluir(id: string): void {
    if (!confirm('Excluir esta reunião e sua ata?')) return;
    this.data.reunioes.remove(id);
    this.toast.show('Reunião excluída.');
  }

  imprimir(r: Reuniao): void {
    const win = window.open('', '_blank');
    if (!win) return this.toast.show('Permita pop-ups para imprimir a ata.', 'error');

    const d = this.dataLonga(r.data);
    const css = [
      'body{font-family:"Times New Roman",serif;max-width:700px;margin:40px auto;padding:20px;line-height:1.8;color:#111}',
      'h1{font-size:18px;text-align:center;margin-bottom:4px}',
      'h2{font-size:14px;text-align:center;margin-bottom:24px;color:#555}',
      'table{margin-bottom:24px;font-size:13px}td{padding:4px 8px 4px 0}',
      '.st{font-size:13px;font-weight:bold;text-transform:uppercase;letter-spacing:1px;margin-top:20px;margin-bottom:8px}',
      '.ct{font-size:13.5px;white-space:pre-wrap}',
      '.sig{margin-top:60px;display:flex;justify-content:space-around}',
      '.sig div{text-align:center;border-top:1px solid #333;padding-top:8px;min-width:180px;font-size:12px}',
      '@media print{body{margin:20px}}',
    ].join('');

    let rows = '<tr><td><b>Título:</b></td><td>' + r.titulo + '</td></tr>';
    rows += '<tr><td><b>Data:</b></td><td>' + d + (r.hora ? ' às ' + r.hora : '') + '</td></tr>';
    if (r.local) rows += '<tr><td><b>Local:</b></td><td>' + r.local + '</td></tr>';
    if (r.participantes) rows += '<tr><td><b>Participantes:</b></td><td>' + r.participantes + '</td></tr>';

    const p1 = r.pauta ? '<div class="st">Pauta</div><div class="ct">' + r.pauta + '</div>' : '';
    const p2 = r.ata ? '<div class="st">Ata</div><div class="ct">' + r.ata + '</div>' : '';

    win.document.open();
    win.document.write('<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">');
    win.document.write('<title>Ata - ' + r.titulo + '</title><style>' + css + '</style></head><body>');
    win.document.write('<h1>Centro Academico de Engenharia de Software</h1>');
    win.document.write('<h2>PUC Toledo - Ata de Reuniao</h2>');
    win.document.write('<table>' + rows + '</table>' + p1 + p2);
    win.document.write('<div class="sig"><div>Presidente do CA</div><div>Secretario(a)</div></div>');
    win.document.write('</body></html>');
    win.document.close();
    win.print();
  }

  private emptyForm(): ReuniaoForm {
    return {
      id: '', titulo: '', data: todayISO(), hora: '', tipo: 'ordinaria', local: '',
      status: 'agendada', participantes: '', pauta: '', ata: '',
    };
  }
}
