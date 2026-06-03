import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  {
    path: 'dashboard',
    title: 'Dashboard — CA ERP',
    loadComponent: () => import('./pages/dashboard.component').then((m) => m.DashboardComponent),
  },
  {
    path: 'documentos',
    title: 'Documentos — CA ERP',
    loadComponent: () => import('./pages/documentos.component').then((m) => m.DocumentosComponent),
  },
  {
    path: 'financeiro',
    title: 'Financeiro — CA ERP',
    loadComponent: () => import('./pages/financeiro.component').then((m) => m.FinanceiroComponent),
  },
  {
    path: 'membros',
    title: 'Membros — CA ERP',
    loadComponent: () => import('./pages/membros.component').then((m) => m.MembrosComponent),
  },
  {
    path: 'eventos',
    title: 'Eventos — CA ERP',
    loadComponent: () => import('./pages/eventos.component').then((m) => m.EventosComponent),
  },
  {
    path: 'reunioes',
    title: 'Reuniões — CA ERP',
    loadComponent: () => import('./pages/reunioes.component').then((m) => m.ReunioesComponent),
  },
  {
    path: 'tarefas',
    title: 'Tarefas — CA ERP',
    loadComponent: () => import('./pages/tarefas.component').then((m) => m.TarefasComponent),
  },
  { path: '**', redirectTo: 'dashboard' },
];
