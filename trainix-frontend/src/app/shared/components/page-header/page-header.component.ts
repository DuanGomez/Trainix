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
    .header-text { flex: 1; min-width: 0; }
    .page-title {
      margin: 0;
      font-family: var(--tx-display);
      font-size: clamp(2.2rem, 4vw, 3rem);
      font-weight: 900;
      font-style: italic;
      text-transform: uppercase;
      line-height: 0.95;
      color: var(--tx-text);
    }
    .page-title::after {
      content: "";
      display: block;
      width: 44px;
      height: 4px;
      margin-top: 12px;
      border-radius: 4px;
      background: var(--tx-yellow);
    }
    .page-subtitle { margin: 12px 0 0; color: var(--tx-text-2); font-size: 0.95rem; }
  `],
})
export class PageHeaderComponent {
  title       = input.required<string>();
  subtitle    = input<string>('');
  actionLabel = input<string>('');
  actionIcon  = input<string>('add');
  actionClick = output<void>();
}
