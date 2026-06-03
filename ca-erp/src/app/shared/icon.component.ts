import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

/** Ícones de traço (estilo line), herdam currentColor. Substituem os emojis. */
@Component({
  selector: 'app-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg
      [attr.width]="size"
      [attr.height]="size"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.7"
      stroke-linecap="round"
      stroke-linejoin="round"
      style="display:block"
      aria-hidden="true"
    >
      @switch (name) {
        @case ('dashboard') {
          <rect x="3" y="3" width="7" height="9" rx="1" />
          <rect x="14" y="3" width="7" height="5" rx="1" />
          <rect x="14" y="12" width="7" height="9" rx="1" />
          <rect x="3" y="16" width="7" height="5" rx="1" />
        }
        @case ('documents') {
          <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
          <path d="M14 3v5h5" />
          <path d="M9 13h6M9 17h5" />
        }
        @case ('file') {
          <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
          <path d="M14 3v5h5" />
        }
        @case ('finance') {
          <rect x="2.5" y="6" width="19" height="12" rx="2" />
          <circle cx="12" cy="12" r="2.4" />
          <path d="M6 12h.01M18 12h.01" />
        }
        @case ('members') {
          <path d="M16 19v-1.5a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4V19" />
          <circle cx="9.5" cy="7.5" r="3.2" />
          <path d="M21 19v-1.5a4 4 0 0 0-3-3.85" />
          <path d="M15.5 4.15a4 4 0 0 1 0 7.2" />
        }
        @case ('events') {
          <rect x="3" y="4.5" width="18" height="16" rx="2" />
          <path d="M3 9.5h18M8 2.5v4M16 2.5v4" />
        }
        @case ('meetings') {
          <rect x="5" y="4" width="14" height="17" rx="2" />
          <path d="M9 4V3.2a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1V4" />
          <path d="M9 11h6M9 15h4" />
        }
        @case ('tasks') {
          <rect x="3.5" y="3.5" width="17" height="17" rx="2.5" />
          <path d="M8.5 12l2.5 2.5L16 9" />
        }
        @case ('check') {
          <path d="M5 12.5l4.5 4.5L19 7" />
        }
        @case ('upload') {
          <path d="M12 15V4" />
          <path d="M7.5 8.5L12 4l4.5 4.5" />
          <path d="M4 16v2.5A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V16" />
        }
        @case ('download') {
          <path d="M12 4v11" />
          <path d="M7.5 10.5L12 15l4.5-4.5" />
          <path d="M4 17v1.5A1.5 1.5 0 0 0 5.5 20h13a1.5 1.5 0 0 0 1.5-1.5V17" />
        }
        @case ('edit') {
          <path d="M4 20h4L18.5 9.5a2.12 2.12 0 0 0-3-3L5 17z" />
          <path d="M13.5 6.5l3 3" />
        }
        @case ('trash') {
          <path d="M4 7h16" />
          <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
          <path d="M6.5 7l.8 12a1 1 0 0 0 1 .95h7.4a1 1 0 0 0 1-.95L17.5 7" />
          <path d="M10 11v6M14 11v6" />
        }
        @case ('print') {
          <path d="M6.5 9V4h11v5" />
          <path d="M6.5 18H5a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-1.5" />
          <rect x="7" y="14" width="10" height="6" rx="1" />
        }
        @case ('plus') {
          <path d="M12 5v14M5 12h14" />
        }
        @case ('minus') {
          <path d="M5 12h14" />
        }
        @case ('close') {
          <path d="M6 6l12 12M18 6L6 18" />
        }
        @case ('menu') {
          <path d="M4 7h16M4 12h16M4 17h16" />
        }
        @case ('income') {
          <path d="M7 17L17 7" />
          <path d="M9 7h8v8" />
        }
        @case ('expense') {
          <path d="M7 7l10 10" />
          <path d="M17 9v8H9" />
        }
        @case ('balance') {
          <path d="M3 21h18" />
          <path d="M12 3L4 7.5h16z" />
          <path d="M6 10v8M10 10v8M14 10v8M18 10v8" />
        }
        @case ('clock') {
          <circle cx="12" cy="12" r="8.5" />
          <path d="M12 7.5V12l3 2" />
        }
        @case ('activity') {
          <path d="M3 12h3.6l2.2 6 3.8-13 2.4 9 1.6-2H21" />
        }
        @default {
          <circle cx="12" cy="12" r="3" />
        }
      }
    </svg>
  `,
})
export class IconComponent {
  @Input({ required: true }) name!: string;
  @Input() size = 18;
}
