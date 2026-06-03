import { ChangeDetectionStrategy, Component, Input, inject } from '@angular/core';
import { LayoutService } from '../core/layout.service';
import { IconComponent } from './icon.component';

@Component({
  selector: 'app-page-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  template: `
    <header class="topbar">
      <div style="display:flex;align-items:center;gap:14px">
        <button type="button" class="menu-toggle" (click)="layout.toggle()" aria-label="Menu">
          <app-icon name="menu" />
        </button>
        <div class="topbar-left">
          @if (kicker) {
            <span class="kicker" style="margin-bottom:7px">{{ kicker }}</span>
          }
          <h1>{{ title }}</h1>
          @if (subtitle) {
            <p>{{ subtitle }}</p>
          }
        </div>
      </div>
      <div class="topbar-right">
        <ng-content></ng-content>
      </div>
    </header>
  `,
})
export class PageHeaderComponent {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() kicker = '';
  readonly layout = inject(LayoutService);
}
