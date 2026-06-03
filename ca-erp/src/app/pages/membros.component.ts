import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DataService } from '../core/data.service';
import { Membro } from '../core/models';
import { ModalComponent } from '../shared/modal.component';
import { PageHeaderComponent } from '../shared/page-header.component';
import { IconComponent } from '../shared/icon.component';
import { ToastService } from '../core/toast.service';
import { formatDate, generateId, getInitials, todayISO } from '../core/utils';

const CARGOS = [
  'Presidente', 'Vice-Presidente', 'Tesoureiro(a)', 'Secretário(a)',
  'Diretor(a) de Eventos', 'Diretor(a) de Comunicação', 'Diretor(a) de Esportes',
  'Diretor(a) de Cultura', 'Membro',
];
const PERIODOS = ['1° período', '2° período', '3° período', '4° período', '5° período', '6° período', '7° período', '8° período'];
const CARGO_CORES: Record<string, string> = {
  Presidente: 'badge-purple',
  'Vice-Presidente': 'badge-blue',
  'Tesoureiro(a)': 'badge-green',
  'Secretário(a)': 'badge-teal',
  'Diretor(a) de Eventos': 'badge-yellow',
  'Diretor(a) de Comunicação': 'badge-orange',
  Membro: 'badge-gray',
};

interface MembroForm {
  id: string;
  nome: string;
  cargo: string;
  periodo: string;
  email: string;
  telefone: string;
  dataEntrada: string;
  ativo: string;
  observacao: string;
}

