import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-metric-card',
  standalone: true,
  imports: [MatIconModule],
  template: `
    <article class="metric" [class]="'metric metric--' + color()">
      <div class="metric__top">
        <p class="metric__label">{{ label() }}</p>
        <span class="metric__icon"><mat-icon>{{ icon() }}</mat-icon></span>
      </div>
      <p class="metric__value">{{ value() }}</p>
      @if (subtitle()) {
        <p class="metric__sub">{{ subtitle() }}</p>
      }
    </article>
  `,
  styles: [`
    :host { display: block; height: 100%; }
    .metric {
      --c: var(--tx-yellow);
      position: relative;
      overflow: hidden;
      height: 100%;
      padding: 20px 22px;
      border-radius: 20px;
      background: var(--tx-surface);
      border: 1px solid var(--tx-line);
      transition: transform .4s var(--dc-ease), border-color .3s ease;
    }
    .metric::after {
      content: '';
      position: absolute;
      right: -30px;
      bottom: -30px;
      width: 120px;
      height: 120px;
      border-radius: 50%;
      background: radial-gradient(closest-side, color-mix(in srgb, var(--c) 22%, transparent), transparent);
      pointer-events: none;
    }
    .metric:hover { transform: translateY(-3px); border-color: color-mix(in srgb, var(--c) 45%, transparent); }
    .metric--green { --c: var(--tx-green); }
    .metric--orange { --c: #ff9f1a; }
    .metric--red { --c: var(--tx-red); }
    .metric--blue { --c: var(--tx-blue); }
    .metric--yellow {
      background: var(--tx-yellow);
      border-color: var(--tx-yellow);
      color: #0a0a0a;
    }
    .metric--yellow .metric__label, .metric--yellow .metric__sub { color: rgba(10, 10, 10, 0.65); }
    .metric--yellow .metric__value { color: #0a0a0a; }
    .metric--yellow .metric__icon { background: #0a0a0a; color: var(--tx-yellow); }
    .metric--yellow::after { display: none; }

    .metric__top { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
    .metric__label {
      margin: 4px 0 0;
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--tx-text-2);
    }
    .metric__icon {
      display: grid;
      place-items: center;
      width: 40px;
      height: 40px;
      flex-shrink: 0;
      border-radius: 12px;
      color: var(--c);
      background: color-mix(in srgb, var(--c) 14%, transparent);
    }
    .metric__icon mat-icon { font-size: 22px; width: 22px; height: 22px; }
    .metric__value {
      position: relative;
      margin: 14px 0 0;
      font-family: var(--tx-display);
      font-size: 2.9rem;
      font-weight: 800;
      line-height: 1;
      color: var(--tx-text);
      white-space: nowrap;
    }
    .metric__sub { position: relative; margin: 6px 0 0; font-size: 0.8rem; color: var(--tx-text-3); }
  `],
})
export class MetricCardComponent {
  label    = input.required<string>();
  value    = input.required<string | number>();
  icon     = input.required<string>();
  subtitle = input<string>('');
  color    = input<'yellow' | 'blue' | 'green' | 'orange' | 'red'>('yellow');
}
