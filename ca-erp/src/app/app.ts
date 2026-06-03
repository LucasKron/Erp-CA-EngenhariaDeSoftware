import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './shared/sidebar.component';
import { ToastContainerComponent } from './shared/toast-container.component';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, SidebarComponent, ToastContainerComponent],
  template: `
    <div class="layout">
      <app-sidebar />
      <main class="main">
        <router-outlet />
      </main>
    </div>
    <app-toast-container />
  `,
})
export class App {}
