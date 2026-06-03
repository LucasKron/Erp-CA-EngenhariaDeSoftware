import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DataService } from '../core/data.service';
import { Evento, Tarefa } from '../core/models';
import { PageHeaderComponent } from '../shared/page-header.component';
import { IconComponent } from '../shared/icon.component';
import { formatCurrency, formatDate } from '../core/utils';

interface StatCard {
  label: string;
  value: string | number;
  icon: string;
  color: string;
}
interface QuickAction {
  label: string;
  icon: string;
  path: string;
}

@Component({
  selector: 'app-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, PageHeaderComponent, IconComponent],
  template: `
    <app-page-header kicker="Visão geral" title="Painel" [subtitle]="hoje">
      <span style="font-family:var(--font-mono);font-size:11px;letter-spacing:.06em;color:var(--text-3);text-transform:uppercase">{{ saudacao }}</span>
    </app-page-header>

    <div class="content">
      <!-- Indicadores -->
      <div class="cards-grid">
        @for (s of stats(); track s.label) {
          <div class="stat-card">
            <div class="stat-card-top">
              <div class="stat-card-icon {{ s.color }}"><app-icon [name]="s.icon" [size]="19" /></div>
            </div>
            <div class="stat-card-value">{{ s.value }}</div>
            <div class="stat-card-label">{{ s.label }}</div>
          </div>
        }
      </div>

      <div class="grid-2">
        <!-- Próximos eventos -->
        <div class="table-card">
          <div class="table-card-header">
            <h2>Próximos Eventos</h2>
            <a routerLink="/eventos" class="btn btn-secondary btn-sm">Ver todos</a>
          </div>
          <div>
            @if (proximosEventos().length) {
              @for (e of proximosEventos(); track e.id) {
                <div class="activity-item">
                  <div class="event-date-box" style="min-width:46px">
                    <div class="event-date-day" style="font-size:22px">{{ dia(e.data) }}</div>
                    <div class="event-date-month">{{ mes(e.data) }}</div>
                  </div>
                  <div>
                    <div style="font-size:14px;font-weight:600;color:var(--text)">{{ e.titulo }}</div>
                    <div class="meta-line">{{ e.local || '—' }} · {{ e.horaInicio }}</div>
                  </div>
                </div>
              }
            } @else {
              <div class="empty-state" style="padding:36px 20px">
                <div class="empty-state-icon"><app-icon name="events" [size]="34" /></div>
                <p>Nenhum evento planejado</p>
              </div>
            }
          </div>
        </div>

        <!-- Tarefas pendentes -->
        <div class="table-card">
          <div class="table-card-header">
            <h2>Tarefas Pendentes</h2>
            <a routerLink="/tarefas" class="btn btn-secondary btn-sm">Ver todas</a>
          </div>
          <div>
            @if (tarefasPendentes().length) {
              @for (t of tarefasPendentes(); track t.id) {
                <div class="activity-item" style="gap:12px">
                  <div style="flex:1">
                    <div style="font-size:14px;font-weight:600;color:var(--text)">{{ t.titulo }}</div>
                    <div class="meta-line">
                      {{ t.responsavel || '—' }}{{ t.prazo ? ' · ' + fmtDate(t.prazo) : '' }}
                    </div>
                  </div>
                  <span class="badge {{ prioBadge(t.prioridade) }}">{{ t.prioridade }}</span>
                </div>
              }
            } @else {
              <div class="empty-state" style="padding:36px 20px">
                <div class="empty-state-icon"><app-icon name="tasks" [size]="34" /></div>
                <p>Nenhuma tarefa pendente</p>
              </div>
            }
          </div>
        </div>
      </div>

      <div class="grid-2" style="margin-bottom:0">
        <!-- Resumo financeiro -->
        <div class="table-card">
          <div class="table-card-header">
            <h2>Resumo Financeiro</h2>
            <a routerLink="/financeiro" class="btn btn-secondary btn-sm">Ver detalhes</a>
          </div>
          <div style="padding:20px">
            <div class="fin-row">
              <div class="fin-row-label" style="color:var(--green)"><app-icon name="income" [size]="16" /> Receitas</div>
              <span class="fin-row-value" style="color:var(--green)">{{ fmtCur(receitas()) }}</span>
            </div>
            <div class="fin-row">
              <div class="fin-row-label" style="color:var(--red)"><app-icon name="expense" [size]="16" /> Despesas</div>
              <span class="fin-row-value" style="color:var(--red)">{{ fmtCur(despesas()) }}</span>
            </div>
            <div class="fin-row fin-row-total">
              <div class="fin-row-label" style="color:var(--gold-2)"><app-icon name="balance" [size]="16" /> Saldo Atual</div>
              <span class="fin-row-value" style="font-size:19px" [style.color]="saldo() >= 0 ? 'var(--gold-2)' : 'var(--red)'">{{ fmtCur(saldo()) }}</span>
            </div>
            <div style="font-family:var(--font-mono);font-size:10.5px;letter-spacing:.06em;color:var(--text-3);text-align:center;margin-top:14px;text-transform:uppercase">
              {{ totalLancamentos() }} lançamento(s) registrado(s)
            </div>
          </div>
        </div>

        <!-- Acesso rápido -->
        <div class="table-card">
          <div class="table-card-header"><h2>Acesso Rápido</h2></div>
          <div style="padding:16px;display:grid;grid-template-columns:1fr 1fr;gap:12px">
            @for (a of quickActions; track a.path) {
              <a [routerLink]="a.path" class="quick-action">
                <app-icon [name]="a.icon" [size]="20" />
                <span>{{ a.label }}</span>
              </a>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .meta-line {
        font-family: var(--font-mono);
        font-size: 11px;
        letter-spacing: 0.03em;
        color: var(--text-3);
        margin-top: 4px;
        text-transform: uppercase;
      }
      .fin-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 13px 2px;
        border-bottom: 1px solid var(--hair-soft);
      }
      .fin-row-total {
        border-bottom: none;
        border-top: 1px solid var(--hair);
        margin-top: 4px;
        padding-top: 16px;
      }
      .fin-row-label {
        display: flex;
        align-items: center;
        gap: 9px;
        font-family: var(--font-mono);
        font-size: 11px;
        font-weight: 500;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }
      .fin-row-value {
        font-family: var(--font-display);
        font-size: 17px;
        font-weight: 600;
        font-variant-numeric: tabular-nums lining-nums;
      }
      .quick-action {
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 16px;
        border: 1px solid var(--hair);
        border-radius: var(--r-sm);
        color: var(--text-2);
        background: var(--panel-2);
        transition:
          color 0.16s,
          border-color 0.16s;
      }
      .quick-action span {
        font-family: var(--font-mono);
        font-size: 11px;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }
      .quick-action:hover {
        color: var(--text);
        border-color: var(--gold-line);
      }
    `,
  ],
})
export class DashboardComponent {
  private readonly data = inject(DataService);

