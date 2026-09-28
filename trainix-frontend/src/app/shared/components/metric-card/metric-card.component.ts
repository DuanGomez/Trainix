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
    .metric-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.15); }
    .card-row { display: flex; justify-content: space-between; align-items: center; }
    .info { flex: 1; }
    .label { margin: 0; font-size: 0.85rem; color: #666; font-weight: 500; text-transform: uppercase; letter-spacing: .5px; }
    .value { margin: 4px 0; font-size: 2rem; font-weight: 700; color: #212121; }
    .subtitle { margin: 0; font-size: 0.8rem; color: #999; }
    .icon-wrapper {
      width: 56px; height: 56px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      background: rgba(25,118,210,0.1);
    }
    .icon-wrapper mat-icon { font-size: 28px; width: 28px; height: 28px; color: #1976d2; }
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
