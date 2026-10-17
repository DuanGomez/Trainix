import { Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  template: `
    <div class="page-header">
      <div class="header-text">
        <h1 class="page-title">{{ title() }}</h1>
        @if (subtitle()) {
          <p class="page-subtitle">{{ subtitle() }}</p>
        }
      </div>
      @if (actionLabel()) {
        <button mat-flat-button color="primary" (click)="actionClick.emit()">
          <mat-icon>{{ actionIcon() }}</mat-icon>
          {{ actionLabel() }}
        </button>
      }
      <ng-content />
    </div>
  `,
  styles: [`
    .page-header {
      display: flex; align-items: flex-end; justify-content: space-between;
      margin-bottom: 28px; gap: 16px; flex-wrap: wrap;
    }
    .header-text { flex: 1; min-width: min(240px, 100%); }
    .page-title {
      margin: 0;
      font-family: var(--tx-display);
      font-size: clamp(1.7rem, 3vw, 2.1rem);
      font-weight: 700;
      letter-spacing: -0.035em;
      line-height: 1.1;
      color: var(--tx-text);
    }
    .page-subtitle { margin: 6px 0 0; color: var(--tx-text-3); font-size: 0.95rem; }
  `],
})
export class PageHeaderComponent {
  title       = input.required<string>();
  subtitle    = input<string>('');
  actionLabel = input<string>('');
  actionIcon  = input<string>('add');
  actionClick = output<void>();
}
