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
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 24px; gap: 16px;
    }
    .header-text { flex: 1; }
    .page-title { margin: 0; font-size: 1.6rem; font-weight: 700; color: #212121; }
    .page-subtitle { margin: 4px 0 0; color: #666; font-size: 0.9rem; }
  `],
})
export class PageHeaderComponent {
  title       = input.required<string>();
  subtitle    = input<string>('');
  actionLabel = input<string>('');
  actionIcon  = input<string>('add');
  actionClick = output<void>();
}
