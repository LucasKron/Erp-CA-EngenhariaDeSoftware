import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LayoutService } from '../core/layout.service';
import { LogoComponent } from './logo.component';
import { IconComponent } from './icon.component';

interface NavItem {
  path: string;
  icon: string;
  label: string;
}

@Component({
  selector: 'app-sidebar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, LogoComponent, IconComponent],
  template: `
    <aside class="sidebar" [class.open]="layout.sidebarOpen()">
      <div class="sidebar-logo">
        <app-logo [size]="46" />
        <div class="sidebar-logo-text">
          <div class="sidebar-logo-title">Eng. de Software</div>
          <div class="sidebar-logo-sub">Centro Acadêmico</div>
        </div>
      </div>

      <nav class="sidebar-nav">
        <div class="nav-group-title">Navegação</div>
        @for (item of navItems; track item.path; let i = $index) {
          <a class="nav-item" [routerLink]="item.path" routerLinkActive="active" (click)="layout.close()">
            <span class="nav-index">{{ pad(i + 1) }}</span>
            <span class="nav-icon"><app-icon [name]="item.icon" [size]="17" /></span>
            <span>{{ item.label }}</span>
          </a>
        }
      </nav>

      <div class="sidebar-bottom">
        <a
          href="https://erp-ca-engenharia-de-software.vercel.app/login.html"
          target="_blank"
          rel="noopener"
          class="admin-link"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <rect x="5" y="11" width="14" height="10" rx="2"/>
            <path d="M8 11V7a4 4 0 0 1 8 0v4"/>
          </svg>
          Área da Diretoria
        </a>
        <div class="sidebar-footer">PUC · TOLEDO — ERP v{{ version }}</div>
      </div>
    </aside>
  `,
})
export class SidebarComponent {
  readonly layout = inject(LayoutService);
  readonly version = '1.0.0';

  readonly navItems: NavItem[] = [
    { path: '/dashboard', icon: 'dashboard', label: 'Painel' },
    { path: '/documentos', icon: 'documents', label: 'Documentos' },
    { path: '/financeiro', icon: 'finance', label: 'Financeiro' },
    { path: '/membros', icon: 'members', label: 'Membros' },
    { path: '/eventos', icon: 'events', label: 'Eventos' },
    { path: '/reunioes', icon: 'meetings', label: 'Reuniões' },
    { path: '/tarefas', icon: 'tasks', label: 'Tarefas' },
  ];

  pad(n: number): string {
    return String(n).padStart(2, '0');
  }
}