  readonly hoje = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  readonly saudacao =
    (() => {
      const h = new Date().getHours();
      return h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';
    })();

  readonly receitas = computed(() =>
    this.data.financeiro.items().filter((f) => f.tipo === 'receita').reduce((s, f) => s + Number(f.valor), 0),
  );
  readonly despesas = computed(() =>
    this.data.financeiro.items().filter((f) => f.tipo === 'despesa').reduce((s, f) => s + Number(f.valor), 0),
  );
  readonly saldo = computed(() => this.receitas() - this.despesas());
  readonly totalLancamentos = computed(() => this.data.financeiro.items().length);

  readonly stats = computed<StatCard[]>(() => [
    { label: 'Membros Ativos', value: this.data.membros.items().filter((m) => m.ativo).length, icon: 'members', color: 'icon-blue' },
    { label: 'Documentos', value: this.data.documentos.items().length, icon: 'documents', color: 'icon-purple' },
    { label: 'Eventos Planejados', value: this.data.eventos.items().filter((e) => e.status === 'planejado').length, icon: 'events', color: 'icon-yellow' },
    { label: 'Tarefas Pendentes', value: this.data.tarefas.items().filter((t) => t.status === 'pendente').length, icon: 'tasks', color: 'icon-teal' },
    { label: 'Saldo Atual', value: formatCurrency(this.saldo()), icon: 'finance', color: this.saldo() >= 0 ? 'icon-green' : 'icon-red' },
  ]);

  readonly proximosEventos = computed<Evento[]>(() =>
    this.data.eventos
      .items()
      .filter((e) => e.status === 'planejado')
      .sort((a, b) => a.data.localeCompare(b.data))
      .slice(0, 4),
  );

  readonly tarefasPendentes = computed<Tarefa[]>(() =>
    this.data.tarefas
      .items()
      .filter((t) => t.status === 'pendente')
      .sort((a, b) => (a.prazo || '').localeCompare(b.prazo || ''))
      .slice(0, 5),
  );

  readonly quickActions: QuickAction[] = [
    { label: 'Documentos', icon: 'documents', path: '/documentos' },
    { label: 'Financeiro', icon: 'finance', path: '/financeiro' },
    { label: 'Eventos', icon: 'events', path: '/eventos' },
    { label: 'Reuniões', icon: 'meetings', path: '/reunioes' },
    { label: 'Membros', icon: 'members', path: '/membros' },
    { label: 'Tarefas', icon: 'tasks', path: '/tarefas' },
  ];

  fmtCur = formatCurrency;
  fmtDate = formatDate;

  dia(data: string): string {
    return String(new Date(data + 'T12:00:00').getDate()).padStart(2, '0');
  }
  mes(data: string): string {
    return new Date(data + 'T12:00:00').toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
  }
  prioBadge(p: string): string {
    return { alta: 'badge-red', media: 'badge-yellow', baixa: 'badge-green' }[p] || 'badge-gray';
  }
}
