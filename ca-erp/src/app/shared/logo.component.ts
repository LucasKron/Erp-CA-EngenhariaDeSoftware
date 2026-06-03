import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-logo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg
      [attr.width]="size"
      [attr.height]="size"
      viewBox="0 0 100 100"
      role="img"
      aria-label="CA Engenharia de Software"
      style="display:block"
    >
      <defs>
        <linearGradient [attr.id]="goldId" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#e7cd86" />
          <stop offset="0.5" stop-color="#c8a24c" />
          <stop offset="1" stop-color="#8a6a28" />
        </linearGradient>
      </defs>

      <circle cx="50" cy="50" r="47" fill="#0a0f1e" [attr.stroke]="'url(#' + goldId + ')'" stroke-width="2.5" />
      <circle cx="50" cy="50" r="40" fill="none" stroke="#c8a24c" stroke-opacity="0.3" stroke-width="1" />

      <g fill="#c8a24c">
        <circle cx="50" cy="7" r="1.5" />
        <circle cx="93" cy="50" r="1.5" />
        <circle cx="50" cy="93" r="1.5" />
        <circle cx="7" cy="50" r="1.5" />
      </g>

      <text x="50" y="43" text-anchor="middle" font-family="'IBM Plex Mono','SFMono-Regular',monospace" font-size="15" font-weight="600" fill="#3b6fe0">&lt;/&gt;</text>
      <text x="50" y="73" text-anchor="middle" font-family="'Fraunces','Georgia',serif" font-size="30" font-weight="600" letter-spacing="0.5" [attr.fill]="'url(#' + goldId + ')'">CA</text>
    </svg>
  `,
})
export class LogoComponent {
  @Input() size = 44;

  // id único por instância p/ evitar colisão de gradientes
  private static counter = 0;
  private readonly uid = LogoComponent.counter++;
  readonly goldId = `caGold${this.uid}`;
}
