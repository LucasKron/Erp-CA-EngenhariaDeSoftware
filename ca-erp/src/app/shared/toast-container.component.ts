import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ToastService } from '../core/toast.service';

@Component({
  selector: 'app-toast-container',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="toast-container">
      @for (t of toast.toasts(); track t.id) {
        <div class="toast toast-{{ t.type }}" [class.show]="t.show">
          <span>{{ icon(t.type) }}</span>
          <span>{{ t.message }}</span>
        </div>
      }
    </div>
  `,
})
export class ToastContainerComponent {
  readonly toast = inject(ToastService);

  icon(type: string): string {
    return type === 'success' ? '✓' : type === 'error' ? '✗' : 'ℹ';
  }
}
