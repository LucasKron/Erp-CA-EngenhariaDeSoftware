import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostListener,
  Input,
  Output,
} from '@angular/core';
import { IconComponent } from './icon.component';

@Component({
  selector: 'app-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  template: `
    @if (open) {
      <div class="modal-backdrop" (click)="onBackdrop($event)">
        <div class="modal" [class.modal-lg]="lg">
          <div class="modal-header">
            <h3>{{ title }}</h3>
            <button type="button" class="modal-close" (click)="closed.emit()" aria-label="Fechar">
              <app-icon name="close" />
            </button>
          </div>
          <div class="modal-body">
            <ng-content></ng-content>
          </div>
          <div class="modal-footer">
            <ng-content select="[modal-footer]"></ng-content>
          </div>
        </div>
      </div>
    }
  `,
})
export class ModalComponent {
  @Input() open = false;
  @Input() title = '';
  @Input() lg = false;
  @Output() closed = new EventEmitter<void>();

  onBackdrop(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.closed.emit();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.open) this.closed.emit();
  }
}
