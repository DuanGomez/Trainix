import { Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-metric-card',
  standalone: true,
  imports: [MatCardModule, MatIconModule],
  template: `
    <mat-card class="metric-card" [class]="'accent-' + color()">
      <mat-card-content>
        <div class="card-row">
          <div class="info">
            <p class="label">{{ label() }}</p>
            <h2 class="value">{{ value() }}</h2>
            @if (subtitle()) {
              <p class="subtitle">{{ subtitle() }}</p>
            }
          </div>
          <div class="icon-wrapper">
            <mat-icon>{{ icon() }}</mat-icon>
          </div>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .metric-card { cursor: default; transition: box-shadow .2s; }
    .metric-card { transition: transform .4s var(--dc-ease), box-shadow .4s ease; }
    .metric-card:hover { transform: translateY(-3px); box-shadow: 0 24px 48px -24px rgba(15,23,42,0.28); }
    .card-row { display: flex; justify-content: space-between; align-items: center; }
    .info { flex: 1; }
    .label { margin: 0; font-size: 0.78rem; color: #6e6e73; font-weight: 600; text-transform: uppercase; letter-spacing: .06em; }
    .value { margin: 6px 0 2px; font-size: 2.1rem; font-weight: 800; letter-spacing: -0.04em; color: #1d1d1f; }
    .subtitle { margin: 0; font-size: 0.8rem; color: #999; }
    .icon-wrapper {
      width: 52px; height: 52px; border-radius: 16px;
      display: flex; align-items: center; justify-content: center;
      background: color-mix(in srgb, var(--brand) 10%, white);
    }
    .icon-wrapper mat-icon { font-size: 28px; width: 28px; height: 28px; color: var(--brand); }
    .accent-green .icon-wrapper { background: rgba(46,125,50,0.1); }
    .accent-green .icon-wrapper mat-icon { color: #2e7d32; }
    .accent-orange .icon-wrapper { background: rgba(230,81,0,0.1); }
    .accent-orange .icon-wrapper mat-icon { color: #e65100; }
    .accent-red .icon-wrapper { background: rgba(198,40,40,0.1); }
    .accent-red .icon-wrapper mat-icon { color: #c62828; }
  `],
})
export class MetricCardComponent {
  label    = input.required<string>();
  value    = input.required<string | number>();
  icon     = input.required<string>();
  subtitle = input<string>('');
  color    = input<'blue' | 'green' | 'orange' | 'red'>('blue');
}
