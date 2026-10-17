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
      --c: var(--tx-text);
      --soft: var(--tx-surface-2);
      height: 100%;
      padding: 20px 22px;
      border-radius: 20px;
      background: var(--tx-surface);
      border: 1px solid var(--tx-line);
      transition: transform .4s var(--dc-ease), box-shadow .4s ease;
    }
    .metric:hover { transform: translateY(-2px); box-shadow: var(--tx-shadow); }
    .metric--green { --c: var(--tx-green); --soft: var(--tx-green-soft); }
    .metric--orange { --c: var(--tx-orange); --soft: var(--tx-orange-soft); }
    .metric--red { --c: var(--tx-red); --soft: var(--tx-red-soft); }
    .metric--blue { --c: var(--tx-blue); --soft: var(--tx-blue-soft); }
    .metric--yellow { --c: var(--tx-yellow-ink); --soft: var(--tx-yellow-soft); }
    .metric__top { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
    .metric__label { margin: 6px 0 0; font-size: 0.85rem; font-weight: 500; color: var(--tx-text-2); }
    .metric__icon {
      display: grid; place-items: center;
      width: 40px; height: 40px; flex-shrink: 0;
      border-radius: 12px;
      color: var(--c);
      background: var(--soft);
    }
    .metric__icon mat-icon { font-size: 21px; width: 21px; height: 21px; }
    .metric__value {
      margin: 14px 0 0;
      font-family: var(--tx-display);
      font-size: 2rem;
      font-weight: 700;
      letter-spacing: -0.04em;
      line-height: 1.05;
      color: var(--tx-text);
      white-space: nowrap;
    }
    .metric__sub { margin: 6px 0 0; font-size: 0.8rem; color: var(--tx-text-3); }
  `],
})
export class MetricCardComponent {
  label    = input.required<string>();
  value    = input.required<string | number>();
  icon     = input.required<string>();
  subtitle = input<string>('');
  color    = input<'yellow' | 'blue' | 'green' | 'orange' | 'red'>('yellow');
}