@Component({
  selector: 'app-membros',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, PageHeaderComponent, ModalComponent, IconComponent],
  template: `
    <app-page-header kicker="Diretoria" title="Membros" subtitle="Gestão dos membros do Centro Acadêmico">
      <button class="btn btn-primary" (click)="abrir()"><app-icon name="plus" /> Novo Membro</button>
    </app-page-header>

    <div class="content">
      <!-- Stats -->
      <div class="cards-grid" style="margin-bottom:30px">
        <div class="stat-card">
          <div class="stat-card-top"><div class="stat-card-icon icon-blue"><app-icon name="members" [size]="19" /></div></div>
          <div class="stat-card-value">{{ total() }}</div>
          <div class="stat-card-label">Total de Membros</div>
        </div>
        <div class="stat-card">
          <div class="stat-card-top"><div class="stat-card-icon icon-green"><app-icon name="check" [size]="19" /></div></div>
          <div class="stat-card-value">{{ ativos() }}</div>
          <div class="stat-card-label">Membros Ativos</div>
        </div>
        <div class="stat-card">
          <div class="stat-card-top"><div class="stat-card-icon icon-red"><app-icon name="minus" [size]="19" /></div></div>
          <div class="stat-card-value">{{ inativos() }}</div>
          <div class="stat-card-label">Membros Inativos</div>
        </div>
      </div>

      <!-- Filtros -->
      <div class="table-card" style="margin-bottom:20px">
        <div style="padding:14px 20px">
          <div class="filters-row">
            <div class="search-input-wrap" style="flex:1;min-width:180px">
              <input type="text" class="form-control" placeholder="Buscar membro..." [ngModel]="search()" (ngModelChange)="search.set($event)" />
            </div>
            <select class="form-control" style="width:auto" [ngModel]="cargoFilter()" (ngModelChange)="cargoFilter.set($event)">
              <option value="">Todos os cargos</option>
              @for (c of cargos; track c) {
                <option [value]="c">{{ c }}</option>
              }
            </select>
            <select class="form-control" style="width:auto" [ngModel]="statusFilter()" (ngModelChange)="statusFilter.set($event)">
              <option value="">Todos</option>
              <option value="1">Ativos</option>
              <option value="0">Inativos</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Tabela -->
      <div class="table-card">
        <div class="table-card-header">
          <h2>Lista de Membros</h2>
          <span style="font-size:13px;color:var(--text-dim)">{{ filtrados().length }} membro(s)</span>
        </div>
        @if (filtrados().length) {
          <div class="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Membro</th><th>Cargo</th><th>Período</th><th>Contato</th>
                  <th>Status</th><th>Desde</th><th style="text-align:center">Ações</th>
                </tr>
              </thead>
              <tbody>
                @for (m of filtrados(); track m.id) {
                  <tr style="cursor:pointer" (click)="ver(m)">
                    <td>
                      <div style="display:flex;align-items:center;gap:10px">
                        <div class="member-avatar">{{ iniciais(m.nome) }}</div>
                        <div>
                          <div style="font-weight:600;color:#fff">{{ m.nome }}</div>
                          @if (m.email) {
                            <div style="font-size:12px;color:var(--text-dim)">{{ m.email }}</div>
                          }
                        </div>
                      </div>
                    </td>
                    <td><span class="badge {{ cargoCor(m.cargo) }}">{{ m.cargo || '—' }}</span></td>
                    <td>{{ m.periodo || '—' }}</td>
                    <td style="font-size:13px">{{ m.telefone || '—' }}</td>
                    <td><span class="badge {{ m.ativo ? 'badge-green' : 'badge-gray' }}">{{ m.ativo ? 'Ativo' : 'Inativo' }}</span></td>
                    <td style="white-space:nowrap">{{ m.dataEntrada ? fmtDate(m.dataEntrada) : '—' }}</td>
                    <td style="text-align:center;white-space:nowrap">
                      <button type="button" class="btn btn-outline btn-sm btn-icon" (click)="$event.stopPropagation(); editar(m)" aria-label="Editar"><app-icon name="edit" /></button>
                      <button type="button" class="btn btn-danger btn-sm btn-icon" (click)="$event.stopPropagation(); excluir(m.id)" aria-label="Excluir"><app-icon name="trash" /></button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        } @else {
          <div class="empty-state">
            <div class="empty-state-icon"><app-icon name="members" [size]="40" /></div>
            <h3>Nenhum membro encontrado</h3>
            <p>Adicione os membros do CA clicando em "Novo Membro".</p>
          </div>
        }
      </div>
    </div>

    <!-- Modal Cadastro -->
    <app-modal [open]="modalOpen()" [title]="form.id ? 'Editar Membro' : 'Novo Membro'" (closed)="modalOpen.set(false)">
      <div class="form-group">
        <label class="form-label">Nome completo <span>*</span></label>
        <input type="text" class="form-control" placeholder="Nome do membro" [(ngModel)]="form.nome" />
      </div>
      <div class="form-row form-row-2">
        <div class="form-group">
          <label class="form-label">Cargo <span>*</span></label>
          <select class="form-control" [(ngModel)]="form.cargo">
            <option value="">Selecionar...</option>
            @for (c of cargos; track c) {
              <option [value]="c">{{ c }}</option>
            }
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Período</label>
          <select class="form-control" [(ngModel)]="form.periodo">
            <option value="">Selecionar...</option>
            @for (p of periodos; track p) {
              <option [value]="p">{{ p }}</option>
            }
          </select>
        </div>
      </div>
      <div class="form-row form-row-2">
        <div class="form-group">
          <label class="form-label">E-mail</label>
          <input type="email" class="form-control" placeholder="email@pucpr.edu.br" [(ngModel)]="form.email" />
        </div>
        <div class="form-group">
          <label class="form-label">Telefone/WhatsApp</label>
          <input type="tel" class="form-control" placeholder="(45) 99999-0000" [(ngModel)]="form.telefone" />
        </div>
      </div>
      <div class="form-row form-row-2">
        <div class="form-group">
          <label class="form-label">Data de entrada</label>
          <input type="date" class="form-control" [(ngModel)]="form.dataEntrada" />
        </div>
        <div class="form-group">
          <label class="form-label">Status</label>
          <select class="form-control" [(ngModel)]="form.ativo">
            <option value="1">Ativo</option>
            <option value="0">Inativo</option>
          </select>
        </div>
      </div>
      <div class="form-group">
        <label class="form-label">Observação</label>
        <textarea class="form-control" rows="2" placeholder="Informações adicionais..." [(ngModel)]="form.observacao"></textarea>
      </div>

      <ng-container modal-footer>
        <button class="btn btn-outline" (click)="modalOpen.set(false)">Cancelar</button>
        <button class="btn btn-primary" (click)="salvar()">Salvar</button>
      </ng-container>
    </app-modal>

    <!-- Modal Perfil -->
    <app-modal [open]="!!viewing()" title="Perfil do Membro" (closed)="viewing.set(null)">
      @if (viewing(); as m) {
        <div style="display:flex;align-items:center;gap:16px;margin-bottom:20px">
          <div class="member-avatar" style="width:56px;height:56px;font-size:20px">{{ iniciais(m.nome) }}</div>
          <div>
            <div style="font-size:18px;font-weight:700;color:#fff">{{ m.nome }}</div>
            <span class="badge {{ cargoCor(m.cargo) }}" style="margin-top:4px">{{ m.cargo || 'Sem cargo' }}</span>
            <span class="badge {{ m.ativo ? 'badge-green' : 'badge-gray' }}" style="margin-left:6px">{{ m.ativo ? 'Ativo' : 'Inativo' }}</span>
          </div>
        </div>
        <hr class="divider" />
        @if (m.periodo) {
          <div class="detail-row"><span class="detail-label">Período</span><span class="detail-value">{{ m.periodo }}</span></div>
        }
        @if (m.email) {
          <div class="detail-row">
            <span class="detail-label">E-mail</span>
            <span class="detail-value"><a [href]="'mailto:' + m.email" style="color:var(--gold-2)">{{ m.email }}</a></span>
          </div>
        }
        @if (m.telefone) {
          <div class="detail-row"><span class="detail-label">Telefone</span><span class="detail-value">{{ m.telefone }}</span></div>
        }
        @if (m.dataEntrada) {
          <div class="detail-row"><span class="detail-label">Membro desde</span><span class="detail-value">{{ fmtDate(m.dataEntrada) }}</span></div>
        }
        @if (m.observacao) {
          <hr class="divider" />
          <div style="font-size:13px;color:var(--text-soft);background:var(--bg-2);border-radius:8px;padding:12px">{{ m.observacao }}</div>
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
export class MembrosComponent {
  private readonly data = inject(DataService);
  private readonly toast = inject(ToastService);

  readonly cargos = CARGOS;
  readonly periodos = PERIODOS;

  readonly search = signal('');
  readonly cargoFilter = signal('');
  readonly statusFilter = signal('');

  readonly modalOpen = signal(false);
  readonly viewing = signal<Membro | null>(null);

  form: MembroForm = this.emptyForm();

  readonly total = computed(() => this.data.membros.items().length);
  readonly ativos = computed(() => this.data.membros.items().filter((m) => m.ativo).length);
  readonly inativos = computed(() => this.data.membros.items().filter((m) => !m.ativo).length);

  readonly filtrados = computed<Membro[]>(() => {
    const s = this.search().toLowerCase();
    let lista = this.data.membros.items();
    if (s)
      lista = lista.filter(
        (m) =>
          m.nome.toLowerCase().includes(s) ||
          (m.email || '').toLowerCase().includes(s) ||
          (m.cargo || '').toLowerCase().includes(s),
      );
    if (this.cargoFilter()) lista = lista.filter((m) => m.cargo === this.cargoFilter());
    if (this.statusFilter() !== '') lista = lista.filter((m) => String(m.ativo ? 1 : 0) === this.statusFilter());
    return lista;
  });

  fmtDate = formatDate;
  iniciais = getInitials;
  cargoCor = (c: string) => CARGO_CORES[c] || 'badge-gray';

  abrir(): void {
    this.form = this.emptyForm();
    this.modalOpen.set(true);
  }

  editar(m: Membro): void {
    this.viewing.set(null);
    this.form = {
      id: m.id,
      nome: m.nome,
      cargo: m.cargo || '',
      periodo: m.periodo || '',
      email: m.email || '',
      telefone: m.telefone || '',
      dataEntrada: m.dataEntrada || todayISO(),
      ativo: m.ativo ? '1' : '0',
      observacao: m.observacao || '',
    };
    this.modalOpen.set(true);
  }

  salvar(): void {
    if (!this.form.nome.trim()) return this.toast.show('Informe o nome do membro.', 'error');
    if (!this.form.cargo) return this.toast.show('Selecione o cargo.', 'error');

    const obj: Membro = {
      id: this.form.id || generateId(),
      nome: this.form.nome.trim(),
      cargo: this.form.cargo,
      periodo: this.form.periodo,
      email: this.form.email.trim(),
      telefone: this.form.telefone.trim(),
      dataEntrada: this.form.dataEntrada,
      ativo: this.form.ativo === '1',
      observacao: this.form.observacao.trim(),
    };
    if (this.form.id) this.data.membros.update(obj);
    else this.data.membros.add(obj);
    this.toast.show(this.form.id ? 'Membro atualizado!' : 'Membro adicionado!');
    this.modalOpen.set(false);
  }

  ver(m: Membro): void {
    this.viewing.set(m);
  }

  excluir(id: string): void {
    if (!confirm('Excluir este membro?')) return;
    this.data.membros.remove(id);
    this.toast.show('Membro excluído.');
  }

  private emptyForm(): MembroForm {
    return { id: '', nome: '', cargo: '', periodo: '', email: '', telefone: '', dataEntrada: todayISO(), ativo: '1', observacao: '' };
  }
}
